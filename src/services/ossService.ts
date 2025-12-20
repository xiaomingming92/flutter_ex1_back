/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-11 11:45:31
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-20 09:24:19
 * @FilePath: \studioProjects\flutter_ex1_back\src\services\ossService.ts
 * @Description: 
 */
import COS from 'cos-nodejs-sdk-v5';
import { config } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '../config/database.js';

export const cos = new COS({
  SecretId: config.tencentOSS.secretId,
  SecretKey: config.tencentOSS.secretKey,
});
type ImageInfo = {
  url: string;
  isImage: boolean;
  width?: number;
  height?: number;
  mimeType?: string;
  size?: number;
  filename?: string;
}
/**
 * 上传文件到腾讯云OSS
 * @param file 文件Buffer或Stream
 * @param fileName 文件名
 * @param folder 文件夹路径（可选）
 * @returns 文件URL和图片宽高信息（如果是图片）
 */
export async function uploadFile(
  file: Buffer,
  fileName: string,
  folder?: string
): Promise<ImageInfo> {
  try {
    // 生成唯一文件名
    const ext = path.extname(fileName);
    const uniqueFileName = `${uuidv4()}${ext}`;
    const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

    const result = await cos.putObject({
      Bucket: config.tencentOSS.bucket,
      Region: config.tencentOSS.region,
      Key: key,
      Body: file,
    });

    // 返回完整的文件URL
    // 使用cos.getObjectUrl方法生成URL，更可靠地处理不同配置
    const fileUrl = cos.getObjectUrl({
      Bucket: config.tencentOSS.bucket,
      Region: config.tencentOSS.region,
      Key: key,
      // Domain: config.tencentOSS.domain || undefined,
      Sign: false, // 公开访问，不生成签名URL
    });

    // 获取图片宽高信息（仅支持图片文件）
    let width: number | undefined;
    let height: number | undefined;
    let mimeType: string | undefined;
    let size: number | undefined;

    // 检查是否为图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    if (imageExtensions.includes(ext.toLowerCase())) {
      try {
        const metadata = await sharp(file).metadata();
        width = metadata.width;
        height = metadata.height;
        mimeType = metadata.format;
        size = metadata.size;
      } catch (error) {
        console.warn('Failed to get image metadata:', error);
        // 继续执行，即使获取宽高失败也返回URL
      }
    }

    const fileInfo = {
      url: fileUrl,
      width,
      height,
      mimeType,
      size,
      filename: fileName
    };

    // 处理图片元数据（纯函数）
    const processedImageInfo = processImageMetadata(fileInfo);

    return processedImageInfo;
  } catch (error) {
    console.error('OSS upload error:', error);
    throw new Error('文件上传失败');
  }
}

/**
 * 获取文件下载URL（预签名URL，有效期1小时）
 * @param fileKey 文件在OSS中的key
 * @param expires 过期时间（秒），默认3600
 * @returns 预签名URL
 */
export function getFileDownloadUrl(
  fileKey: string,
  expires: number = 3600
): string {
  try {
    const url = cos.getObjectUrl({
      Bucket: config.tencentOSS.bucket,
      Region: config.tencentOSS.region,
      Key: fileKey,
      Expires: expires,
      Sign: true,
    });

    return url;
  } catch (error) {
    console.error('OSS get download URL error:', error);
    throw new Error('获取下载链接失败');
  }
}

/**
 * 删除文件
 * @param fileKey 文件在OSS中的key
 */
export async function deleteFile(fileKey: string): Promise<void> {
  try {
    await cos.deleteObject({
      Bucket: config.tencentOSS.bucket,
      Region: config.tencentOSS.region,
      Key: fileKey,
    });
  } catch (error) {
    console.error('OSS delete error:', error);
    throw new Error('文件删除失败');
  }
}

/**
 * 处理图片元数据（纯函数）
 * @param fileInfo 图片文件信息
 * @returns 处理后的图片数据，用于数据库保存
 */
function processImageMetadata(fileInfo: { 
  url: string; 
  width?: number; 
  height?: number; 
  mimeType?: string; 
  size?: number; 
  filename?: string 
}): { 
  url: string; 
  width?: number; 
  height?: number; 
  filename?: string; 
  mimeType?: string; 
  size?: number;
  isImage: boolean
} {
  // 检查是否是图片文件
  const isImage = Boolean(fileInfo.mimeType && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileInfo.mimeType.toLowerCase()));
  
  return {
    url: fileInfo.url,
    width: fileInfo.width,
    height: fileInfo.height,
    filename: fileInfo.filename,
    mimeType: fileInfo.mimeType,
    size: fileInfo.size,
    isImage
  };
}

