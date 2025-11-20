# 数据库配置完成 ✅

## 已完成的配置

1. ✅ 创建了 `.env.local` 文件
2. ✅ 配置了 SQLite 数据库（`dev.db`）
3. ✅ 数据库Schema已推送成功

## 当前配置

- **数据库类型**: SQLite（适合快速测试）
- **数据库文件**: `dev.db`（在项目根目录）
- **环境变量文件**: `.env.local`

## 下一步操作

### 1. 重启开发服务器

由于环境变量已更新，需要重启开发服务器：

1. **停止当前服务器**：在运行 `npm run dev` 的终端按 `Ctrl + C`
2. **重新启动**：
   ```bash
   npm run dev
   ```

### 2. 初始化会议室数据

服务器启动后，访问以下URL初始化8个会议室：

**方法1：浏览器访问**
```
http://localhost:3000/api/init-rooms
```

**方法2：使用PowerShell**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/init-rooms" -Method POST
```

### 3. 开始使用

- 访问 http://localhost:3000
- 添加团队成员
- 预约会议
- 测试签到功能

## 注意事项

- SQLite数据库文件 `dev.db` 已创建在项目根目录
- 如果以后想使用PostgreSQL，只需修改 `.env.local` 中的 `DATABASE_URL` 并更新 `prisma/schema.prisma` 中的 `provider` 为 `"postgresql"`

## 切换到PostgreSQL（可选）

如果需要使用PostgreSQL：

1. 修改 `prisma/schema.prisma`：
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. 修改 `.env.local`：
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/meeting_room_db"
   ```

3. 运行：
   ```bash
   npm run db:generate
   npm run db:push
   ```


