/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-11 11:45:31
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-19 14:33:21
 * @FilePath: \studioProjects\flutter_ex1_back\src\controllers\articleController.ts
 * @Description: 
 */
import { Request, Response, NextFunction } from 'express';
import { getArticleById, createArticle } from '../services/articleService.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * 通过ID获取文章
 */
export async function getArticleByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id) {
      const error: AppError = new Error('文章ID不能为空');
      error.statusCode = 400;
      throw error;
    }

    const article = await getArticleById(id);

    res.json({
      code: 200,
      message: '获取文章成功',
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 创建新文章
 */
export async function createArticleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, content, imageIds } = req.body;
    const authorId = (req as any).user?.userId; // 从JWT中间件获取

    if (!title || !content) {
      const error: AppError = new Error('标题和内容不能为空');
      error.statusCode = 400;
      throw error;
    }

    if (!authorId) {
      const error: AppError = new Error('未授权，请先登录');
      error.statusCode = 401;
      throw error;
    }

    // 验证 imageIds 格式
    let parsedImageIds: string[] | undefined;
    if (imageIds) {
      if (Array.isArray(imageIds)) {
        parsedImageIds = imageIds;
      } else if (typeof imageIds === 'string') {
        // 支持字符串格式，尝试解析
        try {
          parsedImageIds = JSON.parse(imageIds);
        } catch {
          parsedImageIds = [imageIds];
        }
      }
    }

    const article = await createArticle(title, content, authorId, parsedImageIds);

    res.json({
      code: 201,
      message: '创建文章成功',
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

