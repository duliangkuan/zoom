@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo Vercel Environment Variables Setup
echo ========================================
echo.

REM Check if Vercel CLI is logged in
echo [1/5] Checking Vercel CLI login status...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Not logged in. Please run: vercel login
    pause
    exit /b 1
)
echo [OK] Vercel CLI is logged in
echo.

REM 1. Configure DATABASE_URL
echo [2/5] Configure Database Connection (DATABASE_URL)
echo.
echo Option 1: Use Vercel Postgres (Recommended)
echo   Visit: https://vercel.com/duliangkuans-projects/zoom/storage
echo   Create Postgres database, then copy DATABASE_URL
echo.
echo Option 2: Use External PostgreSQL Database
echo   Format: postgresql://user:password@host:port/database
echo.
set /p DATABASE_URL="Enter DATABASE_URL (Press Enter to skip): "

if not "%DATABASE_URL%"=="" (
    echo [Adding] DATABASE_URL to production...
    echo %DATABASE_URL% | vercel env add DATABASE_URL production
    echo %DATABASE_URL% | vercel env add DATABASE_URL preview
    echo %DATABASE_URL% | vercel env add DATABASE_URL development
    echo [OK] DATABASE_URL added
) else (
    echo [!] Skipping DATABASE_URL configuration
)
echo.

REM 2. Configure SMTP_USER
echo [3/5] Configure QQ Email (SMTP_USER)
set /p SMTP_USER="Enter QQ email (e.g. your-email@qq.com, Press Enter to skip): "

if not "%SMTP_USER%"=="" (
    echo [Adding] SMTP_USER...
    echo %SMTP_USER% | vercel env add SMTP_USER production
    echo %SMTP_USER% | vercel env add SMTP_USER preview
    echo %SMTP_USER% | vercel env add SMTP_USER development
    echo [OK] SMTP_USER added
) else (
    echo [!] Skipping SMTP_USER configuration
)
echo.

REM 3. Configure SMTP_PASS
echo [4/5] Configure QQ Email Auth Code (SMTP_PASS)
echo.
echo How to get QQ email auth code:
echo   1. Login to QQ email
echo   2. Settings -^> Account
echo   3. Enable POP3/SMTP service
echo   4. Get auth code
echo.
set /p SMTP_PASS="Enter QQ email auth code (Press Enter to skip): "

if not "%SMTP_PASS%"=="" (
    echo [Adding] SMTP_PASS...
    echo %SMTP_PASS% | vercel env add SMTP_PASS production --sensitive
    echo %SMTP_PASS% | vercel env add SMTP_PASS preview --sensitive
    echo %SMTP_PASS% | vercel env add SMTP_PASS development --sensitive
    echo [OK] SMTP_PASS added
) else (
    echo [!] Skipping SMTP_PASS configuration
)
echo.

REM 4. Show configured environment variables
echo [5/5] View configured environment variables
echo.
vercel env ls production
echo.

REM 5. Ask to run database migration
set /p RUN_MIGRATION="Run database migration now? (y/n): "

if /i "%RUN_MIGRATION%"=="y" (
    echo [Pulling] Environment variables to local...
    vercel env pull .env.local
    echo.
    echo [Running] Database migration...
    npx prisma migrate deploy
    if %errorlevel% equ 0 (
        echo [OK] Database migration completed
    ) else (
        echo [!] Database migration failed, please check DATABASE_URL
    )
    echo.
)

REM 6. Ask to redeploy
set /p REDEPLOY="Redeploy application now? (y/n): "

if /i "%REDEPLOY%"=="y" (
    echo [Deploying] to production...
    vercel --prod --yes
    echo.
)

echo.
echo ========================================
echo Configuration Complete!
echo ========================================
echo App URL: https://zoom-nine-navy.vercel.app
echo.
pause

