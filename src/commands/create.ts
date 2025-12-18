import path from "node:path";
import { Command, type OptionValues } from "commander";
import prompts, { type PromptObject } from "prompts";

import { TEMPLATE_CATALOG, type TemplateKey } from "../templates.js";
import { downloadTemplate } from "../core/template.js";
import { runInitializer } from "../core/init.js";
import { ensureEmptyDir } from "../core/fs.js";
import { initGitAndCommit, addRemoteAndPush } from "../core/git.js";
import { createGithubRepo } from "../core/github.js";

type WizardAnswers = {
  template?: TemplateKey;
  appName?: string;
  owner?: string;
  isOrg?: boolean;
  visibility?: "public" | "private";
};

type CreateCommandOptions = OptionValues & {
  template?: TemplateKey;
  name?: string;
  owner?: string;
  org?: boolean;
  visibility?: "public" | "private";
  out?: string;
  skipGithub?: boolean;
  skipInit?: boolean;
  yes?: boolean;
};

export const createCommand = new Command("create")
  .description("Create a new app from a template")
  .argument("[appName]", "Application name (optional if provided with --name)")
  .option("--template <templateKey>", "Template key from the catalog")
  .option("--name <appName>", "Application name (repo name)")
  .option("--owner <owner>", "GitHub user or organization that will own the repo")
  .option("--org", "Treat --owner as an organization (create repo under org)", false)
  .option("--visibility <visibility>", "public|private", "public")
  .option("--out <path>", "Output directory (default: ./<appName>)")
  .option("--skip-github", "Do not create GitHub repo or push", false)
  .option("--skip-init", "Do not run template init scripts", false)
  .option("--yes", "Skip confirmation prompts", false)
  .action(async (appNameArg: string | undefined, opts: CreateCommandOptions) => {
    const catalogKeys = Object.keys(TEMPLATE_CATALOG) as TemplateKey[];

    const visibility = String(opts.visibility ?? "public");
    if (!["public", "private"].includes(visibility)) {
      throw new Error(`Invalid visibility: ${visibility}. Use 'public' or 'private'.`);
    }

    const initial = {
      template: opts.template as TemplateKey | undefined,
      appName: (opts.name as string | undefined) ?? appNameArg,
      owner: opts.owner as string | undefined,
      isOrg: Boolean(opts.org),
      outDir: opts.out as string | undefined,
      skipGithub: Boolean(opts.skipGithub),
      skipInit: Boolean(opts.skipInit),
      yes: Boolean(opts.yes),
      visibility: visibility as "public" | "private",
    };

    const needsWizard =
      !initial.template || !initial.appName || (!initial.skipGithub && !initial.owner);

    let answers: WizardAnswers = {};
    if (needsWizard) {
      const wizardQuestions = [
        !initial.template
          ? {
              type: "select",
              name: "template",
              message: "Choose a template",
              choices: catalogKeys.map((k) => ({
                title: `${k} (${TEMPLATE_CATALOG[k].repo})`,
                value: k,
              })),
            }
          : null,
        !initial.appName
          ? {
              type: "text",
              name: "appName",
              message: "Application name (and repo name)",
              validate: (v: string) => (v?.trim().length ? true : "Required"),
            }
          : null,
        initial.skipGithub || initial.owner
          ? null
          : {
              type: "text",
              name: "owner",
              message: "GitHub owner (username or org)",
              validate: (v: string) => (v?.trim().length ? true : "Required"),
            },
        initial.skipGithub
          ? null
          : {
              type: "toggle",
              name: "isOrg",
              message: "Is this an organization?",
              initial: initial.isOrg ? 1 : 0,
              active: "yes",
              inactive: "no",
            },
        {
          type: "select",
          name: "visibility",
          message: "Repo visibility",
          choices: [
            { title: "public", value: "public" },
            { title: "private", value: "private" },
          ],
          initial: initial.visibility === "private" ? 1 : 0,
        },
      ].filter((q): q is PromptObject<keyof WizardAnswers> => q !== null);

      answers = await prompts<WizardAnswers>(wizardQuestions, {
        onCancel: () => {
          process.exit(1);
        },
      });
    }

    const templateKey = (initial.template ?? answers.template) as TemplateKey;
    const appName = String(initial.appName ?? answers.appName).trim();
    const owner = initial.skipGithub ? undefined : String(initial.owner ?? answers.owner).trim();
    const isOrg = initial.skipGithub ? false : Boolean(initial.isOrg ?? answers.isOrg);
    const finalVisibility = (answers.visibility ?? initial.visibility) as "public" | "private";

    const outDir = path.resolve(initial.outDir ?? `./${appName}`);

    const template = TEMPLATE_CATALOG[templateKey];
    if (!template) {
      throw new Error(`Unknown template '${templateKey}'.`);
    }

    if (!initial.yes) {
      const confirm = await prompts<{ ok: boolean }>({
        type: "confirm",
        name: "ok",
        message:
          `Create app '${appName}' from template '${templateKey}' into:\n` +
          `  ${outDir}\n` +
          (initial.skipGithub
            ? `\nGitHub: skipped\n`
            : `\nGitHub:\n  owner=${owner} (${isOrg ? "org" : "user"})\n  visibility=${finalVisibility}\n`),
        initial: true,
      });
      if (!confirm.ok) process.exit(1);
    }

    await ensureEmptyDir(outDir);

    console.log(`\n1) Downloading template ${template.repo}...`);
    await downloadTemplate(template.repo, outDir, template.ref);

    if (!initial.skipInit) {
      console.log(`2) Running template initializer...`);
      await runInitializer({ template, appName, outDir, owner, isOrg });
    } else {
      console.log(`2) Skipping init scripts (--skip-init).`);
    }

    console.log(`3) Initializing git repo + first commit...`);
    await initGitAndCommit(outDir, "Initial commit from template");

    if (!initial.skipGithub) {
      if (!owner) throw new Error("Missing --owner (or provide it in the wizard).");

      console.log(`4) Creating GitHub repository...`);
      const repoInfo = await createGithubRepo({
        owner,
        name: appName,
        isOrg,
        visibility: finalVisibility,
        description: template.description ?? `Created from template ${template.repo}`,
      });

      console.log(`5) Adding remote + pushing...`);
      await addRemoteAndPush(outDir, repoInfo.sshUrl);

      console.log(`\nDone ✅`);
      console.log(`Remote: ${repoInfo.htmlUrl}`);
      console.log(`Local:  ${outDir}\n`);
    } else {
      console.log(`\nDone ✅ (local only)\nLocal: ${outDir}\n`);
    }
  });
