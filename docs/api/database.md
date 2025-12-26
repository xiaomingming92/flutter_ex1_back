<!--
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-26 15:30:00
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-26 15:30:00
 * @FilePath: docs/api/database.md
 * @Description: 数据库设计文档
-->

# 数据库设计文档

本文档说明了 Flutter Ex1 后端项目的数据库设计和表结构。

## 🗄️ 数据库概览

### 技术栈

- **数据库**: MySQL 8.0+
- **ORM**: Prisma (最新版本)
- **字符集**: UTF8MB4 (支持 emoji 和特殊字符)

### 命名规范

- **表名**: 使用下划线命名法，复数形式 (`users`, `articles`)
- **字段名**: 使用下划线命名法 (`created_at`, `updated_at`)
- **主键**: UUID 格式 (`String @id @default(uuid())`)
- **外键**: 自动命名 (`authorId`, `userId`)

## 📊 实际数据表结构

### 用户表 (users)

```prisma
model User {
  id        String    @id @default(uuid())
  username  String
  accountId String
  phone     String?   @unique
  password  String
  name      String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  articles  Article[]
  avatar    String?
  bio       String    // 必需字段

  // 多对多关系：用户-角色
  roles     Role[]

  @@map("users")
}
```

**字段说明:**

- `id`: UUID 主键
- `username`: 用户名 (必需)
- `accountId`: 账户ID (必需)
- `phone`: 手机号 (可选，唯一)
- `password`: 密码 (必需)
- `name`: 真实姓名 (可选)
- `bio`: 个人简介 (必需)
- `avatar`: 头像URL (可选)
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 角色表 (roles)

```prisma
model Role {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // 多对多关系：角色-用户
  users       User[]

  // 多对多关系：角色-权限
  permissions Permission[]

  @@map("roles")
}
```

**字段说明:**

- `id`: UUID 主键
- `name`: 角色名称 (唯一)
- `description`: 角色描述 (可选)
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 权限表 (permissions)

```prisma
model Permission {
  id            String    @id @default(uuid())
  name          String    @unique      // 权限名称：如"创建文章"
  description   String?                // 权限描述
  category      String                 // 权限分类：如"article"
  action        String                 // 权限动作：如"create"
  code          String    @unique      // 完整权限代码：如"article.create"
  isActive      Boolean   @default(true) // 是否启用
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 多对多关系：权限-角色
  roles         Role[]

  @@map("permissions")
}
```

**字段说明:**

- `id`: UUID 主键
- `name`: 权限名称 (唯一)
- `description`: 权限描述 (可选)
- `category`: 权限分类 (如"article", "user")
- `action`: 权限动作 (如"create", "read", "update", "delete")
- `code`: 完整权限代码 (唯一，如"article.create")
- `isActive`: 是否启用
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 文章表 (articles)

```prisma
model Article {
  id            String         @id @default(uuid())
  title         String
  content       String         @db.Text
  authorId      String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  author        User           @relation(fields: [authorId], references: [id], onDelete: Restrict)
  waterfallItem WaterfallItem?
  media         ArticleMedia[]

  @@index([authorId], map: "articles_authorId_fkey")
  @@map("articles")
}
```

**字段说明:**

- `id`: UUID 主键
- `title`: 文章标题 (必需)
- `content`: 文章内容 (必需，Text 类型)
- `authorId`: 作者ID (必需，外键)
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 图片表 (images)

```prisma
model Image {
  id             String          @id @default(uuid())
  url            String
  width          Int?
  height         Int?
  filename       String?
  mimeType       String?
  size           Int?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  waterfallItems WaterfallItem[]
  articleMedia   ArticleMedia[]

  @@map("images")
}
```

**字段说明:**

- `id`: UUID 主键
- `url`: 图片URL (必需)
- `width`: 图片宽度 (可选)
- `height`: 图片高度 (可选)
- `filename`: 文件名 (可选)
- `mimeType`: MIME类型 (可选)
- `size`: 文件大小 (可选)
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 瀑布流项目表 (waterfall_items)

```prisma
model WaterfallItem {
  id          String   @id @default(uuid())
  description String?  @db.Text
  articleId   String   @unique
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  imageId     String?
  article     Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  image       Image?   @relation(fields: [imageId], references: [id])

  @@index([sortOrder, createdAt])
  @@index([imageId], map: "waterfall_items_imageId_fkey")
  @@map("waterfall_items")
}
```

**字段说明:**

