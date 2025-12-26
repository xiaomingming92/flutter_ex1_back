<!--
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-26 15:30:00
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-26 15:30:00
 * @FilePath: docs/development/eslint-setup.md
 * @Description: ESLint实时提示配置指南
-->

# ESLint 实时提示配置指南

本指南详细介绍如何在 Flutter Ex1 后端项目中配置和使用 ESLint，实现实时代码检查和提示。

## 🚀 快速开始

### 1. 基础配置

项目已预配置 ESLint，无需额外设置。启动开发服务器时自动启用实时检查：

```bash
# 启动开发服务器（包含实时 ESLint 检查）
npm run dev:lint
```

### 2. 独立运行 ESLint

```bash
# 检查代码问题
npm run lint

# 自动修复可修复的问题
npm run lint:fix

# 静默模式（仅显示错误）
npm run lint:info

# 检查并输出详细格式
npm run lint:check
```

## ⚙️ 配置文件说明

### ESLint 配置

项目使用 `eslint.config.js` 配置文件：

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@typescript-eslint/stylistic';

export default tseslint.config(
  // 基础 JavaScript 规则
  js.configs.recommended,

  // TypeScript 规则
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // 自定义规则
  {
    files: ['src/**/*.{ts,js}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // 自定义规则配置
      'no-console': 'warn',
      'no-debugger': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
```

### 规则详解

#### 必需规则 (Error)

```javascript
{
  '@typescript-eslint/no-unused-vars': 'error',        // 禁止未使用的变量
  '@typescript-eslint/no-explicit-any': 'error',       // 禁止使用 any 类型
  'no-debugger': 'error',                              // 禁止 debugger 语句
  'no-var': 'error',                                   // 强制使用 const/let
}
```

#### 警告规则 (Warn)

```javascript
{
  'no-console': 'warn',                                // 警告 console 使用
  '@typescript-eslint/no-explicit-any': 'warn',        // 警告 any 类型
  'prefer-const': 'warn',                              // 建议使用 const
}
```

#### 推荐规则 (Info)

```javascript
{
  '@typescript-eslint/explicit-function-return-type': 'info',    // 建议显式返回类型
  '@typescript-eslint/explicit-module-boundary-types': 'info',  // 建议模块边界类型
}
```

## 🛠️ VS Code 集成

### 插件安装

在 VS Code 中安装以下插件：

- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)

### 插件配置

创建 `.vscode/settings.json`：

```json
{
  "eslint.enable": true,
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "eslint.workingDirectories": ["src"],
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

### 实时代码检查

配置完成后，VS Code 将：

- ✅ 实时显示 ESLint 警告和错误
- ✅ 保存时自动修复可修复的问题
- ✅ 显示错误详情和修复建议

## 📝 最佳实践

### 1. 编写符合规范的代码

#### 变量声明

```typescript
// ✅ 正确：使用 const/let
const API_BASE_URL = 'https://api.example.com';
let userCount = 0;

// ❌ 错误：使用 var
var apiKey = 'secret-key';
```

#### 类型定义

```typescript
// ✅ 正确：明确类型
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
};

// ❌ 错误：使用 any
const userData: any = getUserData();
```

#### 错误处理

```typescript
// ✅ 正确：显式处理错误
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('Failed to fetch user', { error, userId: id });
    throw error;
  }
}

// ❌ 错误：忽略错误处理
async function getData() {
  const data = await fetch('/api/data'); // 可能的错误被忽略
  return data;
}
```

### 2. 常见问题修复

#### 未使用的变量

```typescript
// ✅ 正确：删除或使用变量
const config = getConfig();
// 使用 config 或删除

// 或者明确标记为未使用（如果确实需要）
const _unused = 'test'; // eslint-disable-line @typescript-eslint/no-unused-vars
```

#### 类型问题

```typescript
// ✅ 正确：明确的类型定义
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ 正确：使用联合类型
type Status = 'pending' | 'approved' | 'rejected';
function setStatus(status: Status) {
  // 处理状态
}
```

### 3. 导入规范

```typescript
// ✅ 正确：按类型分组导入
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';

// ✅ 正确：类型导入
import type { UserData } from '../types/user';

// ❌ 错误：混乱的导入顺序
import logger from '../utils/logger';
import { Request } from 'express';
import { UserService } from '../services/userService';
```

## 🔧 自定义配置

### 添加新规则

在 `eslint.config.js` 中添加规则：

```javascript
export default tseslint.config(
  // ... 现有配置

  {
    files: ['src/**/*.{ts,js}'],
    rules: {
      // 添加自定义规则
      'no-console': 'warn',
      'prefer-arrow-callback': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
      ],
    },
  }
);
```

### 禁用特定规则

```typescript
// 文件顶部注释
/* eslint-disable @typescript-eslint/no-explicit-any */

// 行内注释
const data: any = getData(); // eslint-disable-line @typescript-eslint/no-explicit-any

// 代码块注释
/* eslint-disable-next-line no-console */
console.log('Debug info');
```

## 📊 性能优化

### 检查性能

```bash
# 生成 ESLint 性能报告
npx eslint src --format=json --output-file=eslint-report.json

# 分析报告
node -e "console.log(JSON.stringify(require('./eslint-report.json'), null, 2))"
```

### 优化配置

1. **限制检查范围**：

   ```javascript
   {
     files: ['src/**/*.{ts,js}'], // 只检查 src 目录
     ignorePatterns: ['dist/', 'node_modules/']
   }
   ```

2. **缓存配置**：
   ```bash
   # 启用缓存（默认已启用）
   npm run lint -- --cache
   ```

## 🚨 常见错误解决

### 错误: 'xxx' is not defined

```typescript
// ✅ 正确：声明变量
const { name, email } = userData;

// ✅ 正确：全局声明（如果需要）
declare const globalConfig: Config;
```

### 错误: Missing return type

```typescript
// ✅ 正确：添加返回类型
function getUserName(user: User): string {
  return user.name;
}

// ✅ 正确：使用 void
function logUser(user: User): void {
  console.log(user.name);
}
```

### 错误: Interface 'xxx' has no initializer

```typescript
// ✅ 正确：初始化或使用可选属性
interface Config {
  apiKey: string;
  timeout?: number; // 可选属性
}

// ✅ 正确：使用断言
const config = {
  apiKey: process.env.API_KEY!,
} as Config;
```

## 📈 团队协作

### 配置同步

1. **确保所有开发者使用相同的 ESLint 版本**：

   ```bash
   npm list eslint
   ```

2. **共享配置**：将 `eslint.config.js` 加入版本控制

3. **预提交钩子**：确保 Husky 配置正确

### 持续集成

在 CI/CD 中添加 ESLint 检查：

```yaml
# GitHub Actions 示例
- name: Run ESLint
  run: |
    npm run lint
    npm run lint:info
```

---

> 💡 **提示**: 定期更新 ESLint 和相关插件到最新版本，以获得最新的规则和功能。配置问题请联系团队负责人。
