import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { ensureEmptyDir } from "../src/core/fs.js";

async function mkTmpDir(prefix: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  return dir;
}

describe("ensureEmptyDir", () => {
  it("creates the directory if it does not exist", async () => {
    const parent = await mkTmpDir("ulises-cli-parent-");
    const target = path.join(parent, "new-app");
    await ensureEmptyDir(target);

    const stat = await fs.stat(target);
    expect(stat.isDirectory()).toBe(true);
  });

  it("throws if directory exists and is not empty", async () => {
    const dir = await mkTmpDir("ulises-cli-nonempty-");
    await fs.writeFile(path.join(dir, "file.txt"), "x", "utf-8");

    await expect(ensureEmptyDir(dir)).rejects.toThrow(/not empty/i);
  });

  it("throws if output path exists and is not a directory", async () => {
    const parent = await mkTmpDir("ulises-cli-fileparent-");
    const filePath = path.join(parent, "out");
    await fs.writeFile(filePath, "hello", "utf-8");

    await expect(ensureEmptyDir(filePath)).rejects.toThrow(/not a directory/i);
  });
});
