import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImageTable() {
  try {
    console.log('正在检查数据库连接...');
    
    // 尝试获取Image表的所有记录（不超过5条）
    const images = await prisma.image.findMany({
      take: 5
    });
    
    console.log('✓ Image表存在！');
    console.log(`找到${images.length}条记录`);
    console.log('表结构验证成功');
    
    return true;
  } catch (error) {
    console.error('✗ 检查失败:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

checkImageTable();