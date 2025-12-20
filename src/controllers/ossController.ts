import { Request, Response, NextFunction } from 'express';
import { uploadFile, getFileDownloadUrl } from '../services/ossService.js';
import { uploadImageWithTransaction } from '../services/imageService.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * 文件上传接口
 */
export async function uploadFileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file && !req.body.file) {
      const error: AppError = new Error('请选择要上传的文件');
      error.statusCode = 400;
      throw error;
    }

    // 支持两种方式：multipart/form-data 或 base64
    let fileBuffer: Buffer;
    let fileName: string;

    if (req.file) {
      // multipart/form-data 方式
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
    } else {
      // base64 方式
      const { file, fileName: name } = req.body;
      if (!file || !name) {
        const error: AppError = new Error('文件数据或文件名缺失');
        error.statusCode = 400;
        throw error;
      }
      fileBuffer = Buffer.from(file, 'base64');
      fileName = name;
    }

    const folder = req.body.folder || 'uploads';
    const articleId = req.body.articleId;
    const description = req.body.description;

    // 使用事务方式上传图片并保存到数据库
    const result = await uploadImageWithTransaction(
      fileBuffer,
      fileName,
      folder,
      articleId,
      description
    );

    res.json({
      code: 200,
      message: '文件上传成功',
      data: {
        url: result.url,
        imageId: result.imageId,
        fileName,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 文件下载接口（返回预签名URL）
 */
export async function getFileDownloadUrlController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { fileKey } = req.params;
    const expires = req.query.expires ? parseInt(req.query.expires as string) : 3600;

    if (!fileKey) {
      const error: AppError = new Error('文件key不能为空');
      error.statusCode = 400;
      throw error;
    }

    const downloadUrl = await getFileDownloadUrl(fileKey, expires);

    res.json({
      code: 200,
      message: '文件下载URL生成成功',
      data: {
        url: downloadUrl,
        expires,
      },
    });
  } catch (error) {
    next(error);
  }
}

