# create-app-cli

A Node.js CLI that scaffolds new applications from your GitHub template repositories, runs the template initializer, creates a brand new GitHub repository (user or org), pushes the initial commit, and leaves you with a ready-to-work local repo.

This project is designed so you can later power a **web UI** (internal developer portal) using the same core logic.

---

## Features

- ✅ Wizard mode (interactive prompts) and non-interactive flags
- ✅ Downloads a template repo **without** `.git` history (fast, clean)
- ✅ Runs template initialization commands (per template / technology)
- ✅ Creates a new GitHub repository (user or organization)
- ✅ Creates an initial commit and pushes to GitHub
- ✅ Works great for your public templates (Node / React / TypeScript / Go)
- 🧩 Extensible: add new templates or init strategies via a single config file

---

![CI](https://img.shields.io/github/actions/workflow/status/UlisesNiSchreiner/typescript-lib-template/ci.yml?label=CI)
![npm version](https://img.shields.io/npm/v/uns-typescript-lib-template)
![npm downloads](https://img.shields.io/npm/dm/uns-typescript-lib-template)
[![Coverage](https://codecov.io/gh/UlisesNiSchreiner/typescript-lib-template/branch/master/graph/badge.svg)](https://codecov.io/gh/UlisesNiSchreiner/typescript-lib-template)
![license](https://img.shields.io/badge/License-MIT-green)
![typescript](https://img.shields.io/badge/TypeScript-5.x-blue)

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

### Use via npx (recommended)

```bash
npx @ulises/create-app
```

### Install globally

```bash
npm i -g @ulises/create-app
ulises-create-app --help
```

---

## Quick start

### Interactive wizard

```bash
npx @ulises/create-app
```

### Non-interactive (flags)

```bash
npx @ulises/create-app \
  --template go-api-rest-template \
  --name payments-api \
  --owner UlisesNiSchreiner \
  --visibility public \
  --out ./payments-api
```

If you want to create the repo inside an organization:

```bash
npx @ulises/create-app \
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
2. Else, if `gh` is installed, it runs:
   - `gh auth token`
     and uses that token.

### Recommended scopes

If you will create private repos or repos in orgs, ensure your token has at least:

- `repo`
- `read:org` (often required for org operations)

If you only create public repos under your user account, a smaller scope might be enough — but `repo` is the safest general default.

---

## Commands

### `create` (default)

```bash
ulises-create-app create [options]
```

Options:

- `--template <name>`: template key (one of the configured templates)
- `--name <appName>`: new application name (and GitHub repo name)
- `--owner <owner>`: GitHub username or org name
- `--org`: treat `--owner` as an organization (creates under org)
- `--visibility <public|private>`: repo visibility
- `--out <path>`: output directory (default: `./<appName>`)
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

## Roadmap (suggested)

- [ ] Add Kotlin/Java init strategy (Gradle tasks or custom scripts)
- [ ] Add “catalog” JSON hosted remotely (so templates can be updated without publishing)
- [ ] Add DigitalOcean provisioning (Terraform):
  - VPC, LB, domains, SSL, scopes
  - environment config and secrets
- [ ] Extract a server API (for a future web UI):
  - `POST /apps` -> creates app from template and provisions infra
- [ ] Web UI / Portal for devs:
  - login via GitHub OAuth
  - wizard + progress view

---

## License

MIT
