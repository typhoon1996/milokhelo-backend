# 📑 `SECURITY.md`

## 🔐 Security Guidelines

We follow **OWASP Top 10** practices.

---

## 1. Secrets Management

- Use `.env` for credentials (never commit).
- Rotate secrets regularly.

## 2. Authentication

- Use **JWT** with expiration.
- Refresh tokens securely stored.

## 3. Input Validation

- Validate all inputs with **express-validator**.
- Sanitize user-provided data.

## 4. Common Protections

- Rate limiting (prevent brute force).
- Helmet middleware (secure headers).
- CSRF protection.
- HTTPS everywhere.

## 5. Logging & Monitoring

- Use **Winston** for logging.
- Capture errors with **Sentry**.
