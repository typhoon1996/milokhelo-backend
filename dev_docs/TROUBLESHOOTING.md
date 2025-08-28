# 📑 `TROUBLESHOOTING.md`

## 🛠️ Troubleshooting Guide

Common issues & fixes.

---

## 1. Database Connection Failed

- Ensure DB service is running (`docker ps`).
- Check `.env` values for DB host/user/pass.
- Run `npx sequelize-cli db:migrate`.

---

## 2. App Crashes on Startup

- Run `npm run lint` to detect syntax errors.
- Delete `node_modules` & reinstall (`npm install`).
- Ensure `.env` file is present.

---

## 3. Tests Failing

- Run `npm run test:debug` to inspect.
- Reset DB before tests.
- Ensure mock data is up-to-date.

---

## 4. API Requests Failing

- Check if backend is running (`npm run dev`).
- Verify JWT token not expired.
- Use Postman/Insomnia for debugging.
