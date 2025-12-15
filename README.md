<!--
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-11 11:42:33
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-15 15:05:35
 * @FilePath: \studioProjects\flutter_ex1_back\README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# flutter_ex1_back
flutter_ex1配套后端服务

## 环境配置

### 环境文件说明

本项目使用dotenv管理环境变量，提供以下环境文件：

- `.env.example`: 环境变量模板文件，包含所有需要的环境变量名称和默认值
- `.env`: 开发环境默认配置文件，包含公开的配置信息
- `.env.local`: 本地开发环境配置文件，包含敏感配置信息（不提交到版本控制）

### 配置步骤

1. 复制环境变量模板文件：
   ```bash
   cp .env.example .env.local
   ```

2. 编辑`.env.local`文件，配置敏感信息：
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

3. 确保`.env.local`文件在`.gitignore`中被忽略，不提交到版本控制

### 最佳实践

- 将所有环境变量的名称和默认值放在`.env.example`中，便于其他开发者了解需要哪些配置
- 将公开的、非敏感的配置放在`.env`中，用于开发环境默认配置
- 将敏感的配置（如数据库密码、API密钥等）放在`.env.local`中，不提交到版本控制
- 不同环境可以使用不同的环境文件（如`.env.development`、`.env.production`等）

## 启动项目

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 构建生产版本：
   ```bash
   npm run build
   npm start
   ```
