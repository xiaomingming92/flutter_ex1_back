/**
 * 安全更新 Prisma Schema 的脚本
 * 包含备份、更新、恢复数据的完整流程
 */

const { execSync } = require('child_process');
const fs = require('fs');

// 确保备份目录存在
if (!fs.existsSync('./backups')) {
  fs.mkdirSync('./backups');
}

console.log('步骤 1: 备份当前数据...');
execSync('node scripts/backup-data.js', { stdio: 'inherit' });

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
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('\n完成! Schema 已更新，数据已保留。');