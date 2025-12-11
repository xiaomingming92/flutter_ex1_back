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
      success: true,
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
    const { title, content } = req.body;
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

    const article = await createArticle(title, content, authorId);

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

