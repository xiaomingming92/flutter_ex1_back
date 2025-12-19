// 按优先级加载环境变量：.env.local 会覆盖 .env
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// 读取并解析.env文件
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = dotenv.parse(envContent);
  Object.assign(process.env, envVars);
}

// 读取并解析.env.local文件（覆盖.env中的同名变量）
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  const envLocalVars = dotenv.parse(envLocalContent);
  Object.assign(process.env, envLocalVars);
}

const prisma = new PrismaClient();

async function restoreData() {
  try {
    // 读取备份数据
    const users = JSON.parse(fs.readFileSync('./backups/users.json', 'utf8'));
    const userTokens = JSON.parse(fs.readFileSync('./backups/userTokens.json', 'utf8'));
    const articles = JSON.parse(fs.readFileSync('./backups/articles.json', 'utf8'));
    const images = JSON.parse(fs.readFileSync('./backups/images.json', 'utf8'));
    const waterfallItems = JSON.parse(fs.readFileSync('./backups/waterfallItems.json', 'utf8'));
    
    // 清空现有数据（按依赖顺序）
    await prisma.waterfallItem.deleteMany();
    await prisma.image.deleteMany();
    await prisma.userToken.deleteMany();
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();
    
    // 恢复 User 表数据
    for (const user of users) {
      await prisma.user.create({
        data: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          password: user.password,
          name: user.name,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        }
      });
    }
    
    // 恢复 Article 表数据
    for (const article of articles) {
      await prisma.article.create({
        data: {
          id: article.id,
          title: article.title,
          content: article.content,
          authorId: article.authorId,
          createdAt: new Date(article.createdAt),
          updatedAt: new Date(article.updatedAt),
        }
      });
    }
    
    // 恢复 Image 表数据
    for (const image of images) {
      await prisma.image.create({
        data: {
          id: image.id,
          url: image.url,
          width: image.width,
          height: image.height,
          filename: image.filename,
          mimeType: image.mimeType,
          size: image.size,
          createdAt: new Date(image.createdAt),
          updatedAt: new Date(image.updatedAt),
        }
      });
    }

    // 恢复 WaterfallItem 表数据
    for (const item of waterfallItems) {
      await prisma.waterfallItem.create({
        data: {
          id: item.id,
          imageId: item.imageId,
          description: item.description,
          articleId: item.articleId,
          sortOrder: item.sortOrder,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }
      });
    }
    
    // 恢复 UserToken 表数据
    for (const token of userTokens) {
      await prisma.userToken.create({
        data: {
          id: token.id,
          userId: token.userId,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          accessExpiresAt: new Date(token.accessExpiresAt),
          refreshExpiresAt: new Date(token.refreshExpiresAt),
          createdAt: new Date(token.createdAt),
          revokedAt: token.revokedAt ? new Date(token.revokedAt) : null,
        }
      });
    }
    
    console.log('数据恢复完成!');
  } catch (error) {
    console.error('恢复过程中出现错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();