# 🧑‍💻 Coding Guidelines

To maintain **code quality and consistency**, follow these rules.

---

## 1. Language & Style

- Use **TypeScript** for backend and **React + TypeScript** for frontend.
- Follow **Airbnb ESLint rules** + **Prettier**.
- Write meaningful variable/function names.
- Avoid hardcoding values (use config/env).

---

## 2. Branching Strategy

- `main` → Production-ready code
- `develop` → Integration branch
- `feature/*` → New features
- `fix/*` → Bug fixes
- `hotfix/*` → Urgent fixes

---

## 3. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add JWT authentication
fix(user): resolve crash on empty payload
chore(ci): update GitHub Actions

```

---

## 4. Code Review

- All PRs must be reviewed by at least **1 developer**.
- No merge without passing tests.
- Keep PRs small (≤ 300 lines).

---

## 5. Testing

- Minimum **80% coverage** required.
- Unit, integration, and E2E tests are mandatory for critical paths.
