import { beforeEach, describe, expect, it, vi } from "vitest";
import { execa } from "execa";

import { createGithubRepo } from "../src/core/github.js";

const createForAuthenticatedUser = vi.fn(async () => ({
  data: {
    html_url: "https://github.com/u/x",
    clone_url: "https://github.com/u/x.git",
    ssh_url: "git@github.com:u/x.git",
  },
}));
const createInOrg = vi.fn(async () => ({
  data: {
    html_url: "https://github.com/org/x",
    clone_url: "https://github.com/org/x.git",
    ssh_url: "git@github.com:org/x.git",
  },
}));

vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn(() => ({
    repos: { createForAuthenticatedUser, createInOrg },
  })),
}));

vi.mock("execa", () => ({
  execa: vi.fn(async () => ({ stdout: "gh-token\n" })),
}));

describe("createGithubRepo", () => {
  beforeEach(() => {
    createForAuthenticatedUser.mockClear();
    createInOrg.mockClear();
    vi.mocked(execa).mockClear?.();
    delete process.env.GITHUB_TOKEN;
  });

  it("test createGithubRepo when env token exists then uses provided token", async () => {
    process.env.GITHUB_TOKEN = "env-token";

    const repo = await createGithubRepo({
      owner: "UlisesNiSchreiner",
      name: "my-app",
      isOrg: false,
      visibility: "public",
      description: "d",
    });

    expect(repo.cloneUrl).toContain("https://");
    expect(createForAuthenticatedUser).toHaveBeenCalled();
    // should not call gh
    expect(execa).not.toHaveBeenCalled();
  });

  it("test createGithubRepo when env token missing then falls back to gh auth token", async () => {
    const repo = await createGithubRepo({
      owner: "UlisesNiSchreiner",
      name: "my-app",
      isOrg: false,
      visibility: "public",
    });

    expect(execa).toHaveBeenCalledWith("gh", ["auth", "token"], expect.any(Object));
    expect(createForAuthenticatedUser).toHaveBeenCalled();
    expect(repo.htmlUrl).toBe("https://github.com/u/x");
  });

  it("test createGithubRepo when org flag true then creates org repository", async () => {
    const repo = await createGithubRepo({
      owner: "my-org",
      name: "org-app",
      isOrg: true,
      visibility: "private",
    });

    expect(createInOrg).toHaveBeenCalledWith(
      expect.objectContaining({ org: "my-org", name: "org-app", private: true }),
    );
    expect(repo.htmlUrl).toBe("https://github.com/org/x");
  });
});
