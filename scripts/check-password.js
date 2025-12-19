// 按优先级加载环境变量：.env.local 会覆盖 .env
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 按优先级加载环境变量：.env.local 会覆盖 .env

// 读取并解析.env文件
const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = dotenv.parse(envContent);
  Object.assign(process.env, envVars);
}

// 读取并解析.env.local文件（覆盖.env中的同名变量）
const envLocalPath = resolve(__dirname, '../.env.local');
if (existsSync(envLocalPath)) {
  const envLocalContent = readFileSync(envLocalPath, 'utf8');
  const envLocalVars = dotenv.parse(envLocalContent);
  Object.assign(process.env, envLocalVars);
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserPasswords() {
  try {
    // 获取所有用户
    const users = await prisma.user.findMany();
    
    console.log('用户记录:');
    users.forEach(user => {
      console.log(`\n用户ID: ${user.id}`);
      console.log(`手机号: ${user.phone}`);
      console.log(`用户名: ${user.name}`);
      console.log(`密码哈希: ${user.password}`);
      console.log(`密码长度: ${user.password.length}`);
      console.log(`密码是否以$2b$开头(bcrypt格式): ${user.password.startsWith('$2b$')}`);
    });
    
  } catch (error) {
    console.error('查询用户记录时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPasswords();