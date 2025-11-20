# 环境变量配置修复指南

## 问题诊断

如果仍然看到 `DATABASE_URL` 错误，请按以下步骤检查：

### 1. 检查 .env.local 文件

确保 `.env.local` 文件在项目根目录，内容格式如下（**不要使用引号**）：

```env
DATABASE_URL=file:./dev.db
SMTP_USER=your-qq-email@qq.com
SMTP_PASS=your-qq-email-auth-code
```

**重要**：SQLite的DATABASE_URL格式是 `file:./dev.db`，**不要加引号**。

### 2. 验证环境变量

运行以下命令验证环境变量是否被正确读取：

```powershell
node -e "require('dotenv').config({path:'.env.local'}); console.log('DATABASE_URL:', process.env.DATABASE_URL)"
```

应该输出：`DATABASE_URL: file:./dev.db`

### 3. 重启开发服务器

**必须完全停止并重新启动**：

1. 在运行 `npm run dev` 的终端按 `Ctrl + C`
2. 等待几秒确保进程完全停止
3. 重新运行：`npm run dev`

### 4. 检查数据库文件

确认 `dev.db` 文件已创建：

```powershell
Test-Path dev.db
```

如果返回 `False`，运行：

```powershell
$env:DATABASE_URL="file:./dev.db"; npx prisma db push
```

### 5. 如果仍然失败

尝试以下解决方案：

#### 方案A：使用绝对路径

修改 `.env.local`：

```env
DATABASE_URL=file:C:/Users/23303/OneDrive/Desktop/zoom/dev.db
```

#### 方案B：使用PostgreSQL

1. 安装PostgreSQL
2. 创建数据库
3. 修改 `prisma/schema.prisma`：
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. 修改 `.env.local`：
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/meeting_room_db
   ```
5. 运行：
   ```bash
   npm run db:generate
   npm run db:push
   ```

#### 方案C：使用Supabase（免费云数据库）

1. 访问 https://supabase.com
2. 创建新项目
3. 在项目设置中获取连接字符串
4. 修改 `.env.local`：
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   ```
5. 修改 `prisma/schema.prisma` 使用 `postgresql`
6. 运行 `npm run db:push`

## 常见错误

### 错误1：Environment variable not found: DATABASE_URL

**原因**：`.env.local` 文件不存在或格式错误

**解决**：
- 确认文件在项目根目录
- 确认文件名是 `.env.local`（不是 `.env.local.txt`）
- 确认格式正确（不要有多余的引号）

### 错误2：EPERM: operation not permitted

**原因**：Prisma Client文件被锁定（开发服务器正在运行）

**解决**：
- 停止开发服务器
- 删除 `node_modules/.prisma` 文件夹
- 重新运行 `npm run db:generate`

### 错误3：SQLite database file not found

**原因**：数据库文件路径不正确

**解决**：
- 使用绝对路径
- 或确保 `dev.db` 文件在项目根目录

## 验证配置成功

如果配置成功，你应该能够：

1. 访问 http://localhost:3000 不出现错误
2. 访问 http://localhost:3000/api/team-members 返回空数组 `[]`
3. 访问 http://localhost:3000/api/init-rooms (POST) 成功创建会议室


