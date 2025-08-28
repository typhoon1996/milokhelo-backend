# 📖 Project Documentation & Developer Guide

Welcome to the **MiloKhelo Backend** repository!  
This document is the **central guide for developers**, covering APIs, features, bug tracking, coding guidelines, and industry best practices.

---

## 🚀 Project Overview

- **Name**: MikoKhelo Backend
- **Description**: This is the code base for the baseend of the milokhelo application
- **Tech Stack**: Node.js, Express, Sequelize, PostgreSQL/MySQL, React, Docker, AWS
- **Environments**:
  - Development: `http://localhost:3000`
  - Staging: `https://staging.example.com`
  - Production: `https://example.com`  
    (improving along the way.)

---

## 📌 Features

- ✅ User Authentication & Authorization (JWT/OAuth)
- ✅ Real-time Chat & Notifications (Socket.IO)
- ✅ Job & Queue Processing (BullMQ / Redis)
- ✅ File Storage (AWS S3 / GCP Storage)
- ✅ Admin Dashboard for Job Management
- ✅ API Rate Limiting & Security Enhancements
- List more features as developed.

---

## 🔗 API Documentation

### Authentication

- **POST** `/api/auth/register` → Register a new user
- **POST** `/api/auth/login` → Login and receive JWT

### Users

- **GET** `/api/users/suggested` → Get suggested users
- **POST** `/api/users/connections/:userId` → Send connection request

### Matches

- **POST** `/api/matches` → Create a new match
- **GET** `/api/matches/:id` → Fetch match details

👉 Full API docs available in **[Swagger/OpenAPI](./docs/API_REFERENCE.md)**  
The api documentation need to improve using swagger(open api specification)

---

## 🐞 Bug Fix & Issue Tracking

- Bugs/issues are tracked via **GitHub Issues**

**Bug Report Template**:

```yaml
### Bug Description
A clear and concise description of the issue.

### Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

### Expected Behavior
What should have happened?

### Screenshots/Logs
Attach logs or screenshots.
```

**Fix Workflow**:

1. Create a branch → `fix/issue-123`
2. Add test cases for the fix
3. Submit PR with `Fixes #123` in description

---

## 🛠️ Development Guidelines

### Branch Naming Convention

- `feature/xyz` – New feature
- `fix/xyz` – Bug fix
- `hotfix/xyz` – Urgent production issue
- `chore/xyz` – Non-functional updates

### Commit Message Convention ([Conventional Commits](https://www.conventionalcommits.org/))

```bash
feat(auth): add JWT authentication
fix(match): resolve crash when player list is empty
chore(ci): update GitHub Actions workflow
```

### Pull Request Rules

- Every PR must include:
  - ✅ Clear description of changes
  - ✅ Related issue number
  - ✅ Test cases (if applicable)
  - ✅ Code review approval

---

## 🔐 Security & Best Practices

- Use **dotenv** for secrets (`.env` never committed).
- Follow **OWASP Top 10** for secure coding.
- Enable **logging & monitoring** (Winston + Sentry).
- Run **tests before merging** (`npm test`).
- Use **Prettier + ESLint** for formatting.

---

## 📦 Deployment Process

1. Merge to `main` branch → triggers CI/CD pipeline.
2. Automated tests run.
3. Docker image is built and pushed.
4. Deployed to staging → QA verification.
5. Promoted to production on approval.

---

## 🧪 Testing

- **Unit Tests** → Jest
- **Integration Tests** → Supertest
- **End-to-End Tests** → Cypress

Run tests:

```bash
npm run test
```

---

## 👥 Contribution Guidelines

- Follow coding standards.
- Open PRs only to `develop` branch (unless hotfix).
- Document new features in this README + API docs.
- Keep commits small and focused.

---

## 📅 Release Notes & Changelog

- Maintained in [`CHANGELOG.md`](./CHANGELOG.md)
- Versioning follows **Semantic Versioning (SemVer)** → `MAJOR.MINOR.PATCH`

---

## 📚 Resources

**Will add resource along the way**

- [Coding Style Guide](./docs/CODING_GUIDELINES.md)
- [API Reference (Swagger)](./docs/API_REFERENCE.md)
