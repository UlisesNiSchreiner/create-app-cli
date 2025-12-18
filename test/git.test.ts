import { describe, it, expect, vi } from "vitest";

const gitInstance = {
  init: vi.fn(async () => {}),
  add: vi.fn(async () => {}),
  commit: vi.fn(async () => {}),
  branch: vi.fn(async () => {}),
  addRemote: vi.fn(async () => {}),
  push: vi.fn(async () => {}),
};

vi.mock("simple-git", () => ({
  default: vi.fn(() => gitInstance),
}));

import { initGitAndCommit, addRemoteAndPush } from "../src/core/git.js";

describe("git helpers", () => {
  it("initGitAndCommit initializes repo, commits, and sets main", async () => {
    await initGitAndCommit("/tmp/repo", "msg");

    expect(gitInstance.init).toHaveBeenCalled();
    expect(gitInstance.add).toHaveBeenCalledWith(".");
    expect(gitInstance.commit).toHaveBeenCalledWith("msg");
    expect(gitInstance.branch).toHaveBeenCalledWith(["-M", "main"]);
  });

  it("addRemoteAndPush adds origin and pushes main", async () => {
    await addRemoteAndPush("/tmp/repo", "https://github.com/o/r.git");

    expect(gitInstance.addRemote).toHaveBeenCalledWith("origin", "https://github.com/o/r.git");
    expect(gitInstance.push).toHaveBeenCalledWith(["-u", "origin", "main"]);
  });
});