- `id`: UUID 主键
- `description`: 描述 (可选，Text 类型)
- `articleId`: 文章ID (必需，唯一)
- `sortOrder`: 排序 (默认0)
- `imageId`: 图片ID (可选)
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 文章媒体表 (article_media)

```prisma
model ArticleMedia {
  id        String   @id @default(uuid())
  articleId String
  imageId   String
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  image     Image    @relation(fields: [imageId], references: [id], onDelete: Cascade)

  @@index([articleId])
  @@index([imageId])
  @@map("article_media")
}
```

**字段说明:**

- `id`: UUID 主键
- `articleId`: 文章ID (必需)
- `imageId`: 图片ID (必需)
- `sortOrder`: 排序 (默认0)
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### 用户令牌表 (user_tokens)

```prisma
model UserToken {
  id               String    @id @default(uuid())
  userId           String
  accessToken      String    @db.VarChar(255)
  refreshToken     String    @unique @db.VarChar(255)
  accessExpiresAt  DateTime
  refreshExpiresAt DateTime
  createdAt        DateTime  @default(now())
  revokedAt        DateTime?

  @@index([userId])
  @@index([accessToken])
  @@map("user_tokens")
}
```

**字段说明:**

- `id`: UUID 主键
- `userId`: 用户ID (必需)
- `accessToken`: 访问令牌 (必需)
- `refreshToken`: 刷新令牌 (必需，唯一)
- `accessExpiresAt`: 访问令牌过期时间
- `refreshExpiresAt`: 刷新令牌过期时间
- `createdAt`: 创建时间
- `revokedAt`: 撤销时间 (可选)

## 📋 数据关系总结

### 主要关系

1. **用户-文章** (一对多)
   - 一个用户可以创建多篇文章
   - 一篇文章只能属于一个作者

2. **文章-瀑布流项目** (一对一)
   - 一篇文章只能有一个瀑布流项目
   - 一个瀑布流项目只能关联一篇文章

3. **文章-媒体** (一对多)
   - 一篇文章可以有多个媒体文件
   - 一个媒体文件只能属于一篇文章

4. **图片-瀑布流项目** (一对多)
   - 一张图片可以被多个瀑布流项目使用
   - 一个瀑布流项目只能关联一张图片

5. **图片-文章媒体** (一对多)
   - 一张图片可以被多个文章媒体关联
   - 一个文章媒体只能关联一张图片

6. **用户-角色** (多对多)
   - 一个用户可以拥有多个角色
   - 一个角色可以分配给多个用户

7. **角色-权限** (多对多)
   - 一个角色可以拥有多个权限
   - 一个权限可以分配给多个角色

### 脱敏处理

根据安全需求，以下字段需要脱敏：

1. **User.phone**: 手机号中间四位脱敏 `138****5678`
2. **User.password**: 密码完全脱敏 `***HASHED***`

### 索引使用情况

```prisma
// 用户表索引
@@index([authorId], map: "articles_authorId_fkey")  // 文章作者查询

// 瀑布流项目索引
@@index([sortOrder, createdAt])                     // 排序查询
@@index([imageId], map: "waterfall_items_imageId_fkey") // 图片关联查询

// 文章媒体索引
@@index([articleId])                                // 文章媒体查询
@@index([imageId])                                  // 图片媒体查询

// 用户令牌索引
@@index([userId])                                   // 用户令牌查询
@@index([accessToken])                              // 访问令牌查询
```

## 🔧 数据库操作

### 常用查询示例

```typescript
// 查询用户及其文章
const userWithArticles = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    articles: true,
    roles: {
      include: {
        permissions: true,
      },
    },
  },
});

// 查询文章及其瀑布流项目
const articleWithWaterfall = await prisma.article.findUnique({
  where: { id: articleId },
  include: {
    waterfallItem: {
      include: {
        image: true,
      },
    },
    media: {
      include: {
        image: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    },
  },
});

// 分页查询文章
const articles = await prisma.article.findMany({
  take: 20,
  skip: page * 20,
  orderBy: {
    createdAt: 'desc',
  },
  include: {
    author: {
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    },
  },
});
```

### 数据迁移

```sql
-- 创建表结构（基于 Prisma schema）
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar VARCHAR(255),
  bio TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 其他表的创建语句...
```

---

> ✅ **当前状态**: 数据库设计文档已更新，反映实际 Prisma schema 结构。包含完整的表结构说明、关系映射和脱敏要求。

> 📝 **后续维护**: 根据实际开发需求，可能需要添加新的表或调整现有表结构。
