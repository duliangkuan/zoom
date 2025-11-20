# 修复 Prisma Client 错误

## 问题
错误信息显示：`Unknown argument 'authCode'`，这是因为 Prisma Client 还没有重新生成。

## 解决方法

### 方法1：停止服务器后重新生成（推荐）

1. **停止开发服务器**
   - 找到运行 `npm run dev` 的终端窗口
   - 按 `Ctrl + C` 停止服务器

2. **重新生成 Prisma Client**
   ```powershell
   $env:DATABASE_URL="file:C:\Users\23303\OneDrive\Desktop\zoom\dev.db"
   npx prisma generate
   ```

3. **重新启动服务器**
   ```powershell
   npm run dev
   ```

### 方法2：删除 .prisma 文件夹后重新生成

如果方法1不行，尝试：

1. **停止开发服务器**（Ctrl + C）

2. **删除 Prisma Client 缓存**
   ```powershell
   Remove-Item -Recurse -Force node_modules\.prisma
   ```

3. **重新生成**
   ```powershell
   $env:DATABASE_URL="file:C:\Users\23303\OneDrive\Desktop\zoom\dev.db"
   npx prisma generate
   ```

4. **重新启动服务器**
   ```powershell
   npm run dev
   ```

## 验证

重新生成后，应该能够：
- 正常添加团队成员（包含授权码字段）
- 不再出现 `Unknown argument 'authCode'` 错误

