<!--
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-26 15:30:00
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-26 15:30:00
 * @FilePath: docs/configuration/README.md
 * @Description: 环境配置详细指南
-->

# 环境配置指南

本项目使用 `dotenv` 管理环境变量，支持多环境配置和敏感信息保护。

## 📁 环境文件结构

### 环境文件说明

- **`.env.example`**: 环境变量模板文件，包含所有需要的环境变量名称和默认值
- **`.env`**: 开发环境默认配置文件，包含公开的配置信息
- **`.env.local`**: 本地开发环境配置文件，包含敏感配置信息（不提交到版本控制）

### 配置步骤

1. **复制环境变量模板文件**：

   ```bash
   cp .env.example .env.local
   ```

2. **编辑 `.env.local` 文件，配置敏感信息**：

   ```dotenv
   # 服务器配置
   PORT=3000
   NODE_ENV=development

   # API Key配置
   API_KEY=your-api-key-here

   # JWT配置
   JWT_SECRET=your-jwt-secret-key-here
   JWT_EXPIRES_IN=30d

   # 腾讯云OSS配置
   TENCENT_COS_SECRET_ID=your-tencent-oss-secret-id
   TENCENT_COS_SECRET_KEY=your-tencent-oss-secret-key
   TENCENT_COS_REGION=ap-guangzhou
   TENCENT_COS_BUCKET=your-bucket-name

   # 数据库配置
   DATABASE_URL=mysql://username:password@host:port/database-name
   ```

3. **确保 `.env.local` 文件在 `.gitignore` 中被忽略**

## 🔧 配置项详细说明

### 服务器配置

| 配置项     | 说明           | 默认值      | 必需 |
| ---------- | -------------- | ----------- | ---- |
| `PORT`     | 服务器监听端口 | 3000        | ✅   |
| `NODE_ENV` | 运行环境       | development | ✅   |

### API Key配置

| 配置项    | 说明        | 格式   | 必需 |
| --------- | ----------- | ------ | ---- |
| `API_KEY` | API访问密钥 | 字符串 | ✅   |

### JWT配置

| 配置项           | 说明        | 默认值 | 必需 |
| ---------------- | ----------- | ------ | ---- |
| `JWT_SECRET`     | JWT签名密钥 | -      | ✅   |
| `JWT_EXPIRES_IN` | JWT过期时间 | 30d    | ❌   |

### 腾讯云COS配置

| 配置项                   | 说明              | 示例         | 必需 |
| ------------------------ | ----------------- | ------------ | ---- |
| `TENCENT_COS_SECRET_ID`  | 腾讯云访问密钥ID  | AKID...      | ✅   |
| `TENCENT_COS_SECRET_KEY` | 腾讯云访问密钥Key | ...          | ✅   |
| `TENCENT_COS_REGION`     | 存储桶所在地域    | ap-guangzhou | ✅   |
| `TENCENT_COS_BUCKET`     | COS存储桶名称     | bucket-name  | ✅   |

### 数据库配置

| 配置项         | 说明                | 格式                                         | 必需 |
| -------------- | ------------------- | -------------------------------------------- | ---- |
| `DATABASE_URL` | MySQL数据库连接地址 | mysql://username:password@host:port/database | ✅   |

## 🏗️ 多环境配置

### 开发环境

```bash
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://dev_user:dev_pass@localhost:3306/ex1_dev
```

### 生产环境

```bash
# .env.production
NODE_ENV=production
PORT=80
DATABASE_URL=mysql://prod_user:prod_pass@prod-db:3306/ex1_prod
```

### 环境文件加载优先级

1. `.env.local` (本地开发，最优先)
2. `.env.development` / `.env.production` (特定环境)
3. `.env` (通用配置)
4. `.env.example` (模板文件)

## 🛡️ 安全最佳实践

### 敏感信息管理

- ✅ **应该做的**：
  - 将所有敏感配置（密码、密钥等）放在 `.env.local` 中
  - 使用强密码和复杂的密钥
  - 定期轮换 API Key 和 JWT Secret
  - 在生产环境中使用环境变量而非文件

- ❌ **不应该做的**：
  - 将 `.env.local` 提交到版本控制
  - 在代码中硬编码敏感信息
  - 使用简单的密码或密钥
  - 在多个环境间共享敏感配置

### 版本控制

确保 `.gitignore` 文件包含以下条目：

```gitignore
# 环境配置文件
.env.local
.env.*.local

# 敏感文件
*.key
*.pem
*.p12
secrets/
```

## 🔍 配置验证

启动应用时，系统会自动验证必需的环境变量：

```bash
# 检查环境变量
npm run dev
```

如果缺少必需的配置项，应用将显示错误信息并退出。

## 📝 配置模板

查看完整的环境变量模板：

```bash
cat .env.example
```

该文件包含了所有可用的配置项及其说明，是配置环境变量的权威参考。
