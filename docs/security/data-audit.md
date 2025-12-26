<!--
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-26 15:30:00
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-26 15:30:00
 * @FilePath: docs/security/data-audit.md
 * @Description: 手机号脱敏和敏感信息查看审计文档
-->

# 手机号脱敏和敏感信息查看审计文档

本文档说明了 Flutter Ex1 后端项目中的手机号脱敏策略和审计机制。

## � 需要脱敏的字段

根据实际数据库结构，当前需要脱敏的字段：

### 1. phone 字段（User 表）

- **数据库字段**: `User.phone`
- **类型**: String (可选)
- **脱敏规则**: 中间四位替换为 `****`
- **显示示例**: `138****5678`

### 2. password 字段（User 表）

- **数据库字段**: `User.password`
- **类型**: String (必需)
- **脱敏规则**: 完全脱敏
- **显示示例**: `***HASHED***`

## 🛡️ 手机号脱敏实现

### 脱敏函数

```typescript
// utils/desensitization.ts
export class Desensitizer {
  // 手机号脱敏：138****5678
  static maskPhoneNumber(phone: string | null | undefined): string {
    if (!phone || typeof phone !== 'string') {
      return '****';
    }

    // 移除所有非数字字符
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length < 7) {
      return '****';
    }

    return cleanPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  // 密码脱敏
  static maskPassword(password: string): string {
    return '***HASHED***';
  }

  // 用户数据脱敏（API响应使用）
  static maskUserData(user: any) {
    return {
      ...user,
      phone: this.maskPhoneNumber(user.phone),
      password: this.maskPassword(user.password),
    };
  }
}
```

### API 响应脱敏中间件

```typescript
// middleware/desensitization.ts
import { Desensitizer } from '../utils/desensitization';

export function maskSensitiveData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    // 脱敏处理
    if (data && typeof data === 'object') {
      // 处理用户数据
      if (data.phone || data.password) {
        data = Desensitizer.maskUserData(data);
      }

      // 处理用户列表
      if (Array.isArray(data.data) && data.data.length > 0) {
        data.data = data.data.map(user => Desensitizer.maskUserData(user));
      }
    }

    return originalJson(data);
  };

  next();
}
```

### 路由中使用

```typescript
// routes/users.ts
import express from 'express';
import { Desensitizer } from '../utils/desensitization';
import { maskSensitiveData } from '../middleware/desensitization';

const router = express.Router();

// 获取用户列表（自动脱敏）
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();

  // 手动脱敏
  const maskedUsers = users.map(user => Desensitizer.maskUserData(user));

  res.json({
    success: true,
    data: maskedUsers,
  });
});

// 获取单个用户（自动脱敏）
router.get('/:id', maskSensitiveData, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在',
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

export default router;
```

## � 简单审计日志

### 审计需求

根据当前项目需求，只需要记录：

1. 用户手机号访问日志
2. 敏感操作时间记录
3. 简单的安全事件日志

### 基础审计实现

```typescript
// utils/audit.ts
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  timestamp: Date;
  details?: any;
}

export class SimpleAuditLogger {
  private static logs: AuditLog[] = [];

  static async log(
    userId: string,
    action: string,
    details?: any
  ): Promise<void> {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      ipAddress: details?.ipAddress || 'unknown',
      timestamp: new Date(),
      details,
    };

    this.logs.push(log);

    // 控制日志数量，避免内存溢出
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500);
    }
  }

  // 获取用户访问记录
  static getUserLogs(userId: string): AuditLog[] {
    return this.logs.filter(log => log.userId === userId);
  }

  // 获取最近的操作记录
  static getRecentLogs(limit: number = 50): AuditLog[] {
    return this.logs.slice(-limit);
  }
}
```

### 在 API 中使用

```typescript
// 在用户相关 API 中添加审计日志
import { SimpleAuditLogger } from '../utils/audit';

router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (user) {
    // 记录用户数据访问
    await SimpleAuditLogger.log(
      req.user?.id || 'anonymous',
      'USER_DATA_ACCESS',
      {
        targetUserId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }
    );
  }

  res.json({
    success: true,
    data: Desensitizer.maskUserData(user),
  });
});
```

## � 使用说明

### 1. 在应用启动时注册脱敏中间件

```typescript
// app.ts
import { maskSensitiveData } from './middleware/desensitization';

// 为所有 API 路由启用脱敏
app.use('/api', maskSensitiveData);
```

### 2. 在需要的地方手动调用脱敏

```typescript
import { Desensitizer } from './utils/desensitization';

// 处理用户数据
const maskedUser = Desensitizer.maskUserData(userData);
```

## ✅ 测试验证

### 脱敏测试示例

```typescript
// tests/desensitization.test.ts
import { Desensitizer } from '../src/utils/desensitization';

describe('手机号脱敏测试', () => {
  test('正常手机号脱敏', () => {
    expect(Desensitizer.maskPhoneNumber('13812345678')).toBe('138****5678');
  });

  test('空手机号处理', () => {
    expect(Desensitizer.maskPhoneNumber(null)).toBe('****');
    expect(Desensitizer.maskPhoneNumber('')).toBe('****');
  });

  test('不完整手机号处理', () => {
    expect(Desensitizer.maskPhoneNumber('138123')).toBe('****');
  });
});
```

---

> ✅ **当前状态**: 已实现手机号脱敏功能，支持 API 自动脱敏和手动脱敏两种方式。审计日志功能已简化，专注于实际需求。

> 📝 **后续计划**:
>
> - 账号查找功能需要显示完整手机号（延后实现）
> - 其他敏感字段脱敏根据需要添加
