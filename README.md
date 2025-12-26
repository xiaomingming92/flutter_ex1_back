<!--
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-11 11:42:33
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-26 15:30:00
 * @FilePath: \studioProjects\flutter_ex1_back\README.md
 * @Description: Flutter Ex1 后端服务 - 简洁版项目说明
-->

# flutter_ex1_back

> Flutter Ex1 项目的后端服务，基于 Node.js + Express + TypeScript 构建

[![Node Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)

## 📖 项目概述

本项目是 Flutter Ex1 应用的配套后端服务，提供用户认证、数据管理、文件上传等核心功能。采用现代化的技术栈和最佳实践，确保代码质量和可维护性。

### 🚀 核心特性

- 🔐 **安全认证**: JWT Token + API Key 双重认证机制
- 📦 **数据存储**: Prisma ORM + MySQL 数据库
- ☁️ **云存储**: 腾讯云 COS 对象存储集成
- 🛡️ **安全防护**: 输入验证、数据脱敏、审计日志
- 📝 **代码质量**: ESLint + Prettier + Husky 代码规范
- 🚀 **自动化**: GitHub Actions CI/CD 流程

### 🏗️ 技术架构

```
src/
├── config/          # 配置文件
├── controllers/     # 控制器层
├── middlewares/     # 中间件
├── routes/          # 路由定义
├── services/        # 业务逻辑层
├── utils/           # 工具函数
└── index.ts         # 应用入口
```

## 🏃‍♂️ 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm 或 yarn

### 安装运行

```bash
# 1. 克隆项目
git clone <repository-url>
cd flutter_ex1_back

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，填入你的配置

# 4. 启动开发服务器
npm run dev
```

## 📚 文档导航

### 🚀 快速入门

- [项目启动指南](docs/getting-started/README.md) - 从零开始的完整指南
- [环境配置](docs/configuration/README.md) - 详细的环境变量配置说明

### 🛠️ 开发指南

- [开发工作流程](docs/development/workflow.md) - 团队协作开发规范
- [ESLint 配置](docs/development/eslint-setup.md) - 代码质量工具配置

### 📖 核心功能

- [用户注册流程](docs/core/user-registration.md) - 智能注册防御系统
- [数据安全审计](docs/security/data-audit.md) - 敏感信息保护方案

### 🚀 部署运维

- [CI/CD 流程](docs/deployment/ci-cd.md) - 自动化部署配置
- [构建优化](docs/deployment/build-optimization.md) - 性能优化指南

### 📄 API 文档

- [接口文档](docs/api/README.md) - 完整的 API 接口说明
- [数据库设计](docs/api/database.md) - 数据表结构设计

## 📋 脚本命令

```bash
# 开发相关
npm run dev              # 启动开发服务器
npm run dev:lint         # 开发模式 + 实时 lint

# 代码质量
npm run lint             # 代码检查
npm run lint:fix         # 自动修复代码问题
npm run format           # 代码格式化
npm run quality          # 完整的质量检查

# 数据库
npm run update-schema    # 安全更新数据库结构
npm run backup           # 数据备份
npm run restore          # 数据恢复

# 部署运维
npm run build            # 构建生产版本
npm start                # 启动生产服务
npm run pm2:start        # PM2 进程管理
```

## 🤝 贡献指南

1. **开发流程**: 遵循 [完整开发工作流程文档](docs/完整开发工作流程文档.md)
2. **代码规范**: 使用 ESLint + Prettier 确保代码质量
3. **提交规范**: 使用 Conventional Commits 标准
4. **安全考虑**: 遵循 [信息脱敏和敏感信息查看审计文档.md](docs/信息脱敏和敏感信息查看审计文档.md)

## 📄 许可证

本项目采用 [ISC](LICENSE) 许可证。

## 👨‍💻 作者

**xmm** - _Initial work_ - [Z2-WIN](mailto:wujixmm@gmail.com)

---

> 💡 **提示**: 详细的开发文档请参考 `docs/` 目录下的专门文档
