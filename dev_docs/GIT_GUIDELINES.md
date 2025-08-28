# 🧠 Git Best Practices – Commits, Branching & History Management

## ✅ Core Principles

1. **Never commit directly to `main` (or `develop`)** – always work in a branch.
2. **Keep commits atomic** – one logical change per commit.
3. **Use clear, standardized commit messages** (Conventional Commits).
4. **Pull before pushing** – avoid conflicts and ensure your branch is current.
5. **Clean history before merging** – squash or rebase to maintain readability.
6. **Review changes before committing** (`git diff`, IDE tools).

---

## 📂 Branching Model

- **main** → always production-ready.
- **develop** → integration branch (if using Git Flow).
- **feature/\***, **bugfix/\***, **hotfix/**\* → descriptive prefixes for branches.

```bash
git checkout -b feature/user-login
```

---

## ✍️ Commit Message Guidelines

Follow **Conventional Commits**:

```
<type>(<scope>): <summary>

[optional body]

[optional footer: e.g., Closes #123]
```

**Types**:

- `feat` → new feature
- `fix` → bug fix
- `docs` → documentation only
- `refactor` → non-functional code change
- `test` → add/update tests
- `chore` → tooling/maintenance
- `style` → formatting only

**Examples**:

- `feat(auth): implement JWT-based login`
- `fix(ui): close mobile menu on item click`
- `docs(readme): add API usage examples`
- `chore: bump eslint and prettier configs`

---

## 🧪 Standard Workflow

### 1. Sync with base branch

```bash
git checkout develop
git pull origin develop
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

### 3. Develop and review changes

```bash
git status
git diff
```

### 4. Stage and commit

```bash
git add .
git commit -m "feat(login): add OAuth support"
```

### 5. Push branch

```bash
git push -u origin feature/your-feature
```

---

## 🔁 Staying Up-to-Date

Rebase regularly against `develop` (or `main` if trunk-based):

```bash
git pull origin develop --rebase
```

If conflicts occur:

```bash
git rebase --continue
```

---

## 🔨 History Cleanup

Before merging, squash or rebase interactively:

```bash
git rebase -i develop
```

---

## 📥 Pull Request Standards

- PRs from `feature/*` → `develop` (or → `main` in trunk-based).
- Use clear, descriptive title and body.
- Link related issues (e.g., `Closes #123`).
- Request peer reviews.
- Ensure tests, linting, and CI pass.

---

## 🧼 After Merge

1. **Delete remote branch**

   ```bash
   git push origin --delete feature/your-feature
   ```

2. **Clean up local branch**

   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/your-feature
   ```

---

## 🧰 Pro Tips

- Use `git stash` for temporary changes.
- Visualize history:

  ```bash
  git log --oneline --graph --all
  ```

- Enforce commit rules with **husky** + **lint-staged**.
- Use **git tags** for versioned releases.
