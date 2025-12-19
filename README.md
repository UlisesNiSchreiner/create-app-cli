# app-factory-cli

A Node.js CLI that scaffolds new applications from your GitHub template repositories, runs each template’s initializer, creates a brand new GitHub repository (user or org), pushes the initial commit, and leaves you with a ready-to-work local repo.

---

![CI](https://img.shields.io/github/actions/workflow/status/UlisesNiSchreiner/create-app-cli/ci.yml?label=CI)
![npm version](https://img.shields.io/npm/v/app-factory-cli)
![npm downloads](https://img.shields.io/npm/dm/app-factory-cli)
![license](https://img.shields.io/github/license/UlisesNiSchreiner/create-app-cli)
[![Coverage](https://codecov.io/gh/UlisesNiSchreiner/create-app-cli/branch/main/graph/badge.svg)](https://codecov.io/gh/UlisesNiSchreiner/create-app-cli)

---

## Requirements

- Node.js **18+**
- `git` installed and available on PATH
- For GitHub repository creation:
  - Option A: a GitHub token in `GITHUB_TOKEN`
  - Option B: GitHub CLI (`gh`) installed and already authenticated (`gh auth login`)

> For Go templates, you also need `go` installed (for `go run ...`).

---

## Installation

### Global install

```bash
npm i -g app-factory-cli
```

Verify:

```bash
app-factory --help
```

### Project-local install (works with npm only)

If you prefer not to install globally:

```bash
npm i -D app-factory-cli
```

Run via npm:

```bash
npm exec -- app-factory --help
```

---

## Quick start

### Interactive wizard

Global:

```bash
app-factory create
```

Local (npm only):

```bash
npm exec -- app-factory create
```

### Non-interactive (flags)

```bash
app-factory create \
  --template go-api-rest-template \
  --name payments-api \
  --owner UlisesNiSchreiner \
  --visibility public \
  --out ./payments-api
```

If you want to create the repo inside an organization:

```bash
app-factory create \
  --template node-api-rest-template \
  --name billing-api \
  --owner my-org \
  --org \
  --visibility private
```

---

## Supported templates (default)

These are pre-configured to match your public repos:

- `go-api-rest-template`
- `node-api-rest-template`
- `react-ts-web-app-template`
- `config-manager-js`
- `react-next-ts-web-app-template`
- `typescript-lib-template`
- `template_gn_middleend`
- `template_gn_web_cli`
- `template_gn_rn_cli`

> You can add/remove templates easily: see **Adding templates** below.

---

## What the CLI does

1. Prompts for (or reads flags):
   - template
   - app name
   - owner (user/org)
   - repo visibility
   - output directory
2. Downloads the template into the output directory (using `degit`)
3. Runs the template initializer (per template)
4. Initializes a new git repo locally, commits the generated code
5. Creates a new GitHub repository via API
6. Adds `origin`, pushes `main`

---

## Authentication

This CLI tries to authenticate with GitHub like this:

1. If `GITHUB_TOKEN` is set, it uses it.
2. Else, if `gh` is installed, it runs `gh auth token` and uses that token.

### Recommended token permissions

**Classic PAT (ghp\_\*)**

- `repo`
- `read:org` (often required for org operations)

**Fine-grained PAT (github*pat*\*)**

- Repository permissions:
  - **Administration: Read and write** (create repo)
  - **Contents: Read and write** (push)

> If you create repos in orgs, ensure the token is allowed for that org (and SSO if applicable).

---

## Commands

### `create` (default)

```bash
app-factory create [options]
```

Options:

- `--template <name>`: template key (one of the configured templates)
- `--name <appName>`: new application name (and GitHub repo name)
- `--owner <owner>`: GitHub username or org name
- `--org`: treat `--owner` as an organization (creates under org)
- `--visibility <public|private>`: repo visibility
- `--out <path>`: output directory (default: `./<appName>` relative to where you run the command)
- `--skip-github`: only scaffold locally, do not create remote repo
- `--skip-init`: do not run the init-template script
- `--yes`: skip confirmation prompts

---

## Adding templates

Edit `src/templates.ts`.

Each template has:

- `key`: the CLI identifier
- `repo`: GitHub `owner/repo`
- `tech`: used to select an init strategy
- `initializer`: optional override

Example:

```ts
{
  key: "kotlin-api-template",
  repo: "UlisesNiSchreiner/kotlin-api-template",
  tech: "kotlin",
}
```

Then implement the initializer in `src/core/init.ts` (or add a new one).

---

## How template initialization works

The CLI chooses an initializer based on `tech`:

- `node` / `react` / `typescript`:
  - runs `npm install`
  - then `npm run init-template <appName>`
- `go`:
  - runs `go run scripts/init-template.go github.com/<owner>/<repo>`
- `kotlin` / `java`:
  - not implemented yet (throws a clear error)

---

## Local development

```bash
npm install
npm run dev -- create
```

Build:

```bash
npm run build
```

---

## License

MIT
