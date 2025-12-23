# ESLint 实时提示配置指南

## 🎯 ESLint 实时提示的优势

ESLint 可以在你编写代码的过程中实时提供以下反馈：

- ✅ **语法错误检查** - 立即发现语法问题
- 📝 **代码规范提示** - 实时显示代码风格问题
- 🔧 **自动修复建议** - 提供一键修复选项
- 🎨 **代码格式化** - 保存时自动格式化
- 📊 **类型检查** - TypeScript 类型相关提示

## 📁 配置文件说明

### 1. VS Code 集成配置

- **`.vscode/settings.json`** - 编辑器设置，启用 ESLint 实时检查
- **`.vscode/extensions.json`** - 推荐扩展列表

### 2. ESLint 配置

- **`eslint.config.js`** - ESLint 规则配置

## 🚀 使用方法

### 方法一：VS Code 实时提示（推荐）

1. **安装推荐扩展**

   ```bash
   # 在 VS Code 中按 Ctrl+Shift+P，输入 "Extensions: Show Recommended Extensions"
   # 或者打开 .vscode/extensions.json 查看推荐列表
   ```

2. **启用实时检查**
   - 打开任意 `.ts` 或 `.js` 文件
   - ESLint 会自动在编辑器中显示：
     - 🔴 红色波浪线：错误
     - 🟡 黄色波浪线：警告
     - 💡 灯泡图标：修复建议

3. **自动修复**
   - 按 `Ctrl+.` 打开快速修复菜单
   - 选择 "Fix this ESLint problem"
   - 或使用命令面板：`Ctrl+Shift+P` → "ESLint: Fix all auto-fixable problems"

4. **保存时自动修复**
   - 已在 `.vscode/settings.json` 中配置
   - 保存文件时会自动应用 ESLint 修复

### 方法二：命令行实时监控

```bash
# 启动开发服务器 + ESLint 实时监控
npm run dev:lint

# 仅启动 ESLint 实时监控
npm run lint:watch
```

### 方法三：检查和修复命令

```bash
# 检查代码规范（不自动修复）
npm run lint

# 自动修复可修复的问题
npm run lint:fix

# 同时检查格式和代码规范
npm run quality

# 自动修复格式和代码规范问题
npm run quality:fix
```

## 🔧 配置说明

### 当前启用的规则

- `@typescript-eslint/no-unused-vars`: 'warn' - 未使用变量警告
- `@typescript-eslint/no-explicit-any`: 'warn' - any 类型警告
- `prefer-const`: 'error' - 优先使用 const
- `no-var`: 'error' - 禁止使用 var
- `no-undef`: 'off' - 关闭未定义变量检查（避免与 TypeScript 冲突）

### 监控的文件

- `src/**/*.ts` - TypeScript 文件
- `src/**/*.js` - JavaScript 文件

### 忽略的文件

- `dist/` - 构建输出目录
- `node_modules/` - 依赖包目录
- `*.js` - 根目录的 JS 文件

## 🎨 编辑器集成功能

### 实时提示示例

```typescript
// ❌ 未使用变量（黄色波浪线）
const unusedVar = 'hello';

// ❌ any 类型（黄色波浪线）
function test(param: any) {
  return param.value;
}

// ❌ 应该使用 const（红色波浪线）
let constant = 'should be const';

// ✅ 正确用法
const message = 'hello world';
function processData(data: string): string {
  return data.toUpperCase();
}
```

### 快速操作

1. **悬停提示** - 将鼠标悬停在错误上查看详细说明
2. **问题面板** - `Ctrl+Shift+M` 查看所有问题列表
3. **命令面板** - `Ctrl+Shift+P` → "ESLint:" 相关命令

## 🔄 开发工作流

### 推荐开发流程

1. **编写代码** - ESLint 实时提示问题
2. **保存文件** - 自动修复和格式化
3. **提交前检查** - `npm run quality` 确保代码质量
4. **Git 提交** - Husky 自动运行检查

### 团队协作

- 统一的代码规范配置
- 提交前自动检查
- IDE 集成确保一致性

## 📱 常见问题

### Q: 为什么看不到实时提示？

A: 检查是否安装了 ESLint 扩展，并确认文件类型被识别

### Q: 如何自定义规则？

A: 编辑 `eslint.config.js` 文件中的 `rules` 部分

### Q: 某些规则太严格怎么办？

A: 可以在规则后面添加 `'off'` 关闭，或调整严重级别

### Q: 如何忽略特定文件？

A: 在 `eslint.config.js` 的 `ignores` 数组中添加文件路径

## 🎯 最佳实践

1. **启用实时检查** - 立即发现和修复问题
2. **保存时自动修复** - 减少手动操作
3. **提交前全面检查** - 确保代码质量
4. **团队统一配置** - 保持代码风格一致
5. **定期更新规则** - 跟随最佳实践演进

---

**提示**: 使用 `npm run lint:info` 可以查看当前 ESLint 配置的详细信息。
