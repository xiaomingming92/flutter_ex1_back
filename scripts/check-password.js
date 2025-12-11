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