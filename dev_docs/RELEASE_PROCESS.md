# 🚀 Release Process

This document explains how to manage releases for **MiloKhelo Backend**.  
We follow **Semantic Versioning (SemVer)** and maintain a **changelog** for every release.

---

## 1. Versioning Rules (SemVer)

Version format: **MAJOR.MINOR.PATCH**

- **MAJOR** → Breaking changes (incompatible API updates)
- **MINOR** → New features (backward-compatible)
- **PATCH** → Bug fixes & small improvements

Examples:

- `1.0.0` → Initial release
- `1.1.0` → New feature added
- `1.1.1` → Bug fix

---

## 2. Pre-Release Checklist

Before creating a release:

- ✅ All tests must pass (`npm run test`)
- ✅ Linting & formatting clean (`npm run lint`)
- ✅ Documentation updated (README, docs, API, etc.)
- ✅ `CHANGELOG.md` updated under `[Unreleased]`

---

## 3. Release Steps

1. **Update Changelog**  
   Move entries from `[Unreleased]` into a new version section:

   ```bash
   ## [1.2.0] - 2025-09-05
   ### Added
   - New user profile API
   ### Fixed
   - Connection request bug
   ```

2. **Bump Version**
   Update version in `package.json` (or `pyproject.toml`, `pom.xml`, etc. depending on stack):

   ```bash
   npm version [major|minor|patch]
   ```

   Example:

   ```bash
   npm version minor
   ```

3. **Commit & Tag**

   ```bash
   git add .
   git commit -m "chore(release): 1.2.0"
   git tag -a v1.2.0 -m "Release 1.2.0"
   ```

4. **Push Changes**

   ```bash
   git push origin main --tags
   ```

5. **CI/CD Deployment**
   - CI/CD will automatically build and deploy the tagged release.
   - Monitor logs and staging before promoting to production.

---

## 4. Hotfix Releases

For urgent production fixes:

- Branch off `main` → `hotfix/x.y.z`
- Apply fix + bump **PATCH version**
- Tag release (e.g., `v1.2.1`)
- Merge back into `main` and `develop`

---

## 5. Post-Release

- ✅ Update project board / Jira tickets as released
- ✅ Announce release to team
- ✅ Monitor production for issues

---

## 6. Example Workflow

```bash
# Example: New feature release
git checkout develop
git pull origin develop
npm run test

# Update CHANGELOG.md
npm version minor   # bumps 1.1.0 -> 1.2.0
git push origin develop

# Merge into main for release
git checkout main
git merge develop
git push origin main

# Tag & push
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin v1.2.0
```

---

## 7. Tools

- [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- [Semantic Release](https://semantic-release.gitbook.io/) (optional automation)
- GitHub Actions / GitLab CI for deployment pipelines
