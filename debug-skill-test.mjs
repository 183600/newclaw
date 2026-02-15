import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadWorkspaceSkillEntries } from "./src/agents/skills.js";

async function debugTest() {
  const workspaceDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-"));
  const managedDir = path.join(workspaceDir, ".managed");
  const bundledDir = path.join(workspaceDir, ".bundled");
  const pluginRoot = path.join(workspaceDir, ".openclaw", "extensions", "open-prose");

  console.log("Workspace dir:", workspaceDir);
  console.log("Plugin root:", pluginRoot);

  await fs.mkdir(path.join(pluginRoot, "skills", "prose"), { recursive: true });
  await fs.writeFile(
    path.join(pluginRoot, "openclaw.plugin.json"),
    JSON.stringify(
      {
        id: "open-prose",
        skills: ["./skills"],
        configSchema: { type: "object", additionalProperties: false, properties: {} },
      },
      null,
      2,
    ),
    "utf-8",
  );
  await fs.writeFile(
    path.join(pluginRoot, "skills", "prose", "SKILL.md"),
    `---\nname: prose\ndescription: test\n---\n`,
    "utf-8",
  );

  // Check if files exist
  console.log(
    "Plugin manifest exists:",
    await fs
      .access(path.join(pluginRoot, "openclaw.plugin.json"))
      .then(() => true)
      .catch(() => false),
  );
  console.log(
    "Skill file exists:",
    await fs
      .access(path.join(pluginRoot, "skills", "prose", "SKILL.md"))
      .then(() => true)
      .catch(() => false),
  );

  const entries = loadWorkspaceSkillEntries(workspaceDir, {
    config: {
      plugins: {
        entries: { "open-prose": { enabled: true } },
      },
    },
    managedSkillsDir: managedDir,
    bundledSkillsDir: bundledDir,
  });

  console.log("Entries found:", entries.length);
  console.log(
    "Entry names:",
    entries.map((e) => e.skill.name),
  );
}

debugTest().catch(console.error);
