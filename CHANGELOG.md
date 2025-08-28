# 📜 Changelog

All notable changes to this project will be documented in this file.  
This project adheres to **[Semantic Versioning](https://semver.org/)**:

- **MAJOR** → Breaking changes
- **MINOR** → New features (backward-compatible)
- **PATCH** → Bug fixes & small improvements

---

## 🛠 How to Maintain It

- Every time you merge a PR → **update this changelog**.

- Keep entries categorized under:
  - **Added** → new features
  - **Changed** → updates to existing features
  - **Fixed** → bugs/security patches
  - **Removed** → deprecated/removed features

- Example workflow for a bug fix:
  - PR title: `fix(auth): refresh token expiry issue`
  - In `CHANGELOG.md`:

    ```markdown
    ## [1.0.1] - 2025-09-05

    ### Fixed

    - Refresh token expiration issue in auth service
    ```

---

## [Unreleased]

### Added

- Initial API documentation improvements
- Developer Handbook (`docs/` folder)

### Changed

- Updated README with contribution & security guidelines

### Fixed

- None yet

---

## [1.0.0] - 2025-08-28

### Added

- User Authentication (JWT)
- User Connections API
- Match creation & management
- Admin Dashboard
- Real-time chat & notifications
- Queue system for emails & images
- Docker & CI/CD setup
- Initial tests (Jest, Supertest)

### Changed

- Standardized coding conventions (Conventional Commits, Prettier + ESLint)

### Fixed

- Early bug fixes for match creation crash
- Security patches (input validation & helmet)
