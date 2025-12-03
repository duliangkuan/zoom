# Vercel 环境变量一键配置指南

## 快速配置命令

### 方法 1: 使用批处理脚本（推荐）

直接运行：
```cmd
setup-vercel.cmd
```

脚本将引导您：
1. 配置 DATABASE_URL（数据库连接）
2. 配置 SMTP_USER（139邮箱）
3. 配置 SMTP_PASS（139邮箱授权码）
4. 运行数据库迁移（可选）
5. 重新部署应用（可选）

### 方法 2: 使用 PowerShell 脚本

运行：
```powershell
.\setup-vercel-env.ps1
```

### 方法 3: 手动使用 Vercel CLI

#### 1. 配置 DATABASE_URL

**选项 A: 使用 Vercel Postgres（推荐）**

1. 访问：https://vercel.com/duliangkuans-projects/zoom/storage
2. 点击 "Create Database" → 选择 "Postgres"
3. 创建后，Vercel 会自动添加 `DATABASE_URL` 环境变量
4. 或者复制连接字符串，然后运行：

```bash
echo "postgresql://..." | vercel env add DATABASE_URL production
echo "postgresql://..." | vercel env add DATABASE_URL preview
echo "postgresql://..." | vercel env add DATABASE_URL development
```

**选项 B: 使用外部 PostgreSQL**

```bash
# 替换为你的数据库连接字符串
echo "postgresql://user:password@host:port/database" | vercel env add DATABASE_URL production
echo "postgresql://user:password@host:port/database" | vercel env add DATABASE_URL preview
echo "postgresql://user:password@host:port/database" | vercel env add DATABASE_URL development
```

#### 2. 配置 SMTP_USER（139邮箱）

```bash
# 替换为你的139邮箱地址
echo "your-email@139.com" | vercel env add SMTP_USER production
echo "your-email@139.com" | vercel env add SMTP_USER preview
echo "your-email@139.com" | vercel env add SMTP_USER development
```

#### 3. 配置 SMTP_PASS（139邮箱授权码）

```bash
# 替换为你的139邮箱授权码
echo "your-auth-code" | vercel env add SMTP_PASS production --sensitive
echo "your-auth-code" | vercel env add SMTP_PASS preview --sensitive
echo "your-auth-code" | vercel env add SMTP_PASS development --sensitive
```

#### 4. 验证环境变量

```bash
vercel env ls production
```

#### 5. 运行数据库迁移

```bash
# 拉取环境变量到本地
vercel env pull .env.local

# 运行数据库迁移
npx prisma migrate deploy
```

#### 6. 重新部署应用

```bash
vercel --prod --yes
```

## 139 邮箱授权码获取方法

1. 登录 139 邮箱
2. 进入 **设置** → **账户**
3. 找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
4. 开启 **POP3/SMTP服务** 或 **IMAP/SMTP服务**
5. 点击 **生成授权码**，复制授权码

## 数据库推荐选项

### Vercel Postgres（推荐）

- ✅ 免费额度：每月 256MB 存储，60 小时计算时间
- ✅ 自动备份
- ✅ 自动配置 DATABASE_URL 环境变量
- ✅ 与 Vercel 无缝集成

创建步骤：
1. 访问：https://vercel.com/duliangkuans-projects/zoom/storage
2. 点击 "Create Database"
3. 选择 "Postgres"
4. 完成创建后，DATABASE_URL 会自动配置

### Supabase（免费替代方案）

- ✅ 免费额度：500MB 数据库，1GB 带宽
- ✅ 提供完整的 PostgreSQL 功能
- ✅ 有图形界面管理数据库

获取连接字符串：
1. 访问：https://supabase.com
2. 创建新项目
3. 在项目设置 → Database → Connection string 中获取

### Neon（推荐用于生产）

- ✅ 免费额度：0.5GB 存储，每月 100K 读取/写入
- ✅ 无服务器 PostgreSQL
- ✅ 自动扩展

## 完成配置后的步骤

1. **初始化数据库表结构**
   ```bash
   npx prisma migrate deploy
   ```

2. **初始化会议室数据**
   - 访问：https://zoom-nine-navy.vercel.app/init
   - 或使用 API：`POST https://zoom-nine-navy.vercel.app/api/init-rooms`

3. **验证部署**
   - 访问应用：https://zoom-nine-navy.vercel.app
   - 测试功能：预约会议、添加团队成员、签到等

## 故障排除

### 数据库连接失败

- 检查 DATABASE_URL 格式是否正确
- 确保数据库允许来自 Vercel IP 的连接（Vercel Postgres 自动配置）
- 检查数据库服务是否正常运行

### 邮件发送失败

- 验证 SMTP_USER 和 SMTP_PASS 是否正确
- 确保 139 邮箱已开启 SMTP 服务
- 检查授权码是否过期（需要重新生成）

### 构建失败

- 检查所有必需的环境变量是否已配置
- 查看 Vercel 部署日志：`vercel inspect <deployment-url> --logs`
- 确保数据库迁移已运行

## 有用的命令

```bash
# 查看所有环境变量
vercel env ls production

# 查看部署日志
vercel logs

# 查看部署详情
vercel inspect <deployment-url>

# 重新部署
vercel --prod --yes

# 拉取环境变量到本地
vercel env pull .env.local
```

