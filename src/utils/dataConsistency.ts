/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-20 11:00:00
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-20 11:00:00
 * @FilePath: \studioProjects\flutter_ex1_back\src\utils\dataConsistency.ts
 * @Description: 数据一致性检查工具
 */
import { prisma } from '../config/database.js';
import { cos } from '../services/ossService.js';
import { config } from '../config/env.js';

/**
 * 检查图片数据一致性
 * 1. 检查数据库中的图片记录是否存在于OSS中
 * 2. 检查OSS中的图片是否存在于数据库中
 * @returns 一致性检查结果
 */
export async function checkImageConsistency(): Promise<{
  missingInOSS: string[];
  missingInDatabase: string[];
  totalChecked: number;
}> {
  const missingInOSS: string[] = [];
  const missingInDatabase: string[] = [];
  let totalChecked = 0;

  try {
    // 获取数据库中所有图片记录
    const dbImages = await prisma.image.findMany({
      select: {
        id: true,
        url: true,
      },
    });

    // 获取OSS中所有图片文件
    // 注意：这里简化处理，实际情况可能需要分页获取
    const ossFiles: string[] = [];
    let nextMarker: string | undefined;

    do {
      const result = await cos.getBucket({
        Bucket: config.tencentOSS.bucket,
        Region: config.tencentOSS.region,
        Prefix: 'uploads/',
        Marker: nextMarker,
      });

      if (result.Contents) {
        result.Contents.forEach((content) => {
          if (content.Key) {
            ossFiles.push(content.Key);
          }
        });
      }

      nextMarker = result.NextMarker;
    } while (nextMarker);

    // 1. 检查数据库中的图片是否存在于OSS中
    for (const image of dbImages) {
      totalChecked++;
      // 从URL中提取fileKey
      const fileKey = extractFileKeyFromUrl(image.url);
      if (!fileKey) {
        missingInOSS.push(image.id);
        continue;
      }

      // 检查OSS中是否存在该文件
      try {
        await cos.headObject({
          Bucket: config.tencentOSS.bucket,
          Region: config.tencentOSS.region,
          Key: fileKey,
        });
      } catch (error) {
        // 如果文件不存在，会抛出异常
        missingInOSS.push(image.id);
      }
    }

    // 2. 检查OSS中的图片是否存在于数据库中
    // 这里简化处理，只检查最近的100个文件
    const recentOssFiles = ossFiles.slice(-100);
    for (const fileKey of recentOssFiles) {
      totalChecked++;
      // 生成完整URL
      const url = `https://${config.tencentOSS.bucket}.cos.${config.tencentOSS.region}.myqcloud.com/${fileKey}`;
      // 检查数据库中是否存在该URL
      const image = await prisma.image.findFirst({
        where: {
          url: url,
        },
        select: {
          id: true,
        },
      });

      if (!image) {
        missingInDatabase.push(fileKey);
      }
    }

    return { missingInOSS, missingInDatabase, totalChecked };
  } catch (error) {
    console.error('检查图片数据一致性失败:', error);
    throw new Error('数据一致性检查失败');
  }
}

/**
 * 修复图片数据一致性
 * 1. 删除数据库中不存在于OSS中的图片记录
 * 2. （可选）将OSS中不存在于数据库中的图片导入到数据库
 * @returns 修复结果
 */
export async function fixImageConsistency(): Promise<{
  deletedFromDatabase: number;
  importedToDatabase: number;
}> {
  let deletedFromDatabase = 0;
  let importedToDatabase = 0;

  try {
    // 先检查一致性
    const consistencyResult = await checkImageConsistency();

    // 1. 删除数据库中不存在于OSS中的图片记录
    for (const imageId of consistencyResult.missingInOSS) {
      // 使用事务删除图片及其关联数据
      await prisma.$transaction(async (tx) => {
        // 删除关联的waterfallItem记录
        await tx.waterfallItem.deleteMany({
          where: {
            imageId: imageId,
          },
        });
        // 删除图片记录
        await tx.image.delete({
          where: {
            id: imageId,
          },
        });
      });
      deletedFromDatabase++;
    }

    // 2. （可选）将OSS中不存在于数据库中的图片导入到数据库
    // 这里简化处理，实际情况可能需要更多信息（如宽高、文件名等）
    // for (const fileKey of consistencyResult.missingInDatabase) {
    //   // 生成完整URL
    //   const url = `https://${config.tencentOSS.bucket}.cos.${config.tencentOSS.region}.myqcloud.com/${fileKey}`;
    //   // 创建图片记录
    //   await prisma.image.create({
    //     data: {
    //       url: url,
    //       // 其他字段需要从OSS获取或设置默认值
    //     },
    //   });
    //   importedToDatabase++;
    // }

    return { deletedFromDatabase, importedToDatabase };
  } catch (error) {
    console.error('修复图片数据一致性失败:', error);
    throw new Error('数据一致性修复失败');
  }
}

/**
 * 从图片URL中提取fileKey
 * @param url 图片URL
 * @returns fileKey
 */
function extractFileKeyFromUrl(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // 去掉开头的'/'
  } catch (error) {
    console.error('从URL中提取fileKey失败:', error);
    return undefined;
  }
}
