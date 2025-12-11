/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-08 17:02:08
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-08 17:02:12
 * @FilePath: \studioProjects\ex1_back\scripts\backup-data.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function backupData() {
  try {
    // 备份 User 表
    const users = await prisma.user.findMany();
    fs.writeFileSync('./backups/users.json', JSON.stringify(users, null, 2));
    
    // 备份 UserToken 表
    const userTokens = await prisma.userToken.findMany();
    fs.writeFileSync('./backups/userTokens.json', JSON.stringify(userTokens, null, 2));
    
    // 备份 Article 表
    const articles = await prisma.article.findMany();
    fs.writeFileSync('./backups/articles.json', JSON.stringify(articles, null, 2));
    
    // 备份 WaterfallItem 表
    const waterfallItems = await prisma.waterfallItem.findMany();
    fs.writeFileSync('./backups/waterfallItems.json', JSON.stringify(waterfallItems, null, 2));
    
    console.log('数据备份完成!');
  } catch (error) {
    console.error('备份过程中出现错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 创建备份目录
if (!fs.existsSync('./backups')) {
  fs.mkdirSync('./backups');
}

backupData();