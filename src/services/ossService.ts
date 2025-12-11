import COS from 'cos-nodejs-sdk-v5';
import { config } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const cos = new COS({
  SecretId: config.tencentOSS.secretId,
  SecretKey: config.tencentOSS.secretKey,
});

/**
 * 上传文件到腾讯云OSS
 * @param file 文件Buffer或Stream
 * @param fileName 文件名
 * @param folder 文件夹路径（可选）
 * @returns 文件URL
 */
export async function uploadFile(
  file: Buffer,
  fileName: string,
  folder?: string
): Promise<string> {
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
    const fileUrl = config.tencentOSS.domain
      ? `${config.tencentOSS.domain}/${key}`
      : `https://${config.tencentOSS.bucket}.cos.${config.tencentOSS.region}.myqcloud.com/${key}`;

    return fileUrl;
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

