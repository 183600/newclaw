import type { iFlowPluginApi } from "../../src/plugins/types.js";
import { createLlmTaskTool } from "./src/llm-task-tool.js";

export default function register(api: iFlowPluginApi) {
  api.registerTool(createLlmTaskTool(api), { optional: true });
}
