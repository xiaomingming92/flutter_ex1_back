<!--
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-26 15:30:00
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-26 15:30:00
 * @FilePath: docs/deployment/ci-cd.md
 * @Description: CI/CD持续集成和部署文档
-->

# CI/CD 持续集成/持续部署文档

本文档详细说明了 Flutter Ex1 后端项目的 CI/CD 流程配置和最佳实践。

## 🚀 GitHub Actions 配置

### 工作流程结构

项目使用 GitHub Actions 进行自动化 CI/CD，配置文件位于 `.github/workflows/deploy.yml`：

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build:prod

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: echo "Deploy to production server"
```

## 📦 构建配置

### 构建脚本配置

项目提供多种构建模式：

```json
{
  "scripts": {
    "build": "npm run build:dev",
    "build:dev": "tsc && tsc-alias",
    "build:prod": "tsc -p tsconfig.prod.json && tsc-alias",
    "build:prodObfuscate": "tsc -p tsconfig.prod.json && tsc-alias && node scripts/obfuscate.js"
  }
}
```

### TypeScript 配置

#### 开发配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "checkJs": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importHelpers": true,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"],
      "@config/*": ["./src/config/*"],
      "@controllers/*": ["./src/controllers/*"],
      "@services/*": ["./src/services/*"],
      "@utils/*": ["./src/utils/*"],
      "@middlewares/*": ["./src/middlewares/*"],
      "@routes/*": ["./src/routes/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

#### 生产配置 (`tsconfig.prod.json`)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "removeComments": true,
    "declaration": false,
    "declarationMap": false,
    "sourceMap": false,
    "debug": false
  }
}
```

### 构建优化

#### 代码混淆配置

使用 `javascript-obfuscator` 进行生产代码混淆：

```javascript
// scripts/obfuscate.js
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const obfuscateCode = code => {
  return JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: true,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: true,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersType: 'function',
    stringArrayWrappersTypeThreshold: 0.5,
    stringIndexShift: true,
    unicodeEscapeSequence: true,
  }).getObfuscatedCode();
};

// 混淆 dist 目录下的所有 JS 文件
const distPath = path.join(__dirname, '../dist');
fs.readdirSync(distPath).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(distPath, file);
    const originalCode = fs.readFileSync(filePath, 'utf8');
    const obfuscatedCode = obfuscateCode(originalCode);
    fs.writeFileSync(filePath, obfuscatedCode);
  }
});
```

## 🐳 容器化部署

### Docker 配置

#### Dockerfile

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY package-lock.json* ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build:prodObfuscate

# 生产环境镜像
FROM node:18-alpine AS production

# 创建应用用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 设置工作目录
WORKDIR /app

# 复制生产依赖
COPY --from=builder /app/node_modules ./node_modules

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 复制配置文件
COPY --chown=nodejs:nodejs ecosystem.config.cjs ./
COPY --chown=nodejs:nodejs .env.production ./

# 暴露端口
EXPOSE 3000

# 切换到非 root 用户
USER nodejs

# 启动应用
CMD ["node", "dist/index.js"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env.production
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - '3306:3306'
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
```

## 🚀 PM2 生产部署

### PM2 配置

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'ex1-api',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80,
      },

      // 监控配置
      monitoring: false,

      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // 重启配置
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,

      // 进程管理
      kill_timeout: 5000,
      listen_timeout: 8000,
      shutdown_with_message: true,

      // 集群配置
      instance_var: 'INSTANCE_ID',

      // 自动重启
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],

  // 部署配置
  deploy: {
    production: {
      user: 'deploy',
      host: ['production-server-1', 'production-server-2'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/ex1_back.git',
      path: '/var/www/ex1_back',
      'post-deploy':
        'npm install && npm run build:prodObfuscate && pm2 reload ecosystem.config.cjs --env production',
    },
  },
};
```

### 部署脚本

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 开始部署 Flutter Ex1 后端服务..."

# 检查环境变量
if [ ! -f ".env.production" ]; then
    echo "❌ 错误: 缺少生产环境配置文件 .env.production"
    exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 运行测试
echo "🧪 运行测试..."
npm run lint
npm run quality

# 构建应用
echo "🏗️ 构建应用..."
npm run build:prodObfuscate

# 备份当前版本
echo "💾 备份当前版本..."
if [ -d "dist" ]; then
    cp -r dist dist.backup.$(date +%Y%m%d_%H%M%S)
fi

# 使用 PM2 部署
echo "🚀 使用 PM2 部署..."
pm2 reload ecosystem.config.cjs --env production

# 健康检查
echo "🔍 执行健康检查..."
sleep 10
curl -f http://localhost:3000/health || {
    echo "❌ 健康检查失败，回滚部署"
    pm2 reload ecosystem.config.cjs --env previous
    exit 1
}

