import { beforeEach, describe, expect, it, vi } from "vitest";
import { execa } from "execa";

import { runInitializer } from "../src/core/init.js";
import type { TemplateDef } from "../src/templates.js";

vi.mock("execa", () => ({
  execa: vi.fn(async () => ({ stdout: "" })),
}));

describe("runInitializer", () => {
  beforeEach(() => {
    vi.mocked(execa).mockClear?.();
  });

  it("runs npm install + npm run init-template for node/react/typescript", async () => {
    const template: TemplateDef = {
      key: "node-api-rest-template",
      repo: "UlisesNiSchreiner/node-api-rest-template",
      tech: "node",
    };

    await runInitializer({
      template,
      appName: "my-app",
      outDir: "/tmp/my-app",
      owner: "UlisesNiSchreiner",
      isOrg: false,
    });

    expect(execa).toHaveBeenCalledWith(
      "npm",
      ["install"],
      expect.objectContaining({ cwd: "/tmp/my-app" }),
    );
    expect(execa).toHaveBeenCalledWith(
      "npm",
      ["run", "init-template", "my-app"],
      expect.objectContaining({ cwd: "/tmp/my-app" }),
    );
  });

  it("runs go init-template script for go tech using module path github.com/<owner>/<appName>", async () => {
    const template: TemplateDef = {
      key: "go-api-rest-template",
      repo: "UlisesNiSchreiner/go-api-rest-template",
      tech: "go",
    };

    await runInitializer({
      template,
      appName: "payments-api",
      outDir: "/tmp/payments-api",
      owner: "my-org",
      isOrg: true,
    });

    expect(execa).toHaveBeenCalledWith(
      "go",
      ["run", "scripts/init-template.go", "github.com/my-org/payments-api"],
      expect.objectContaining({ cwd: "/tmp/payments-api" }),
    );
  });

  it("throws for go tech if owner is missing", async () => {
    const template: TemplateDef = {
      key: "go-api-rest-template",
      repo: "UlisesNiSchreiner/go-api-rest-template",
      tech: "go",
    };

    await expect(
      runInitializer({
        template,
        appName: "x",
        outDir: "/tmp/x",
      }),
    ).rejects.toThrow(/require --owner/i);
  });

  it("throws for kotlin/java until implemented", async () => {
    const template: TemplateDef = {
      key: "kotlin-template",
      repo: "x/y",
      tech: "kotlin",
    };

    await expect(
      runInitializer({
        template,
        appName: "x",
        outDir: "/tmp/x",
        owner: "u",
      }),
    ).rejects.toThrow(/not implemented/i);
  });
});
