/*
 * @Author       : Z2-WIN\xmm wujixmm@gmail.com
 * @Date         : 2025-12-11 11:45:31
 * @LastEditors  : Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime : 2025-12-23 09:36:02
 * @FilePath     : \ex1c:\Users\xmm\studioProjects\flutter_ex1_back\scripts\update-schema-safely.cjs
 * @Description  : 包含备份、更新、恢复数据的完整流程
 */

// 按优先级加载环境变量：.env.local 会覆盖 .env
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

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

// 确保备份目录存在
if (!fs.existsSync('./backups')) {
  fs.mkdirSync('./backups');
}

console.log('步骤 1: 备份当前数据...');
execSync('node scripts/auto-backup-data.cjs', { stdio: 'inherit' });

console.log('\n步骤 2: 生成迁移文件...');
// 这里会根据你的 schema.prisma 变化生成迁移文件
// 你可以替换下面的迁移名称
execSync('npx prisma migrate dev --name update_user_token_structure --create-only', { stdio: 'inherit' });

console.log('\n步骤 3: 检查生成的迁移文件...');
// 列出最新创建的迁移目录
const migrationsDir = './prisma/migrations';
const migrationFolders = fs.readdirSync(migrationsDir)
  .filter(file => fs.statSync(`${migrationsDir}/${file}`).isDirectory())
  .sort();

const latestMigration = migrationFolders[migrationFolders.length - 1];
console.log(`最新迁移: ${latestMigration}`);

console.log('\n步骤 4: （可选）编辑迁移文件以确保数据安全...');
console.log(`请检查文件: ${migrationsDir}/${latestMigration}/migration.sql`);

console.log('\n步骤 5: 应用迁移...');
execSync('npx prisma migrate dev', { stdio: 'inherit' });

console.log('\n步骤 6: 重新生成 Prisma Client...');
// 清理旧的 Prisma 客户端缓存
try {
  console.log('清理 Prisma 客户端缓存...');
  const cacheDir = './node_modules/.prisma/client';
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('✓ 已清理缓存');
  }
} catch (error) {
  console.log('⚠ 清理缓存时出错:', error.message);
}

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠ Prisma Client 生成失败，尝试重新安装...');
  try {
    // 重新安装 Prisma 依赖
    execSync('npm install @prisma/client@latest', { stdio: 'inherit' });
    execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (installError) {
    console.error('重新生成 Prisma Client 失败:', installError);
    console.log('建议手动运行: npx prisma generate');
    throw installError;
  }
}

console.log('\n完成! Schema 已更新，数据已保留。');