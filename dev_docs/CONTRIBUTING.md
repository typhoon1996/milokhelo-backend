# 📝 CONTRIBUTING.md

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Branching Model](#branching-model)
3. [Commit Guidelines](#commit-guidelines)
4. [Pull Request Process](#pull-request-process)
5. [Code Style & Linting](#code-style--linting)
6. [Testing](#testing)
7. [Releases](#releases)
8. [Reporting Issues](#reporting-issues)

---

## 🚀 Getting Started

1. Fork the repo and clone it locally:

   ```bash
   git clone <your-fork-url>
   cd project
   npm install
   ```

2. Copy `.env.example` → `.env` and configure environment variables.
3. Run dev server:

   ```bash
   npm run dev
   ```

---

## 🌿 Branching Model

We use a simplified **Git Flow**:

- `main` → production code (protected).
- `develop` → integration branch.
- `feature/<name>` → new features.
- `fix/<issue>` → bug fixes.
- `hotfix/<issue>` → urgent production fixes.
- `release/x.y.z` → pre-release staging.

👉 Always branch off from `develop` unless fixing production (`main`).

---

## 📝 Commit Guidelines

We enforce **Conventional Commits** via **Commitlint + Husky**.

Format:

```
<type>(scope): short description
```

### Types

- `feat` → new feature
- `fix` → bug fix
- `docs` → documentation only
- `style` → formatting, no logic changes
- `refactor` → code restructure without feature change
- `test` → adding/updating tests
- `chore` → tooling/config updates

✅ Example:

```
feat(auth): add JWT authentication
fix(api): correct user pagination bug
docs(readme): update installation steps
```

❌ Bad:

```
update login
bug fixed
```

---

## 🔄 Pull Request Process

1. Create a feature/bug branch.
2. Push changes and open a **PR into `develop`** (or `main` for hotfix).
3. Ensure:
   - ✅ PR is small & focused.
   - ✅ PR title follows commit convention (e.g. `feat: add search API`).
   - ✅ Tests are added/updated.
   - ✅ Lint passes.

4. Reviewer checklist:
   - Code quality (readable, clean).
   - Unit/integration tests.
   - Security concerns (no secrets).
   - Documentation updated if needed.

---

## 🎨 Code Style & Linting

- Use **ESLint + Prettier**.
- Run before committing:

  ```bash
  npm run lint
  ```

- Fix issues automatically:

  ```bash
  npm run lint:fix
  ```

---

## ✅ Testing

- All new features must include tests.
- Run tests before pushing:

  ```bash
  npm test
  ```

- CI will block merge if tests fail.

---

## 🚀 Releases

We use **Semantic Release**:

- Runs only on `main` branch.
- Auto-generates changelog + GitHub Release + npm publish.
- Versioning:
  - `fix:` → patch release (1.0.1)
  - `feat:` → minor release (1.1.0)
  - `BREAKING CHANGE:` → major release (2.0.0)

---

## 🐛 Reporting Issues

- Use GitHub Issues.
- Follow this template:
  - **Summary**: short description
  - **Steps to reproduce**: clear steps
  - **Expected behavior**
  - **Actual behavior**
  - **Screenshots/logs** if available
  - **Environment** (OS, Node version, etc.)

---

✅ This `CONTRIBUTING.md` ensures every dev knows:

- How to branch
- How to commit
- How to PR
- How releases are automated
