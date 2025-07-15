@echo off
CHCP 65001 >nul
SETLOCAL ENABLEEXTENSIONS
ECHO ===============================================
ECHO 🚀 Starting PostgreSQL and Redis Docker Services
ECHO ===============================================

REM ===========================
REM Configuration
REM ===========================
SET "POSTGRES_CONTAINER_NAME=prod-postgres-db"
SET "REDIS_CONTAINER_NAME=prod-redis-cache"
SET "POSTGRES_PORT=5432"
SET "REDIS_PORT=6379"
SET "POSTGRES_PASSWORD=ReplaceWithStrongPassword"
SET "POSTGRES_VOLUME=pgdata_volume"
SET "REDIS_VOLUME=redisdata_volume"
SET "NETWORK_NAME=milokhelo-network"

REM ===========================
REM Create network (if not exists)
REM ===========================
docker network inspect %NETWORK_NAME% >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO 🌐 Creating Docker network: %NETWORK_NAME%
    docker network create %NETWORK_NAME%
    IF %ERRORLEVEL% NEQ 0 (
        ECHO ❌ Failed to create Docker network.
        GOTO :EOF
    )
)

REM ===========================
REM Clean up old containers
REM ===========================
FOR %%C IN (%POSTGRES_CONTAINER_NAME% %REDIS_CONTAINER_NAME%) DO (
    docker stop %%C >nul 2>&1
    docker rm %%C >nul 2>&1
)

REM ===========================
REM Start PostgreSQL
REM ===========================
ECHO 🐘 Starting PostgreSQL...
docker volume create %POSTGRES_VOLUME% >nul 2>&1

docker run --name %POSTGRES_CONTAINER_NAME% ^
    --network=%NETWORK_NAME% ^
    -e POSTGRES_PASSWORD=%POSTGRES_PASSWORD% ^
    -p %POSTGRES_PORT%:5432 ^
    -v %POSTGRES_VOLUME%:/var/lib/postgresql/data ^
    -d postgres:15-alpine

IF %ERRORLEVEL% NEQ 0 (
    ECHO ❌ Failed to start PostgreSQL container. Ensure Docker is running and port %POSTGRES_PORT% is not in use.
    GOTO :EOF
)
ECHO ✅ PostgreSQL is running on port %POSTGRES_PORT%
ECHO ⏳ Waiting for PostgreSQL to initialize...
TIMEOUT /T 5 >nul

REM ===========================
REM Start Redis
REM ===========================
ECHO 🧠 Starting Redis...
docker volume create %REDIS_VOLUME% >nul 2>&1

docker run --name %REDIS_CONTAINER_NAME% ^
    --network=%NETWORK_NAME% ^
    -p %REDIS_PORT%:6379 ^
    -v %REDIS_VOLUME%:/data ^
    -d redis:7-alpine ^
    --appendonly yes

IF %ERRORLEVEL% NEQ 0 (
    ECHO ❌ Failed to start Redis container. Ensure Docker is running and port %REDIS_PORT% is not in use.
    GOTO :EOF
)
ECHO ✅ Redis is running on port %REDIS_PORT%

REM ===========================
REM Summary
REM ===========================
ECHO.
ECHO ✅ All services are up and running!
ECHO -----------------------------------------------
ECHO 🐘 PostgreSQL:
ECHO   - Host: localhost
ECHO   - Port: %POSTGRES_PORT%
ECHO   - User: postgres
ECHO   - Password: [hidden for security]
ECHO   - Data Volume: %POSTGRES_VOLUME%
ECHO.
ECHO 🧠 Redis:
ECHO   - Host: localhost
ECHO   - Port: %REDIS_PORT%
ECHO   - Data Volume: %REDIS_VOLUME%
ECHO -----------------------------------------------
ECHO 🛑 To stop and remove containers:
ECHO   docker stop %POSTGRES_CONTAINER_NAME% %REDIS_CONTAINER_NAME%
ECHO   docker rm %POSTGRES_CONTAINER_NAME% %REDIS_CONTAINER_NAME%
ECHO.
ECHO 🔐 REMINDER: Never hardcode production passwords in scripts.
ECHO 💡 TIP: Use .env files or Docker secrets for secure credential management.

ENDLOCAL
