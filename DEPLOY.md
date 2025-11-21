# Vercel 部署指南

本指南将帮助你将会议室管理系统部署到 Vercel。

## 前提条件

1. GitHub 账户
2. Vercel 账户（可通过 GitHub 登录）
3. 数据库服务（推荐使用 Vercel Postgres 或其他 PostgreSQL 服务）
4. QQ 邮箱 SMTP 配置

## 部署步骤

### 1. 确保代码已推送到 GitHub

代码已经连接到 GitHub 仓库：`git@github.com:duliangkuan/zoom.git`

如果需要推送最新更改：

```bash
git add .
git commit -m "更新配置以支持 Vercel 部署"
git push origin main
```

### 2. 在 Vercel 上创建项目

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账户登录
3. 点击 "Add New Project"（添加新项目）
4. 导入你的 GitHub 仓库：`duliangkuan/zoom`
5. 点击 "Import"

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量：

- **DATABASE_URL**：PostgreSQL 数据库连接字符串
  ```
  格式：postgresql://user:password@host:port/database
  示例：postgresql://user:pass@localhost:5432/meeting_room_db
  ```

- **SMTP_USER**：QQ 邮箱地址
  ```
  示例：your-email@qq.com
  ```

- **SMTP_PASS**：QQ 邮箱 SMTP 授权码
  ```
  从 QQ 邮箱设置中获取
  ```

#### 配置步骤：

1. 在 Vercel 项目页面，进入 "Settings"（设置）
2. 选择 "Environment Variables"（环境变量）
3. 添加上述三个环境变量
4. 确保为 Production、Preview 和 Development 都添加了这些变量
5. 点击 "Save"

### 4. 配置数据库

#### 选项 A：使用 Vercel Postgres（推荐）

1. 在 Vercel 项目页面，进入 "Storage"（存储）标签
2. 点击 "Create Database"（创建数据库）
3. 选择 "Postgres"
4. 按照提示创建数据库
5. Vercel 会自动将 `DATABASE_URL` 环境变量添加到你的项目中

#### 选项 B：使用外部 PostgreSQL 服务

可以使用以下服务之一：

- **Supabase**：https://supabase.com
- **Neon**：https://neon.tech
- **PlanetScale**：https://planetscale.com（需要切换为 PostgreSQL 模式）
- **Railway**：https://railway.app

创建数据库后，复制连接字符串并添加到 Vercel 环境变量中的 `DATABASE_URL`。

### 5. 运行数据库迁移

在首次部署后，需要运行数据库迁移来创建表结构。

#### 方法 1：使用 Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 链接到项目
vercel link

# 运行迁移
vercel env pull .env.local
npx prisma migrate deploy
```

#### 方法 2：在 Vercel 部署后运行

1. 部署完成后，进入 Vercel 项目设置
2. 在 "Deployments"（部署）标签中找到最新部署
3. 进入部署详情
4. 使用 Vercel 的终端或通过 SSH 运行：
   ```bash
   npx prisma migrate deploy
   ```

#### 方法 3：使用 Vercel Postgres

如果使用 Vercel Postgres，可以在项目设置中添加一个 Build Command：

在 `vercel.json` 中已经配置了构建命令，但迁移需要在首次部署后手动运行。

### 6. 初始化数据库表

部署完成后，访问你的应用并初始化会议室数据：

1. 访问：`https://your-app.vercel.app/api/rooms/init`（POST 请求）
2. 或访问初始化页面：`https://your-app.vercel.app/init`

### 7. 配置 QQ 邮箱 SMTP

1. 登录 QQ 邮箱
2. 进入 "设置" → "账户"
3. 找到 "POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启 "POP3/SMTP服务" 或 "IMAP/SMTP服务"
5. 按照提示获取授权码
6. 将授权码添加到 Vercel 环境变量 `SMTP_PASS` 中

### 8. 部署

完成上述配置后：

1. Vercel 会自动检测 GitHub 仓库的推送
2. 每次推送到 `main` 分支都会触发自动部署
3. 部署完成后，Vercel 会提供一个 URL（例如：`https://zoom-xxx.vercel.app`）

### 9. 验证部署

部署成功后，访问以下页面验证功能：

- 首页：`https://your-app.vercel.app`
- 会议室预约：`https://your-app.vercel.app/booking`
- 团队成员管理：`https://your-app.vercel.app/team-members`
- 签到页面：`https://your-app.vercel.app/check-in`

## 故障排除

### 数据库连接问题

- 确保 `DATABASE_URL` 环境变量已正确配置
- 检查数据库服务是否允许来自 Vercel 的连接
- 对于 Supabase/Neon，确保 IP 地址在白名单中（通常需要设置为允许所有 IP）

### Prisma 迁移问题

如果遇到迁移错误：

```bash
# 生成 Prisma Client
npx prisma generate

# 创建新的迁移
npx prisma migrate dev --name init

# 在生产环境部署迁移
npx prisma migrate deploy
```

### 构建错误

- 检查 Node.js 版本（Vercel 默认使用 Node.js 18+）
- 确保所有依赖都已正确安装
- 检查 `package.json` 中的脚本是否正确

### 邮件发送问题

- 验证 `SMTP_USER` 和 `SMTP_PASS` 环境变量
- 确保 QQ 邮箱 SMTP 服务已开启
- 检查授权码是否正确

## 持续部署

项目已配置为自动部署：

- 推送到 `main` 分支 → 自动部署到生产环境
- 创建 Pull Request → 自动创建预览部署

## 有用的命令

```bash
# 查看 Vercel 部署日志
vercel logs

# 查看环境变量
vercel env ls

# 拉取环境变量到本地
vercel env pull .env.local

# 打开 Prisma Studio（需要本地连接数据库）
npx prisma studio
```

## 需要帮助？

如果遇到问题，请检查：

1. Vercel 部署日志
2. 环境变量配置
3. 数据库连接状态
4. Prisma 迁移状态

