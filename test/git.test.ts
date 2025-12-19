import { beforeEach, describe, it, expect, vi } from "vitest";

const gitInstance = {
  init: vi.fn(async () => {}),
  add: vi.fn(async () => {}),
  commit: vi.fn(async () => {}),
  branch: vi.fn(async () => {}),
  addRemote: vi.fn(async () => {}),
  push: vi.fn(async () => {}),
  remote: vi.fn(async () => {}),
};

vi.mock("simple-git", () => ({
  default: vi.fn(() => gitInstance),
}));

import { initGitAndCommit, addRemoteAndPush } from "../src/core/git.js";

describe("git helpers", () => {
  beforeEach(() => {
    Object.values(gitInstance).forEach((fn) => fn.mockClear());
    delete process.env.GITHUB_TOKEN;
  });

  it("test initGitAndCommit when executed then initializes repo commits and sets main", async () => {
    await initGitAndCommit("/tmp/repo", "msg");

    expect(gitInstance.init).toHaveBeenCalled();
    expect(gitInstance.add).toHaveBeenCalledWith(".");
    expect(gitInstance.commit).toHaveBeenCalledWith("msg");
    expect(gitInstance.branch).toHaveBeenCalledWith(["-M", "main"]);
  });

  it("test addRemoteAndPush when executed then sets origin and pushes main", async () => {
    await addRemoteAndPush("/tmp/repo", "https://github.com/o/r.git");

    expect(gitInstance.addRemote).toHaveBeenCalledWith("origin", "https://github.com/o/r.git");
    expect(gitInstance.push).toHaveBeenCalledWith(["-u", "origin", "main"]);
  });

  it("test addRemoteAndPush when GITHUB_TOKEN set then uses tokenized remote and cleans up", async () => {
    process.env.GITHUB_TOKEN = "abc123";

    await addRemoteAndPush("/tmp/repo", "https://github.com/o/r.git");

    expect(gitInstance.addRemote).toHaveBeenCalledWith(
      "origin",
      "https://x-access-token:abc123@github.com/o/r.git",
    );
    expect(gitInstance.push).toHaveBeenCalledWith(["-u", "origin", "main"]);
    expect(gitInstance.remote).toHaveBeenCalledWith([
      "set-url",
      "origin",
      "https://github.com/o/r.git",
    ]);
  });
});
