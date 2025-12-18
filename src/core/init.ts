import { execa } from "execa";

import type { TemplateDef } from "../templates.js";

type RunInitializerArgs = {
  template: TemplateDef;
  appName: string;
  outDir: string;
  owner?: string;
  isOrg?: boolean;
};

export async function runInitializer(args: RunInitializerArgs) {
  const { template, appName, outDir, owner } = args;

  switch (template.tech) {
    case "node":
    case "react":
    case "typescript": {
      // Install first to ensure init scripts are available.
      await execa("npm", ["install"], { cwd: outDir, stdio: "inherit" });
      await execa("npm", ["run", "init-template", appName], { cwd: outDir, stdio: "inherit" });
      return;
    }

    case "go": {
      if (!owner) {
        // For Go init, we need the final import path.
        throw new Error("Go templates require --owner (GitHub owner) to build the module path.");
      }
      const modulePath = `github.com/${owner}/${appName}`;
      await execa("go", ["run", "scripts/init-template.go", modulePath], {
        cwd: outDir,
        stdio: "inherit",
      });
      return;
    }

    case "kotlin":
    case "java":
      throw new Error(
        `Template tech '${template.tech}' is not implemented yet. ` +
          `Add an initializer in src/core/init.ts (Gradle task or custom script).`,
      );

    default: {
      const tech: never = template.tech;
      throw new Error(`Unsupported template tech: ${tech}`);
    }
  }
}
