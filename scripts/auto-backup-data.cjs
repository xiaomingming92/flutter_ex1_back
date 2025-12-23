// 自动发现数据库表并备份的脚本
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
    // 查询数据库中的所有表名
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log('原始查询结果:', result);
    
    // 提取表名 - 兼容不同的返回格式
    const tableNames = [];
    for (const row of result) {
      // 尝试不同的字段名
      const tableName = row.table_name || row.TABLE_NAME || row.TableName;
      if (tableName) {
        tableNames.push(tableName);
      }
    }
    
    return tableNames;
  } catch (error) {
    console.error('获取表名时出错:', error);
    throw error;
  }
}

// 表名到模型名的映射
const tableToModelMap = {
  'users': 'user',
  'articles': 'article',
  'images': 'image',
  'waterfall_items': 'waterfallItem',
  'article_media': 'articleMedia',
  'user_tokens': 'userToken'
};

async function autoBackupData() {
  try {
    console.log('正在自动发现数据库表...');
    const tableNames = await getAllTableNames();
    console.log(`发现 ${tableNames.length} 个表:`, tableNames);
    
    const validTables = [];
    
    // 过滤出有对应 Prisma 模型的表
    for (const tableName of tableNames) {
      if (!tableName) continue;
      
      // 跳过系统表
      if (tableName.startsWith('_prisma') || tableName.startsWith('prisma_')) {
        console.log(`⚠ 跳过系统表: ${tableName}`);
        continue;
      }
      
      // 检查是否有对应的 Prisma 模型
      const modelName = tableToModelMap[tableName];
      if (modelName && prisma[modelName] && typeof prisma[modelName].findMany === 'function') {
        validTables.push({ tableName, modelName });
      } else {
        console.log(`⚠ 未找到对应的 Prisma 模型: ${tableName}`);
      }
    }
    
    console.log(`\n找到 ${validTables.length} 个有效表进行备份:`);
    validTables.forEach(({ tableName, modelName }) => {
      console.log(`  - ${tableName} -> ${modelName}`);
    });
    
    // 备份每个表的数据
    for (const { tableName, modelName } of validTables) {
      try {
        console.log(`\n💾 正在备份表: ${tableName}...`);
        const data = await prisma[modelName].findMany();
        const fileName = `${tableName}.json`;
        fs.writeFileSync(`./backups/${fileName}`, JSON.stringify(data, null, 2));
        console.log(`✅ 已完成备份 ${tableName} 表 (${data.length} 条记录)`);
      } catch (error) {
        console.error(`❌ 备份表 ${tableName} 时出错:`, error);
      }
    }

    console.log('\n🎉 自动数据备份完成!');
    
    // 生成备份清单
    const backupList = {
      timestamp: new Date().toISOString(),
      tables: validTables.map(item => item.tableName),
      backupDirectory: './backups'
    };
    fs.writeFileSync('./backups/backup-manifest.json', JSON.stringify(backupList, null, 2));
    
  } catch (error) {
    console.error('自动备份过程中出现错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 创建备份目录
if (!fs.existsSync('./backups')) {
  fs.mkdirSync('./backups');
}

autoBackupData();


