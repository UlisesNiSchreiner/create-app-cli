import { Octokit } from "@octokit/rest";
import { execa } from "execa";

export type CreateRepoArgs = {
  owner: string;
  name: string;
  isOrg: boolean;
  visibility: "public" | "private";
  description?: string;
};

export type CreatedRepo = {
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
};

async function getToken(): Promise<string> {
  const fromEnv = process.env.GITHUB_TOKEN?.trim();
  if (fromEnv) return fromEnv;

  // Fallback: use GitHub CLI if installed and authenticated
  try {
    const { stdout } = await execa("gh", ["auth", "token"], { stdio: "pipe" });
    const token = stdout.trim();
    if (!token) throw new Error("Empty token from gh");
    return token;
  } catch {
    throw new Error(
      "GitHub authentication required. Set GITHUB_TOKEN or install+login with GitHub CLI (gh auth login).",
    );
  }
}

export async function createGithubRepo(args: CreateRepoArgs): Promise<CreatedRepo> {
  const token = await getToken();
  const octokit = new Octokit({ auth: token });

  const payload = {
    name: args.name,
    private: args.visibility === "private",
    description: args.description ?? "",
    auto_init: false,
  };

  const res = args.isOrg
    ? await octokit.repos.createInOrg({ org: args.owner, ...payload })
    : await octokit.repos.createForAuthenticatedUser(payload);

  // If user passes --owner as their username, createForAuthenticatedUser is correct.
  // For "create under another user", GitHub does not allow via API unless you are that user.

  return {
    htmlUrl: res.data.html_url!,
    cloneUrl: res.data.clone_url!,
    sshUrl: res.data.ssh_url!,
  };
}
