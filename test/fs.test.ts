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
  it("test ensureEmptyDir when target missing then creates directory", async () => {
    const parent = await mkTmpDir("ulises-cli-parent-");
    const target = path.join(parent, "new-app");
    await ensureEmptyDir(target);

    const stat = await fs.stat(target);
    expect(stat.isDirectory()).toBe(true);
  });

  it("test ensureEmptyDir when dir non empty then throws error", async () => {
    const dir = await mkTmpDir("ulises-cli-nonempty-");
    await fs.writeFile(path.join(dir, "file.txt"), "x", "utf-8");

    await expect(ensureEmptyDir(dir)).rejects.toThrow(/not empty/i);
  });

  it("test ensureEmptyDir when path is file then throws not directory error", async () => {
    const parent = await mkTmpDir("ulises-cli-fileparent-");
    const filePath = path.join(parent, "out");
    await fs.writeFile(filePath, "hello", "utf-8");

    await expect(ensureEmptyDir(filePath)).rejects.toThrow(/not a directory/i);
  });
});
