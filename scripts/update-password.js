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