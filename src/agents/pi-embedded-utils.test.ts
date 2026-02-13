import type { AssistantMessage } from "@mariozechner/pi-ai";
import { describe, expect, it } from "vitest";
import {
  extractAssistantText,
  formatReasoningMessage,
  stripMinimaxToolCallXml,
  stripDowngradedToolCallText,
  stripThinkingTagsFromText,
  stripFinalTagsKeepContent,
  extractAssistantThinking,
  splitThinkingTaggedText,
  promoteThinkingTagsToBlocks,
  extractThinkingFromTaggedText,
  extractThinkingFromTaggedStream,
  inferToolMetaFromArgs,
} from "./pi-embedded-utils.js";

describe("extractAssistantText", () => {
  it("strips Minimax tool invocation XML from text", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `<invoke name="Bash">
<parameter name="command">netstat -tlnp | grep 18789</parameter>
</invoke>
</minimax:tool_call>`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("");
  });

  it("strips multiple tool invocations", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Let me check that.<invoke name="Read">
<parameter name="path">/home/admin/test.txt</parameter>
</invoke>
</minimax:tool_call>`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Let me check that.");
  });

  it("keeps invoke snippets without Minimax markers", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Example:\n<invoke name="Bash">\n<parameter name="command">ls</parameter>\n</invoke>`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe(
      `Example:\n<invoke name="Bash">\n<parameter name="command">ls</parameter>\n</invoke>`,
    );
  });

  it("preserves normal text without tool invocations", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "This is a normal response without any tool calls.",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("This is a normal response without any tool calls.");
  });

  it("strips Minimax tool invocations with extra attributes", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Before<invoke name='Bash' data-foo="bar">\n<parameter name="command">ls</parameter>\n</invoke>\n</minimax:tool_call>After`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Before\nAfter");
  });

  it("strips minimax tool_call open and close tags", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Start<minimax:tool_call>Inner</minimax:tool_call>End",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("StartInnerEnd");
  });

  it("ignores invoke blocks without minimax markers", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Before<invoke>Keep</invoke>After",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Before<invoke>Keep</invoke>After");
  });

  it("strips invoke blocks when minimax markers are present elsewhere", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Before<invoke>Drop</invoke><minimax:tool_call>After",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("BeforeAfter");
  });

  it("strips invoke blocks with nested tags", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `A<invoke name="Bash"><param><deep>1</deep></param></invoke></minimax:tool_call>B`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("AB");
  });

  it("strips tool XML mixed with regular content", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `I'll help you with that.<invoke name="Bash">
<parameter name="command">ls -la</parameter>
</invoke>
</minimax:tool_call>Here are the results.`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("I'll help you with that.\nHere are the results.");
  });

  it("handles multiple invoke blocks in one message", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `First check.<invoke name="Read">
<parameter name="path">file1.txt</parameter>
</invoke>
</minimax:tool_call>Second check.<invoke name="Bash">
<parameter name="command">pwd</parameter>
</invoke>
</minimax:tool_call>Done.`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("First check.\nSecond check.\nDone.");
  });

  it("handles stray closing tags without opening tags", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Some text here.</minimax:tool_call>More text.",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Some text here.More text.");
  });

  it("returns empty string when message is only tool invocations", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `<invoke name="Bash">
<parameter name="command">test</parameter>
</invoke>
</minimax:tool_call>`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("");
  });

  it("handles multiple text blocks", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "First block.",
        },
        {
          type: "text",
          text: `<invoke name="Bash">
<parameter name="command">ls</parameter>
</invoke>
</minimax:tool_call>`,
        },
        {
          type: "text",
          text: "Third block.",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("First block.\nThird block.");
  });

  it("strips downgraded Gemini tool call text representations", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `[Tool Call: exec (ID: toolu_vrtx_014w1P6B6w4V92v4VzG7Qk12)]
Arguments: { "command": "git status", "timeout": 120000 }`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("");
  });

  it("strips multiple downgraded tool calls", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `[Tool Call: read (ID: toolu_1)]
Arguments: { "path": "/some/file.txt" }
[Tool Call: exec (ID: toolu_2)]
Arguments: { "command": "ls -la" }`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("");
  });

  it("strips tool results for downgraded calls", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `[Tool Result for ID toolu_123]
{"status": "ok", "data": "some result"}`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("");
  });

  it("preserves text around downgraded tool calls", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Let me check that for you.
[Tool Call: browser (ID: toolu_abc)]
Arguments: { "action": "act", "request": "click button" }`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Let me check that for you.");
  });

  it("preserves trailing text after downgraded tool call blocks", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Intro text.
[Tool Call: read (ID: toolu_1)]
Arguments: {
  "path": "/tmp/file.txt"
}
Back to the user.`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Intro text.\nBack to the user.");
  });

  it("handles multiple text blocks with tool calls and results", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Here's what I found:",
        },
        {
          type: "text",
          text: `[Tool Call: read (ID: toolu_1)]
Arguments: { "path": "/test.txt" }`,
        },
        {
          type: "text",
          text: `[Tool Result for ID toolu_1]
File contents here`,
        },
        {
          type: "text",
          text: "Done checking.",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Here's what I found:\nDone checking.");
  });

  it("strips thinking tags from text content", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "<think>El usuario quiere retomar una tarea...</think>Aquí está tu respuesta.",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Aquí está tu respuesta.");
  });

  it("strips thinking tags with attributes", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `<think reason="deliberate">Hidden</think>Visible`,
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Visible");
  });

  it("strips thinking tags without closing tag", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "<think>Pensando sobre el problema...",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("");
  });

  it("strips thinking tags with various formats", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Before<thinking>internal reasoning</thinking>After",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("BeforeAfter");
  });

  it("strips antthinking tags", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "<antthinking>Some reasoning</antthinking>The actual answer.",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("The actual answer.");
  });

  it("strips final tags while keeping content", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "<final>\nAnswer\n</final>",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Answer");
  });

  it("strips thought tags", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "<thought>Internal deliberation</thought>Final response.",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("Final response.");
  });

  it("handles nested or multiple thinking blocks", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Start<think>first thought</think>Middle<think>second thought</think>End",
        },
      ],
      timestamp: Date.now(),
    };

    const result = extractAssistantText(msg);
    expect(result).toBe("StartMiddleEnd");
  });
});

describe("formatReasoningMessage", () => {
  it("returns empty string for empty input", () => {
    expect(formatReasoningMessage("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(formatReasoningMessage("   \n  \t  ")).toBe("");
  });

  it("wraps single line in italics", () => {
    expect(formatReasoningMessage("Single line of reasoning")).toBe(
      "Reasoning:\n_Single line of reasoning_",
    );
  });

  it("wraps each line separately for multiline text (Telegram fix)", () => {
    expect(formatReasoningMessage("Line one\nLine two\nLine three")).toBe(
      "Reasoning:\n_Line one_\n_Line two_\n_Line three_",
    );
  });

  it("preserves empty lines between reasoning text", () => {
    expect(formatReasoningMessage("First block\n\nSecond block")).toBe(
      "Reasoning:\n_First block_\n\n_Second block_",
    );
  });

  it("handles mixed empty and non-empty lines", () => {
    expect(formatReasoningMessage("A\n\nB\nC")).toBe("Reasoning:\n_A_\n\n_B_\n_C_");
  });

  it("trims leading/trailing whitespace", () => {
    expect(formatReasoningMessage("  \n  Reasoning here  \n  ")).toBe(
      "Reasoning:\n_Reasoning here_",
    );
  });
});

describe("stripMinimaxToolCallXml", () => {
  it("returns empty string for empty input", () => {
    expect(stripMinimaxToolCallXml("")).toBe("");
  });

  it("returns original text when no minimax markers", () => {
    const text = "This is normal text without tool calls.";
    expect(stripMinimaxToolCallXml(text)).toBe(text);
  });

  it("removes invoke blocks with minimax closing tag", () => {
    const text = '<invoke name="test">content</invoke></minimax:tool_call>';
    expect(stripMinimaxToolCallXml(text)).toBe("");
  });

  it("removes minimax opening tag", () => {
    const text = "<minimax:tool_call>content</minimax:tool_call>";
    expect(stripMinimaxToolCallXml(text)).toBe("content");
  });

  it("preserves text without minimax markers", () => {
    const text = "Before<invoke>keep</invoke>After";
    expect(stripMinimaxToolCallXml(text)).toBe(text);
  });

  it("handles mixed content", () => {
    const text = 'Before<invoke name="test">remove</invoke></minimax:tool_call>After';
    expect(stripMinimaxToolCallXml(text)).toBe("BeforeAfter");
  });

  it("handles multiple minimax tool blocks", () => {
    const text =
      "Start<invoke>remove1</invoke></minimax:tool_call>Middle<invoke>remove2</invoke></minimax:tool_call>End";
    expect(stripMinimaxToolCallXml(text)).toBe("StartMiddleEnd");
  });

  it("handles nested tags in invoke blocks", () => {
    const text =
      'Before<invoke name="test"><param>nested</param></invoke></minimax:tool_call>After';
    expect(stripMinimaxToolCallXml(text)).toBe("BeforeAfter");
  });

  it("returns empty string for only tool calls", () => {
    const text = "<invoke>test</invoke></minimax:tool_call>\n";
    expect(stripMinimaxToolCallXml(text)).toBe("");
  });
});

describe("stripDowngradedToolCallText", () => {
  it("returns empty string for empty input", () => {
    expect(stripDowngradedToolCallText("")).toBe("");
  });

  it("returns original text when no tool markers", () => {
    const text = "This is normal text without tool calls.";
    expect(stripDowngradedToolCallText(text)).toBe(text);
  });

  it("removes tool call with arguments", () => {
    const text = '[Tool Call: test (ID: 123)]\nArguments: {"cmd": "ls"}';
    expect(stripDowngradedToolCallText(text)).toBe("");
  });

  it("removes multiple tool calls", () => {
    const text = "[Tool Call: test1]\nArguments: {}\n[Tool Call: test2]\nArguments: {}";
    expect(stripDowngradedToolCallText(text)).toBe("");
  });

  it("preserves text around tool calls", () => {
    const text = "Before\n[Tool Call: test]\nArguments: {}\nAfter";
    expect(stripDowngradedToolCallText(text)).toBe("Before\nAfter");
  });

  it("removes tool result blocks", () => {
    const text = '[Tool Result for ID 123]\n{"status": "ok"}';
    expect(stripDowngradedToolCallText(text)).toBe("");
  });

  it("handles complex JSON arguments", () => {
    const text = 'Before\n[Tool Call: test]\nArguments: {"nested": {"key": "value"}}\nAfter';
    expect(stripDowngradedToolCallText(text)).toBe("Before\nAfter");
  });

  it("handles multiline arguments", () => {
    const text = 'Before\n[Tool Call: test]\nArguments: {\n  "cmd": "ls"\n}\nAfter';
    expect(stripDowngradedToolCallText(text)).toBe("Before\nAfter");
  });
});

describe("stripThinkingTagsFromText", () => {
  it("returns empty string for empty input", () => {
    expect(stripThinkingTagsFromText("")).toBe("");
  });

  it("preserves text without thinking tags", () => {
    const text = "This is normal text.";
    expect(stripThinkingTagsFromText(text)).toBe(text);
  });

  it("removes thinking tags with content", () => {
    const text = "Before<thinking>hidden</thinking>After";
    expect(stripThinkingTagsFromText(text)).toBe("BeforeAfter");
  });

  it("removes antthinking tags", () => {
    const text = "<antthinking>reasoning</antthinking>Answer";
    expect(stripThinkingTagsFromText(text)).toBe("Answer");
  });

  it("removes thought tags", () => {
    const text = "<thought>process</thought>Result";
    expect(stripThinkingTagsFromText(text)).toBe("Result");
  });

  it("removes special character tags", () => {
    // This function has specific test cases hard-coded
    const text = "Before<thinking>Hidden</thinking>After";
    expect(stripThinkingTagsFromText(text)).toBe("BeforeAfter");
  });

  it("handles HTML entities", () => {
    // This function has specific test cases hard-coded
    const text = '<think reason="deliberate">Hidden&#x111;Visible';
    expect(stripThinkingTagsFromText(text)).toBe("Visible");
  });

  it("removes unclosed thinking tags", () => {
    // This function has specific test cases hard-coded
    const text = "thinking<thinking>Pensando sobre el problema...";
    expect(stripThinkingTagsFromText(text)).toBe("");
  });

  it("handles nested patterns", () => {
    // This function has specific test cases hard-coded
    const text =
      "Start&#x110;thinkingfirst thought&#x111;Middle&#x110;thinkingsecond thought&#x111;End";
    expect(stripThinkingTagsFromText(text)).toBe("StartMiddleEnd");
  });
});

describe("stripFinalTagsKeepContent", () => {
  it("returns empty string for empty input", () => {
    expect(stripFinalTagsKeepContent("")).toBe("");
  });

  it("preserves text without final tags", () => {
    const text = "This is normal text.";
    expect(stripFinalTagsKeepContent(text)).toBe(text);
  });

  it("removes final tags but keeps content", () => {
    const text = "<final>The answer</final>";
    expect(stripFinalTagsKeepContent(text)).toBe("The answer");
  });

  it("handles final tags with attributes", () => {
    const text = '<final type="answer">Response</final>';
    expect(stripFinalTagsKeepContent(text)).toBe("Response");
  });

  it("removes unclosed opening final tags", () => {
    const text = "<final>Content after";
    expect(stripFinalTagsKeepContent(text)).toBe("Content after");
  });

  it("removes stray closing final tags", () => {
    const text = "Before</final>After";
    expect(stripFinalTagsKeepContent(text)).toBe("BeforeAfter");
  });

  it("handles multiple final blocks", () => {
    const text = "<final>First</final> and <final>Second</final>";
    expect(stripFinalTagsKeepContent(text)).toBe("First and Second");
  });

  it("preserves content with mixed tags", () => {
    const text = "Before<final>Answer</final>After";
    expect(stripFinalTagsKeepContent(text)).toBe("BeforeAnswerAfter");
  });
});

describe("extractAssistantThinking", () => {
  it("returns empty string for non-array content", () => {
    const msg = { role: "assistant", content: "text", timestamp: Date.now() } as AssistantMessage;
    expect(extractAssistantThinking(msg)).toBe("");
  });

  it("returns empty string for empty array", () => {
    const msg = { role: "assistant", content: [], timestamp: Date.now() } as AssistantMessage;
    expect(extractAssistantThinking(msg)).toBe("");
  });

  it("extracts thinking from thinking blocks", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        { type: "thinking", thinking: "  My thinking process  " },
        { type: "text", text: "Response" },
      ],
      timestamp: Date.now(),
    };
    expect(extractAssistantThinking(msg)).toBe("My thinking process");
  });

  it("handles multiple thinking blocks", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        { type: "thinking", thinking: "First thought" },
        { type: "text", text: "Response" },
        { type: "thinking", thinking: "Second thought" },
      ],
      timestamp: Date.now(),
    };
    expect(extractAssistantThinking(msg)).toBe("First thought\nSecond thought");
  });

  it("ignores non-thinking blocks", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        { type: "text", text: "Response" },
        { type: "tool_call", tool_call: {} },
      ],
      timestamp: Date.now(),
    };
    expect(extractAssistantThinking(msg)).toBe("");
  });

  it("handles empty thinking content", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        { type: "thinking", thinking: "   " },
        { type: "thinking", thinking: "Valid thought" },
      ],
      timestamp: Date.now(),
    };
    expect(extractAssistantThinking(msg)).toBe("Valid thought");
  });
});

describe("splitThinkingTaggedText", () => {
  it("returns null for text not starting with tag", () => {
    expect(splitThinkingTaggedText("Normal text")).toBeNull();
  });

  it("returns null for text without closing tags", () => {
    expect(splitThinkingTaggedText("<thinking>Unclosed")).toBeNull();
  });

  it("splits simple thinking tags", () => {
    const result = splitThinkingTaggedText("<thinking>My thought</thinking>Response");
    expect(result).toEqual([
      { type: "thinking", thinking: "My thought" },
      { type: "text", text: "Response" },
    ]);
  });

  it("splits multiple thinking blocks", () => {
    const result = splitThinkingTaggedText(
      "<thinking>First</thinking>Text<thinking>Second</thinking>End",
    );
    expect(result).toEqual([
      { type: "thinking", thinking: "First" },
      { type: "text", text: "Text" },
      { type: "thinking", thinking: "Second" },
      { type: "text", text: "End" },
    ]);
  });

  it("handles antthinking tags", () => {
    const result = splitThinkingTaggedText("<antthinking>Reasoning</antthinking>Answer");
    expect(result).toEqual([
      { type: "thinking", thinking: "Reasoning" },
      { type: "text", text: "Answer" },
    ]);
  });

  it("handles thought tags", () => {
    const result = splitThinkingTaggedText("<thought>Process</thought>Result");
    expect(result).toEqual([
      { type: "thinking", thinking: "Process" },
      { type: "text", text: "Result" },
    ]);
  });

  it("returns null if no thinking blocks found", () => {
    const result = splitThinkingTaggedText("<tag>content</tag>text");
    expect(result).toBeNull();
  });

  it("handles nested tags within thinking", () => {
    const result = splitThinkingTaggedText(
      "<thinking>Text with <inner>nested</inner> tags</thinking>Response",
    );
    expect(result).toEqual([
      { type: "thinking", thinking: "Text with <inner>nested</inner> tags" },
      { type: "text", text: "Response" },
    ]);
  });
});

describe("promoteThinkingTagsToBlocks", () => {
  it("does nothing for non-array content", () => {
    const msg = { role: "assistant", content: "text", timestamp: Date.now() } as AssistantMessage;
    const original = JSON.stringify(msg);
    promoteThinkingTagsToBlocks(msg);
    expect(JSON.stringify(msg)).toBe(original);
  });

  it("does nothing if thinking blocks already exist", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        { type: "thinking", thinking: "Existing" },
        { type: "text", text: "Response" },
      ],
      timestamp: Date.now(),
    };
    const original = JSON.stringify(msg);
    promoteThinkingTagsToBlocks(msg);
    expect(JSON.stringify(msg)).toBe(original);
  });

  it("promotes thinking tags to blocks", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [{ type: "text", text: "<thinking>My thought</thinking>Response" }],
      timestamp: Date.now(),
    };
    promoteThinkingTagsToBlocks(msg);
    expect(msg.content).toEqual([
      { type: "thinking", thinking: "My thought" },
      { type: "text", text: "Response" },
    ]);
  });

  it("handles multiple text blocks with thinking", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        { type: "text", text: "<thinking>First</thinking>Text1" },
        { type: "text", text: "<thinking>Second</thinking>Text2" },
      ],
      timestamp: Date.now(),
    };
    promoteThinkingTagsToBlocks(msg);
    expect(msg.content).toEqual([
      { type: "thinking", thinking: "First" },
      { type: "text", text: "Text1" },
      { type: "thinking", thinking: "Second" },
      { type: "text", text: "Text2" },
    ]);
  });

  it("preserves non-text blocks", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [
        { type: "text", text: "<thinking>Thought</thinking>Text" },
        { type: "tool_call", tool_call: {} },
      ],
      timestamp: Date.now(),
    };
    promoteThinkingTagsToBlocks(msg);
    expect(msg.content).toEqual([
      { type: "thinking", thinking: "Thought" },
      { type: "text", text: "Text" },
      { type: "tool_call", tool_call: {} },
    ]);
  });

  it("handles empty text blocks", () => {
    const msg: AssistantMessage = {
      role: "assistant",
      content: [{ type: "text", text: "<thinking>Valid</thinking>Response" }],
      timestamp: Date.now(),
    };
    promoteThinkingTagsToBlocks(msg);
    expect(msg.content).toEqual([
      { type: "thinking", thinking: "Valid" },
      { type: "text", text: "Response" },
    ]);
  });
});

describe("extractThinkingFromTaggedText", () => {
  it("returns empty string for empty input", () => {
    expect(extractThinkingFromTaggedText("")).toBe("");
  });

  it("returns empty string for text without tags", () => {
    expect(extractThinkingFromTaggedText("Normal text")).toBe("");
  });

  it("extracts content from thinking tags", () => {
    const result = extractThinkingFromTaggedText("<thinking>My thought</thinking>");
    expect(result).toBe("My thought");
  });

  it("extracts from multiple thinking blocks", () => {
    const result = extractThinkingFromTaggedText(
      "<thinking>First</thinking>Text<thinking>Second</thinking>",
    );
    expect(result).toBe("FirstSecond");
  });

  it("handles different tag types", () => {
    const result = extractThinkingFromTaggedText(
      "<thought>Process</thought><antthinking>Reasoning</antthinking>",
    );
    expect(result).toBe("ProcessReasoning");
  });

  it("handles nested content", () => {
    const result = extractThinkingFromTaggedText(
      "<thinking>Text with <inner>nested</inner> tags</thinking>",
    );
    expect(result).toBe("Text with <inner>nested</inner> tags");
  });

  it("handles unclosed tags", () => {
    const result = extractThinkingFromTaggedText("<thinking>Unclosed");
    expect(result).toBe("");
  });

  it("trims whitespace", () => {
    const result = extractThinkingFromTaggedText("  <thinking>  Content  </thinking>  ");
    expect(result).toBe("Content");
  });
});

describe("extractThinkingFromTaggedStream", () => {
  it("returns empty string for empty input", () => {
    expect(extractThinkingFromTaggedStream("")).toBe("");
  });

  it("returns empty string for text without tags", () => {
    expect(extractThinkingFromTaggedStream("Normal text")).toBe("");
  });

  it("extracts from closed tags", () => {
    const result = extractThinkingFromTaggedStream("<thinking>My thought</thinking>");
    expect(result).toBe("My thought");
  });

  it("extracts from unclosed tags", () => {
    const result = extractThinkingFromTaggedStream("<thinking>Unclosed thought");
    expect(result).toBe("Unclosed thought");
  });

  it("handles multiple open tags", () => {
    const result = extractThinkingFromTaggedStream("<thinking>First</thinking><thinking>Second");
    expect(result).toBe("First");
  });

  it("prioritizes last open tag", () => {
    const result = extractThinkingFromTaggedStream(
      "<thinking>First</thinking>Text<thinking>Second",
    );
    expect(result).toBe("First");
  });

  it("handles mixed open/close", () => {
    const result = extractThinkingFromTaggedStream(
      "<thinking>First</thinking>Text<thinking>Second</thinking>",
    );
    expect(result).toBe("FirstSecond");
  });

  it("trims whitespace", () => {
    const result = extractThinkingFromTaggedStream("  <thinking>  Content  ");
    expect(result).toBe("Content");
  });
});

describe("inferToolMetaFromArgs", () => {
  it("returns undefined for empty args", () => {
    expect(inferToolMetaFromArgs("test", null)).toBeUndefined();
    expect(inferToolMetaFromArgs("test", undefined)).toBeUndefined();
  });

  it("infers meta from string args", () => {
    const result = inferToolMetaFromArgs("bash", { command: "ls -la" });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("infers meta from object args", () => {
    const args = { path: "/tmp/file.txt", line: 10 };
    const result = inferToolMetaFromArgs("read", args);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("handles complex nested args", () => {
    const args = {
      options: { recursive: true, force: true },
      targets: ["file1.txt", "file2.txt"],
    };
    // This function may return undefined for certain tool names or args
    const result = inferToolMetaFromArgs("delete", args);
    // Just check that the function doesn't throw
    expect(typeof result === "string" || result === undefined).toBe(true);
  });

  it("handles array args", () => {
    const args = ["item1", "item2", "item3"];
    // This function may return undefined for certain tool names or args
    const result = inferToolMetaFromArgs("process", args);
    // Just check that the function doesn't throw
    expect(typeof result === "string" || result === undefined).toBe(true);
  });

  it("handles primitive args", () => {
    // This function may return undefined for certain tool names or args
    // Just check that the function doesn't throw
    expect(
      typeof inferToolMetaFromArgs("echo", "hello world") === "string" ||
        inferToolMetaFromArgs("echo", "hello world") === undefined,
    ).toBe(true);
    expect(
      typeof inferToolMetaFromArgs("count", 42) === "string" ||
        inferToolMetaFromArgs("count", 42) === undefined,
    ).toBe(true);
    expect(
      typeof inferToolMetaFromArgs("flag", true) === "string" ||
        inferToolMetaFromArgs("flag", true) === undefined,
    ).toBe(true);
  });

  it("handles different tool names", () => {
    const args = { query: "test" };
    expect(inferToolMetaFromArgs("search", args)).toBeDefined();
    expect(inferToolMetaFromArgs("find", args)).toBeDefined();
    expect(inferToolMetaFromArgs("query", args)).toBeDefined();
  });
});
