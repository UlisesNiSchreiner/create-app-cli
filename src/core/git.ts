import simpleGit from "simple-git";

export async function initGitAndCommit(repoPath: string, message: string) {
  const git = simpleGit(repoPath);
  await git.init();
  await git.add(".");
  await git.commit(message);
  await git.branch(["-M", "main"]);
}

/**
 * Injects the token into an HTTPS GitHub URL for a single push.
 * The token is NOT persisted.
 */
function withToken(cloneUrl: string, token: string) {
  // https://github.com/owner/repo.git
  // -> https://x-access-token:TOKEN@github.com/owner/repo.git
  return cloneUrl.replace(/^https:\/\//, `https://x-access-token:${token}@`);
}

export async function addRemoteAndPush(repoPath: string, cloneUrl: string) {
  const token = process.env.GITHUB_TOKEN;

  // Prevent git from trying to open VSCode / prompts
  const git = simpleGit({
    baseDir: repoPath,
    config: ["core.askPass=", "credential.helper="],
  });

  const pushUrl = token ? withToken(cloneUrl, token) : cloneUrl;

  // 1) Add remote (with token only in memory)
  await git.addRemote("origin", pushUrl);

  // 2) Push
  await git.push(["-u", "origin", "main"]);

  // 3) Clean the remote (remove token from URL)
  if (token) {
    await git.remote(["set-url", "origin", cloneUrl]);
  }
}
