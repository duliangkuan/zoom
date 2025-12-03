# Vercel 环境变量一键配置脚本
# 此脚本将帮助您配置 Vercel 环境变量

Write-Host "=== Vercel 环境变量一键配置 ===" -ForegroundColor Green
Write-Host ""

# 检查 Vercel CLI 是否已登录
Write-Host "检查 Vercel CLI 登录状态..." -ForegroundColor Yellow
$vercelUser = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 未登录 Vercel，请先运行 'vercel login'" -ForegroundColor Red
    exit 1
}
Write-Host "已登录用户: $vercelUser" -ForegroundColor Green
Write-Host ""

# 1. 配置 DATABASE_URL
Write-Host "步骤 1: 配置数据库连接 (DATABASE_URL)" -ForegroundColor Cyan
Write-Host ""
Write-Host "选项 1: 使用 Vercel Postgres (推荐)" -ForegroundColor Yellow
Write-Host "选项 2: 使用外部 PostgreSQL 数据库" -ForegroundColor Yellow
Write-Host ""
$dbChoice = Read-Host "请选择选项 (1 或 2)"

if ($dbChoice -eq "1") {
    Write-Host ""
    Write-Host "正在创建 Vercel Postgres 数据库..." -ForegroundColor Yellow
    Write-Host "提示: 请访问 https://vercel.com/duliangkuans-projects/zoom/storage 手动创建数据库" -ForegroundColor Yellow
    Write-Host "创建后，请在 Vercel 网页界面获取 DATABASE_URL，然后在这里输入：" -ForegroundColor Yellow
    Write-Host ""
    $databaseUrl = Read-Host "请输入 DATABASE_URL (格式: postgresql://user:password@host:port/database)"
} else {
    $databaseUrl = Read-Host "请输入 PostgreSQL 数据库连接字符串 (格式: postgresql://user:password@host:port/database)"
}

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "警告: 未输入 DATABASE_URL，将跳过此配置" -ForegroundColor Yellow
} else {
    Write-Host "正在添加 DATABASE_URL 到生产环境..." -ForegroundColor Yellow
    echo $databaseUrl | vercel env add DATABASE_URL production
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ DATABASE_URL 已添加" -ForegroundColor Green
    } else {
        Write-Host "✗ 添加 DATABASE_URL 失败" -ForegroundColor Red
    }
    Write-Host ""
    
    # 同时添加到 preview 和 development
    Write-Host "正在添加 DATABASE_URL 到预览环境..." -ForegroundColor Yellow
    echo $databaseUrl | vercel env add DATABASE_URL preview
    Write-Host "正在添加 DATABASE_URL 到开发环境..." -ForegroundColor Yellow
    echo $databaseUrl | vercel env add DATABASE_URL development
    Write-Host ""
}

# 2. 配置 SMTP_USER
Write-Host "步骤 2: 配置 139 邮箱 (SMTP_USER)" -ForegroundColor Cyan
Write-Host ""
$smtpUser = Read-Host "请输入 139 邮箱地址 (例如: your-email@139.com)"

if ([string]::IsNullOrWhiteSpace($smtpUser)) {
    Write-Host "警告: 未输入 SMTP_USER，将跳过此配置" -ForegroundColor Yellow
} else {
    Write-Host "正在添加 SMTP_USER..." -ForegroundColor Yellow
    echo $smtpUser | vercel env add SMTP_USER production
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ SMTP_USER 已添加" -ForegroundColor Green
    }
    
    echo $smtpUser | vercel env add SMTP_USER preview
    echo $smtpUser | vercel env add SMTP_USER development
    Write-Host ""
}

# 3. 配置 SMTP_PASS
Write-Host "步骤 3: 配置 139 邮箱授权码 (SMTP_PASS)" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 139 邮箱授权码获取方法：" -ForegroundColor Yellow
Write-Host "1. 登录 139 邮箱" -ForegroundColor Yellow
Write-Host "2. 设置 → 账户" -ForegroundColor Yellow
Write-Host "3. 开启 POP3/SMTP 服务" -ForegroundColor Yellow
Write-Host "4. 获取授权码" -ForegroundColor Yellow
Write-Host ""
$smtpPass = Read-Host "请输入 139 邮箱授权码" -AsSecureString
$smtpPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($smtpPass)
)

if ([string]::IsNullOrWhiteSpace($smtpPassPlain)) {
    Write-Host "警告: 未输入 SMTP_PASS，将跳过此配置" -ForegroundColor Yellow
} else {
    Write-Host "正在添加 SMTP_PASS..." -ForegroundColor Yellow
    echo $smtpPassPlain | vercel env add SMTP_PASS production
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ SMTP_PASS 已添加" -ForegroundColor Green
    }
    
    echo $smtpPassPlain | vercel env add SMTP_PASS preview
    echo $smtpPassPlain | vercel env add SMTP_PASS development
    Write-Host ""
}

# 4. 总结
Write-Host ""
Write-Host "=== 配置完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "已配置的环境变量：" -ForegroundColor Cyan
vercel env ls production
Write-Host ""

# 5. 询问是否运行数据库迁移
Write-Host "下一步：" -ForegroundColor Yellow
Write-Host "1. 运行数据库迁移创建表结构" -ForegroundColor Yellow
Write-Host "2. 重新部署应用以应用环境变量" -ForegroundColor Yellow
Write-Host ""

$runMigration = Read-Host "是否现在运行数据库迁移? (y/n)"

if ($runMigration -eq "y" -or $runMigration -eq "Y") {
    Write-Host ""
    Write-Host "正在拉取环境变量到本地..." -ForegroundColor Yellow
    vercel env pull .env.local
    Write-Host ""
    
    Write-Host "正在运行数据库迁移..." -ForegroundColor Yellow
    npx prisma migrate deploy
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 数据库迁移完成" -ForegroundColor Green
    } else {
        Write-Host "✗ 数据库迁移失败，请检查 DATABASE_URL 是否正确" -ForegroundColor Red
    }
}

Write-Host ""
$redeploy = Read-Host "是否现在重新部署应用以应用环境变量? (y/n)"

if ($redeploy -eq "y" -or $redeploy -eq "Y") {
    Write-Host ""
    Write-Host "正在重新部署到生产环境..." -ForegroundColor Yellow
    vercel --prod --yes
}

Write-Host ""
Write-Host "=== 完成 ===" -ForegroundColor Green
Write-Host "应用地址: https://zoom-nine-navy.vercel.app" -ForegroundColor Cyan

