/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-20 10:00:00
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-20 10:00:00
 * @FilePath: \studioProjects\flutter_ex1_back\src\services\imageService.ts
 * @Description: 图片服务层，处理图片的数据库操作和事务管理
 */
import { prisma } from '../config/database.js';
import { uploadFile } from './ossService.js';
import { deleteFile } from './ossService.js';

/**
 * 图片信息接口
 */
export interface ImageInfo {
  url: string;
  width?: number;
  height?: number;
  filename?: string;
  mimeType?: string;
  size?: number;
  isImage: boolean;
}

/**
 * 创建图片记录（包含事务管理）
 * @param imageInfo 图片信息
 * @param articleId 文章ID（可选）
 * @param description 描述（可选）
 * @returns 创建的图片记录
 */
export async function createImageWithTransaction(
  imageInfo: ImageInfo,
  articleId?: string,
  description?: string
): Promise<{ imageId: string; waterfallItemId?: string }> {
  return await prisma.$transaction(async (tx) => {
    // 1. 创建图片记录
    const image = await tx.image.create({
      data: {
        url: imageInfo.url,
        width: imageInfo.width,
        height: imageInfo.height,
        filename: imageInfo.filename,
        mimeType: imageInfo.mimeType,
        size: imageInfo.size,
      },
      select: {
        id: true,
      },
    });

    let waterfallItemId: string | undefined;

    // 2. 如果提供了文章ID，创建waterfallItem记录
    if (articleId) {
      const waterfallItem = await tx.waterfallItem.create({
        data: {
          imageId: image.id,
          articleId: articleId,
          description: description,
        },
        select: {
          id: true,
        },
      });

      waterfallItemId = waterfallItem.id;
    }

    return { imageId: image.id, waterfallItemId };
  });
}

/**
 * 上传图片并保存到数据库（完整事务流程）
 * @param file 文件Buffer
 * @param fileName 文件名
 * @param folder 文件夹路径（可选）
 * @param articleId 文章ID（可选）
 * @param description 描述（可选）
 * @returns 包含图片URL和ID的结果
 */
export async function uploadImageWithTransaction(
  file: Buffer,
  fileName: string,
  folder?: string,
  articleId?: string,
  description?: string
): Promise<{ url: string; imageId: string; waterfallItemId?: string }> {
  try {
    // 1. 上传文件到OSS
    const imageInfo = await uploadFile(file, fileName, folder);

    // 2. 如果是图片文件，保存到数据库
    if (imageInfo.isImage) {
      const { imageId, waterfallItemId } = await createImageWithTransaction(
        imageInfo,
        articleId,
        description
      );

      return { url: imageInfo.url, imageId, waterfallItemId };
    }

    // 如果不是图片文件，只返回URL
    return { url: imageInfo.url, imageId: '' };
  } catch (error) {
    console.error('上传图片并保存到数据库失败:', error);
    // 如果发生错误，可以考虑删除已上传的文件（可选）
    // 注意：这里需要从URL中提取fileKey，比较复杂，所以暂时不实现
    throw new Error('图片上传失败');
  }
}

/**
 * 删除图片及其关联数据（包含事务管理）
 * @param imageId 图片ID
 * @returns 是否删除成功
 */
export async function deleteImageWithTransaction(
  imageId: string
): Promise<boolean> {
  return await prisma.$transaction(async (tx) => {
    // 1. 获取图片信息（用于后续删除OSS文件）
    const image = await tx.image.findUnique({
      where: { id: imageId },
      include: {
        waterfallItems: true,
      },
    });

    if (!image) {
      throw new Error('图片不存在');
    }

    // 2. 删除关联的waterfallItems
    await tx.waterfallItem.deleteMany({
      where: { imageId: imageId },
    });

    // 3. 删除图片记录
    await tx.image.delete({
      where: { id: imageId },
    });

    // 4. 删除OSS文件（可选，根据实际需求决定是否删除）
    // 注意：这里需要从URL中提取fileKey，比较复杂，所以暂时不实现

    return true;
  });
}

/**
 * 根据图片ID获取图片信息
 * @param imageId 图片ID
 * @returns 图片信息
 */
export async function getImageById(imageId: string): Promise<any> {
  return await prisma.image.findUnique({
    where: { id: imageId },
    include: {
      waterfallItems: true,
    },
  });
}
