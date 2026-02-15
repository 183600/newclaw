import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { discoverOpenClawPlugins } from "./src/plugins/discovery.js";

async function debugTest() {
  const workspaceDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-"));
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

  const result = discoverOpenClawPlugins({
    workspaceDir: workspaceDir,
  });

  console.log("Found candidates:", result.candidates.length);
  for (const candidate of result.candidates) {
    if (candidate.idHint === "open-prose" || candidate.packageName === "open-prose") {
      console.log("Found open-prose candidate:", {
        idHint: candidate.idHint,
        source: candidate.source,
        rootDir: candidate.rootDir,
        origin: candidate.origin,
        workspaceDir: candidate.workspaceDir,
      });
    }
  }
}

debugTest().catch(console.error);
