<!--
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-26 15:30:00
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-26 15:30:00
 * @FilePath: docs/getting-started/README.md
 * @Description: 项目启动完整指南
-->

# 项目启动指南

本指南将帮助您从零开始快速启动和运行 Flutter Ex1 后端服务。

## 🏁 快速启动（5分钟）

### 1. 环境准备

确保您的系统已安装以下软件：

```bash
# 检查 Node.js 版本（需要 >= 18.0.0）
node --version

# 检查 npm 版本
npm --version

# 检查 MySQL 版本（需要 >= 8.0）
mysql --version
```

如果未安装，请访问以下链接下载：

- [Node.js](https://nodejs.org/) (推荐 LTS 版本)
- [MySQL](https://dev.mysql.com/downloads/mysql/) 或使用 Docker

### 2. 克隆项目

```bash
git clone <repository-url>
cd flutter_ex1_back
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置环境

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑配置文件（必需）
nano .env.local
# 或者使用您喜欢的编辑器
code .env.local
```

**至少需要配置以下必需项：**

```dotenv
# 数据库配置（必需）
DATABASE_URL=mysql://username:password@localhost:3306/ex1_db

# JWT配置（必需）
JWT_SECRET=your-super-secret-jwt-key-here

# API Key配置（必需）
API_KEY=your-api-key-here

# 腾讯云COS配置（必需）
TENCENT_COS_SECRET_ID=your-secret-id
TENCENT_COS_SECRET_KEY=your-secret-key
TENCENT_COS_REGION=ap-guangzhou
TENCENT_COS_BUCKET=your-bucket-name
```

### 5. 启动服务

```bash
# 开发模式（推荐）
npm run dev

# 或者生产模式
npm run build && npm start
```

如果一切配置正确，您将看到类似输出：

```
🚀 Server is running on http://localhost:3000
📝 API Documentation: http://localhost:3000/api-docs
🔧 Environment: development
```

## 🛠️ 开发环境设置

### 开发工具配置

#### 1. VS Code 插件推荐

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

#### 2. ESLint 实时检查

```bash
# 启动开发服务器并实时检查代码
npm run dev:lint
```

#### 3. 代码格式化

```bash
# 自动修复代码问题
npm run lint:fix

# 代码格式化
npm run format
```

### 数据库设置

#### 1. 创建数据库

```sql
-- 登录 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE ex1_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选）
CREATE USER 'ex1_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ex1_db.* TO 'ex1_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. 初始化数据库结构

```bash
# 应用数据库迁移
npm run update-schema
```

#### 3. 验证数据库连接

启动应用后，检查控制台输出是否包含：

```
✅ Database connected successfully
```

## 🔍 常见问题排查

### 问题1: 端口被占用

```bash
# 查看端口占用
netstat -ano | findstr :3000

# 终止占用进程
taskkill /PID <PID号> /F
```

### 问题2: 数据库连接失败

1. **检查数据库服务状态**

   ```bash
   # Windows
   net start mysql

   # 或重启 MySQL 服务
   ```

2. **验证连接参数**

   ```bash
   # 测试数据库连接
   mysql -u username -p -h host -P port database_name
   ```

3. **检查防火墙设置**

### 问题3: 环境变量未生效

1. **确保文件命名正确**

   ```bash
   # 正确
   .env.local

   # 错误
   .env.local.txt
   .env
   ```

2. **重启开发服务器**

### 问题4: 权限错误

```bash
# Windows PowerShell（以管理员身份运行）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 或使用不同的端口
PORT=3001 npm run dev
```

## 📊 监控和调试

### 日志查看

```bash
# 查看应用日志
npm run dev  # 控制台实时输出

# 或在生产环境中
pm2 logs ex1-api
```

### API 测试

#### 使用 curl

```bash
# 健康检查
curl http://localhost:3000/health

# 获取 API 文档
curl http://localhost:3000/api-docs
```

#### 使用 Postman

1. 导入 API 集合（如果提供）
2. 设置环境变量：
   - `base_url`: `http://localhost:3000`
   - `api_key`: `your-api-key-here`

### 性能监控

```bash
# 启动开发服务器并监控性能
npm run dev

# 检查内存使用
tasklist | findstr node

# 检查网络连接
netstat -ano | findstr :3000
```

## 🔄 常用开发流程

### 1. 日常开发

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖（如果有）
npm install

# 3. 更新数据库结构（如果需要）
npm run update-schema

# 4. 启动开发服务器
npm run dev
```

### 2. 代码质量检查

```bash
# 完整的质量检查
npm run quality

# 或分步执行
npm run lint
npm run format:check
```

### 3. 数据库操作

```bash
# 备份数据
npm run backup

# 恢复数据
npm run restore

# 安全更新数据库结构
npm run update-schema
```

## 🚀 部署准备

### 构建生产版本

```bash
# 构建优化版本
npm run build:prod

# 或构建混淆版本（生产环境推荐）
npm run build:prodObfuscate
```

### 环境变量检查

```bash
# 验证生产环境配置
NODE_ENV=production node -e "require('dotenv').config(); console.log('✅ Environment variables loaded')"
```

## 📞 获取帮助

### 文档资源

- [环境配置](docs/configuration/README.md) - 详细的环境变量说明
- [开发指南](docs/development/) - 开发规范和最佳实践
- [API 文档](docs/api/) - 接口文档和数据模型

### 技术支持

- 查看项目 README.md 中的作者信息
- 检查项目 Issues 页面
- 参考 `docs/` 目录下的详细文档

---

> 💡 **提示**: 建议按照本指南的顺序进行设置，确保每个步骤都正确完成后再进行下一步。
