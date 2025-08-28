# 🚀 Deployment Guide

This project uses **Docker** + **CI/CD** for deployment.

---

## Prerequisites

- Docker & Docker Compose
- Node.js (v18+)
- PostgreSQL / MySQL
- AWS/GCP credentials for storage

---

## Steps

### 1. Clone Repository

```bash
git clone https://github.com/org/project.git
cd project
```

### 2. Setup Environment

Create `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=password
JWT_SECRET=supersecret
AWS_BUCKET=my-app-bucket
```

### 3. Build & Run

```bash
docker-compose up --build
```

### 4. Staging & Production

- **Staging** → Deploy from `develop` branch
- **Production** → Deploy from `main` branch

CI/CD handles:

1. Run tests
2. Build Docker image
3. Push to registry
4. Deploy to Kubernetes/Server
