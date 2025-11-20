# 🔄 重启服务器步骤

## 重要：必须完全重启服务器

环境变量配置已修复，但**必须完全重启开发服务器**才能生效。

## 重启步骤

### 1. 停止当前服务器

找到运行 `npm run dev` 的终端窗口，按：
```
Ctrl + C
```

等待几秒，确保进程完全停止。

### 2. 验证环境变量

在重启前，可以运行测试脚本验证配置：

```powershell
node test-env.js
```

应该看到：
```
✅ DATABASE_URL 配置成功！
数据库类型: SQLite
```

### 3. 重新启动服务器

```powershell
npm run dev
```

### 4. 验证服务器启动成功

等待看到类似输出：
```
✓ Ready in 2.3s
○ Local:        http://localhost:3000
```

### 5. 测试API

在浏览器中访问：
- http://localhost:3000/api/team-members

应该返回：
```json
{"success":true,"data":[]}
```

如果返回错误，说明配置仍有问题。

## 如果仍然失败

### 检查清单

1. ✅ `.env.local` 文件在项目根目录
2. ✅ 文件内容格式正确（无引号）：
   ```
   DATABASE_URL=file:./dev.db
   ```
3. ✅ 服务器已完全停止并重启
4. ✅ `dev.db` 文件已创建（运行 `Test-Path dev.db` 应该返回 `True`）

### 手动测试数据库连接

```powershell
$env:DATABASE_URL="file:./dev.db"
npx prisma db push
```

如果成功，说明数据库配置正确，问题可能在Next.js环境变量加载。

### 最后的解决方案

如果以上都不行，尝试：

1. **删除 `.next` 文件夹**：
   ```powershell
   Remove-Item -Recurse -Force .next
   ```

2. **重新生成Prisma Client**：
   ```powershell
   npm run db:generate
   ```

3. **完全重启**：
   ```powershell
   npm run dev
   ```

## 成功标志

配置成功后，你应该能够：

1. ✅ 访问 http://localhost:3000 不出现错误
2. ✅ 看到首页正常显示
3. ✅ 可以访问各个页面（预约、团队成员、签到）
4. ✅ API返回正常（不是500错误）


