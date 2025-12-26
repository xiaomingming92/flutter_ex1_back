<!--
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-26 15:30:00
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-26 15:30:00
 * @FilePath: docs/development/workflow.md
 * @Description: 团队协作开发工作流程
-->

# 开发工作流程指南

本指南定义了 Flutter Ex1 后端项目的标准开发流程，确保团队协作的一致性和代码质量。

## 🏗️ 项目开发标准

### 代码规范

#### TypeScript 编码规范

```typescript
// ✅ 正确的函数定义
interface UserData {
  id: string;
  name: string;
  email: string;
}

class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(data: UserData): Promise<User> {
    // 业务逻辑
    return await this.userRepository.create(data);
  }
}
```

#### 错误处理规范

```typescript
// ✅ 统一错误处理
try {
  const result = await this.userService.createUser(userData);
  res.json({ success: true, data: result });
} catch (error) {
  logger.error('User creation failed', { error, userData });
  next(new ErrorHandler('USER_CREATION_FAILED', error.message));
}
```

### 提交规范

#### 提交信息格式

使用 [Conventional Commits](https://www.conventionalcommits.org/) 标准：

```bash
# 功能新增
feat: 新增用户注册接口

# 问题修复
fix: 修复 JWT 验证过期问题

# 文档更新
docs: 更新 API 文档说明

# 代码重构
refactor: 重构用户服务模块

# 性能优化
perf: 优化数据库查询性能

# 测试相关
test: 添加用户注册单元测试
```

#### 提交钩子配置

项目已配置 Husky 钩子，自动进行：

- 提交信息格式检查
- 代码质量检查
- 测试执行
- 格式化处理

## 🔄 开发工作流

### 1. 功能开发流程

#### A. 分支管理

```bash
# 从主分支创建功能分支
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# 开发完成后
git checkout main
git merge feature/user-authentication
git branch -d feature/user-authentication
```

#### B. 开发步骤

1. **需求分析**: 理解功能需求和技术方案
2. **设计阶段**: 设计接口、数据模型、数据库结构
3. **编码实现**: 遵循编码规范，实现功能
4. **测试验证**: 编写和运行测试
5. **代码审查**: 提交 Pull Request 进行审查
6. **合并部署**: 合并到主分支并部署

### 2. 数据库变更流程

#### A. 结构更新

```bash
# 使用安全的数据库更新脚本
npm run update-schema

# 手动执行 SQL（如需要）
mysql -u username -p database_name < queries/Query.sql
```

#### B. 数据备份

```bash
# 自动备份
npm run auto-backup

# 手动备份
npm run manual-backup

# 通用备份
npm run universal-backup
```

### 3. 代码质量控制

#### A. 开发时检查

```bash
# 实时代码检查（推荐）
npm run dev:lint

# 或手动检查
npm run lint
npm run format
npm run quality
```

#### B. 预提交检查

项目配置了 Husky 钩子，在提交前自动执行：

- ESLint 代码检查
- Prettier 代码格式化
- TypeScript 类型检查

#### C. 修复代码问题

```bash
# 自动修复可修复的问题
npm run lint:fix

# 手动检查并修复剩余问题
npm run lint
```

## 🛡️ 安全开发规范

### 敏感信息处理

1. **环境变量**: 所有敏感信息通过环境变量管理
2. **数据脱敏**: 遵循 [数据脱敏和敏感信息查看审计文档.md](../security/data-audit.md)
3. **日志记录**: 不记录敏感信息到日志
4. **数据库**: 使用参数化查询，防止 SQL 注入

### 输入验证

```typescript
// ✅ 严格的输入验证
import Joi from 'joi';

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(1).max(100).required(),
});
```

## 📁 项目结构规范

### 目录结构

```
src/
├── config/          # 配置相关
│   ├── database.ts  # 数据库配置
│   └── env.ts       # 环境变量配置
├── controllers/     # 控制器层
│   ├── authController.ts
│   └── userController.ts
├── middlewares/     # 中间件
│   ├── auth.ts      # 认证中间件
│   └── errorHandler.ts
├── routes/          # 路由定义
│   ├── auth.ts
│   └── user.ts
├── services/        # 业务逻辑层
│   ├── authService.ts
│   └── userService.ts
├── utils/           # 工具函数
│   ├── jwt.ts
│   └── logger.ts
└── index.ts         # 应用入口
```

### 文件命名规范

- **控制器**: `{功能}Controller.ts`
- **服务**: `{功能}Service.ts`
- **中间件**: `{功能}.ts`
- **路由**: `{功能}.ts`
- **工具**: `{功能}.ts`

## 🔧 开发工具配置

### VS Code 设置

项目包含推荐设置，启用以下功能：

- TypeScript 智能提示
- ESLint 实时检查
- Prettier 自动格式化
- 调试配置

### 调试配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug App",
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeExecutable": "tsx"
    }
  ]
}
```

## 📊 性能优化规范

### 代码优化

1. **异步处理**: 使用 async/await，避免回调地狱
2. **数据库优化**: 使用连接池，索引优化
3. **缓存策略**: 合理使用缓存减少数据库查询
4. **资源管理**: 及时释放数据库连接和文件句柄

### 构建优化

```bash
# 开发构建
npm run build:dev

# 生产构建
npm run build:prod

# 生产混淆构建
npm run build:prodObfuscate
```

## 🚀 部署流程

### 开发到生产

1. **开发测试**: 本地环境验证
2. **预发布测试**: 测试环境部署和验证
3. **生产部署**: 生产环境部署
4. **监控验证**: 生产环境监控和验证

### CI/CD 流程

项目配置了 GitHub Actions：

- 自动构建
- 自动测试
- 自动部署
- 自动回滚（如需要）

## 📚 学习资源

### 内部文档

- [完整开发工作流程文档.md](../完整开发工作流程文档.md) - 详细的团队协作指南
- [ESLint 配置指南](eslint-setup.md) - 代码质量工具配置
- [注册流程文档](../core/user-registration.md) - 核心功能开发参考

### 外部资源

- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Express.js 指南](https://expressjs.com/)
- [Prisma ORM 文档](https://www.prisma.io/docs/)

---

> 💡 **提示**: 遵循本指南可以确保代码质量和团队协作效率。如有疑问，请参考详细文档或咨询团队负责人。