echo "✅ 部署成功完成！"
```

## 📊 性能监控

### 监控指标

```typescript
interface PerformanceMetrics {
  // 系统指标
  cpuUsage: number; // CPU 使用率
  memoryUsage: number; // 内存使用率
  diskUsage: number; // 磁盘使用率
  networkIO: NetworkIO; // 网络 IO

  // 应用指标
  responseTime: number; // 响应时间
  throughput: number; // 吞吐量
  errorRate: number; // 错误率
  activeConnections: number; // 活跃连接数

  // 数据库指标
  dbConnections: number; // 数据库连接数
  dbResponseTime: number; // 数据库响应时间
  dbQueryCount: number; // 查询数量
}
```

### 监控配置

```javascript
// 监控中间件
const prometheus = require('prom-client');

// 创建指标
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

// 监控中间件
const monitoringMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);

    httpRequestTotal.labels(req.method, route, res.statusCode).inc();
  });

  next();
};
```

## 🔄 回滚策略

### 自动回滚

```yaml
# 回滚配置
rollback:
  # 健康检查失败回滚
  health_check_failure:
    enabled: true
    threshold: 3
    interval: 30s

  # 性能下降回滚
  performance_degradation:
    enabled: true
    response_time_threshold: 5000 # 5秒
    error_rate_threshold: 0.05 # 5%

  # 回滚脚本
  rollback_script: |
    #!/bin/bash
    echo "🔄 开始回滚..."

    # 停止当前版本
    pm2 stop ecosystem.config.cjs

    # 恢复上一个稳定版本
    if [ -d "dist.backup.latest" ]; then
      rm -rf dist
      cp -r dist.backup.latest dist
      pm2 start ecosystem.config.cjs --env production
      echo "✅ 回滚完成"
    else
      echo "❌ 找不到可回滚的版本"
      exit 1
    fi
```

### 版本管理

```bash
#!/bin/bash
# version-manager.sh

# 创建版本备份
create_backup() {
    local version=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)

    echo "📦 创建版本备份: $version"

    # 备份代码
    git tag -a "v$version" -m "Release version $version"
    git push origin "v$version"

    # 备份构建产物
    if [ -d "dist" ]; then
      cp -r dist "dist.backup.$timestamp"
      cp -r "dist.backup.$timestamp" dist.backup.latest
    fi
}

# 列出所有版本
list_versions() {
    echo "📋 可用版本列表:"
    git tag -l | sort -V
}

# 回滚到指定版本
rollback_to() {
    local version=$1

    echo "🔄 回滚到版本: $version"

    # 检出指定版本
    git checkout "v$version"

    # 构建和部署
    npm ci
    npm run build:prodObfuscate
    pm2 reload ecosystem.config.cjs --env production
}
```

## 📝 部署检查清单

### 部署前检查

- [ ] 代码审查完成
- [ ] 所有测试通过
- [ ] ESLint 检查无错误
- [ ] 环境变量配置正确
- [ ] 数据库迁移脚本准备
- [ ] 备份策略确认
- [ ] 监控告警配置
- [ ] 回滚计划确认

### 部署后验证

- [ ] 应用启动成功
- [ ] 健康检查通过
- [ ] API 接口正常
- [ ] 数据库连接正常
- [ ] 日志记录正常
- [ ] 性能指标正常
- [ ] 监控告警正常

---

> 💡 **提示**: 部署过程中请严格按照检查清单执行，确保生产环境的稳定性和安全性。
