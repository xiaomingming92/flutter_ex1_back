/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-19 18:15:30
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-19 18:15:30
 * @FilePath: \studioProjects\flutter_ex1_back\scripts\\universal-backup-data.cjs
 * @Description: 使用原生SQL查询自动备份所有表数据
 */

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

async function getAllTableNames() {
  try {
    // 查询数据库中的所有表名（排除系统表）
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '%_migration%'
        AND table_name NOT LIKE '%prisma_%'
      ORDER BY table_name;
    `;
    
    return result.map(row => row.table_name);
  } catch (error) {
    console.error('获取表名时出错:', error);
    throw error;
  }
}

async function getTableData(tableName) {
  try {
    // 使用原生 SQL 查询表的所有数据
    const query = `SELECT * FROM \`${tableName}\``;
    const result = await prisma.$queryRawUnsafe(query);
    return result;
  } catch (error) {
    console.error(`查询表 ${tableName} 时出错:`, error);
    return [];
  }
}

async function universalBackupData() {
  try {
    console.log('🔍 正在自动发现数据库表...');
    const tableNames = await getAllTableNames();
    console.log(`📊 发现 ${tableNames.length} 个数据表:`, tableNames);
    
    const backupResults = [];
    
    // 备份每个表的数据
    for (const tableName of tableNames) {
      try {
        console.log(`💾 正在备份表: ${tableName}...`);
        const data = await getTableData(tableName);
        
        if (data.length > 0) {
          const fileName = `${tableName}.json`;
          fs.writeFileSync(`./backups/${fileName}`, JSON.stringify(data, null, 2));
          console.log(`✅ 已完成备份 ${tableName} 表 (${data.length} 条记录)`);
          
          backupResults.push({
            tableName,
            recordCount: data.length,
            fileName,
            status: 'success'
          });
        } else {
          console.log(`⚠️  表 ${tableName} 为空，跳过备份`);
          backupResults.push({
            tableName,
            recordCount: 0,
            fileName: null,
            status: 'empty'
          });
        }
      } catch (error) {
        console.error(`❌ 备份表 ${tableName} 时出错:`, error);
        backupResults.push({
          tableName,
          recordCount: 0,
          fileName: null,
          status: 'error',
          error: error.message
        });
      }
    }

    // 生成详细的备份报告
    const backupReport = {
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL?.split('/').pop() || 'unknown',
      totalTables: tableNames.length,
      successfulBackups: backupResults.filter(r => r.status === 'success').length,
      emptyTables: backupResults.filter(r => r.status === 'empty').length,
      failedBackups: backupResults.filter(r => r.status === 'error').length,
      totalRecords: backupResults.reduce((sum, r) => sum + r.recordCount, 0),
      backupResults,
      backupDirectory: './backups'
    };

    // 保存备份报告
    fs.writeFileSync('./backups/backup-report.json', JSON.stringify(backupReport, null, 2));
    
    console.log('\n🎉 自动数据备份完成!');
    console.log(`📈 统计信息:`);
    console.log(`   - 总表数: ${backupReport.totalTables}`);
    console.log(`   - 成功备份: ${backupReport.successfulBackups}`);
    console.log(`   - 空表: ${backupReport.emptyTables}`);
    console.log(`   - 备份失败: ${backupReport.failedBackups}`);
    console.log(`   - 总记录数: ${backupReport.totalRecords}`);
    console.log(`📁 备份文件位置: ./backups/`);
    console.log(`📄 详细报告: ./backups/backup-report.json`);
    
  } catch (error) {
    console.error('💥 自动备份过程中出现严重错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 创建备份目录
if (!fs.existsSync('./backups')) {
  fs.mkdirSync('./backups');
}

universalBackupData();