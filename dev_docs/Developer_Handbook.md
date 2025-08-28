# 📘 Developer Handbook

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Project Setup](#project-setup)
3. [Branching Strategy](#branching-strategy)
4. [Commit Rules](#commit-rules)
5. [Pre-commit & Git Hooks](#pre-commit--git-hooks)
6. [Release Management](#release-management)
7. [CI/CD Workflow](#cicd-workflow)
8. [Bug Fixing & Feature Guidelines](#bug-fixing--feature-guidelines)
9. [Code Review Guidelines](#code-review-guidelines)
10. [Developer Onboarding](#developer-onboarding)

---

## 📌 Introduction

This repo follows **industry best practices**:

- Git branching strategy (`main` = production, `develop` = integration, feature branches for new work).
- **Conventional Commits** enforced with **Commitlint + Husky**.
- **Semantic Release** automates versioning, changelogs, and GitHub releases.
- **CI/CD via GitHub Actions** for build, test, deploy.

---

## ⚙️ Project Setup

### Clone & Install

```bash
git clone <repo-url>
cd project-name
npm install
```

### Run Locally

```bash
npm run dev
```

### Environment Variables

Copy `.env.example` → `.env` and update values.

---

## 🌿 Branching Strategy

- **main** → stable production-ready code.
- **develop** → latest tested features.
- **feature/xyz** → for new features.
- **fix/bug-123** → for bug fixes.
- **release/x.y.z** → pre-release staging.

---

## 📝 Commit Rules

We follow **Conventional Commits**:

```
<type>(scope): description
```

### Types:

- `feat` → new feature
- `fix` → bug fix
- `chore` → tooling/config updates
- `docs` → documentation only
- `test` → adding/updating tests
- `refactor` → code changes without behavior changes

✅ Examples:

```
feat(auth): add JWT authentication
fix(user): handle null profile picture
chore(deps): update sequelize to v7
```

❌ Bad:

```
updated login
bug fixed
```

---

## 🔒 Pre-commit & Git Hooks

We use **Husky + Commitlint** to enforce rules.

### Install Husky

```bash
npm install --save-dev husky @commitlint/{config-conventional,cli}
```

### Enable Husky

In `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

Run:

```bash
npm run prepare
```

### Add Hooks

#### Commit-msg Hook

```bash
echo 'npx commitlint --edit "$1"' > .husky/commit-msg
chmod +x .husky/commit-msg
```

#### Pre-commit Hook

```bash
echo 'npm run lint && npm test' > .husky/pre-commit
chmod +x .husky/pre-commit
```

---

## 🚀 Release Management

We use **Semantic Release** to automate:

- Version bump (major/minor/patch).
- Update `CHANGELOG.md`.
- Create GitHub Release.
- (Optional) Publish to npm.

### Install

```bash
npm install --save-dev semantic-release @semantic-release/{changelog,git,github,npm}
```

### Config: `.releaserc.json`

```json
{
  "branches": ["main"],
  "plugins": [
    ["@semantic-release/commit-analyzer", { "preset": "conventionalcommits" }],
    ["@semantic-release/release-notes-generator", { "preset": "conventionalcommits" }],
    ["@semantic-release/changelog", { "changelogFile": "CHANGELOG.md" }],
    ["@semantic-release/git", { "assets": ["CHANGELOG.md", "package.json"] }],
    "@semantic-release/github",
    "@semantic-release/npm"
  ]
}
```

---

## ⚡ CI/CD Workflow

### GitHub Actions: `.github/workflows/release.yml`

```yaml
name: 🚀 Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - run: npm ci

      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 🐞 Bug Fixing & Feature Guidelines

- Always **create a branch** for bug fixes/features.
- Always **write tests** for fixes/features.
- Follow commit rules (`fix(...)` for bugs, `feat(...)` for features).
- Open a **Pull Request** → code review → merge.

---

## 👀 Code Review Guidelines

- Ensure PRs are **small & focused**.
- Reviewer checklist:
  - ✅ Code style & linting
  - ✅ Tests added/updated
  - ✅ Commit message follows rules
  - ✅ No secrets or debug logs

---

## 👨‍💻 Developer Onboarding

### Steps for New Devs

1. Clone repo:

   ```bash
   git clone <repo-url>
   cd project
   npm install
   ```

2. Setup `.env` file.
3. Run dev server:

   ```bash
   npm run dev
   ```

4. Make a branch:

   ```bash
   git checkout -b feature/new-feature
   ```

5. Follow commit rules (enforced by Husky).
6. Run tests before pushing:

   ```bash
   npm test
   ```

7. Push & open a PR.
