import fs from "node:fs/promises";
import path from "node:path";

type ErrnoLike = {
  code?: string;
};

export async function ensureEmptyDir(dir: string) {
  try {
    const stat = await fs.stat(dir);
    if (stat.isDirectory()) {
      const files = await fs.readdir(dir);
      if (files.length > 0) {
        throw new Error(`Output directory is not empty: ${dir}`);
      }
    } else {
      throw new Error(`Output path exists and is not a directory: ${dir}`);
    }
  } catch (error) {
    const err = error as ErrnoLike | undefined;
    if (err?.code === "ENOENT") {
      await fs.mkdir(path.dirname(dir), { recursive: true });
    } else {
      throw error;
    }
  }

  await fs.mkdir(dir, { recursive: true });
}
