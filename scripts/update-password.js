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
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updateUserPassword() {
  try {
    // 查找手机号为19821030365的用户
    const user = await prisma.user.findUnique({
      where: {
        phone: '19821030365'
      }
    });
    
    if (!user) {
      console.error('未找到该用户');
      return;
    }
    
    // 生成bcrypt哈希值
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // 更新用户密码
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: hashedPassword
      }
    });
    
    console.log('用户密码已成功更新！');
    console.log(`新密码哈希: ${updatedUser.password}`);
    console.log(`密码是否以$2b$开头(bcrypt格式): ${updatedUser.password.startsWith('$2b$')}`);
    
  } catch (error) {
    console.error('更新用户密码时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPassword();