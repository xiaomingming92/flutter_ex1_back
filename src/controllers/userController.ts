import { prisma } from '@/config/database.js';
import { validateAccessToken } from '@/services/tokenService.js';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middlewares/errorHandler.js';
import { getUserInfo } from '../services/userService.js';

/**
 * 用户信息接口
 */
export async function userController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 支持接收 username 或 identifier 参数
    const { id } = req.body;

    if (!id) {
      const error: AppError = new Error('用户ID不能为空');
      error.statusCode = 400;
      throw error;
    }

    const result = await getUserInfo(id);

    res.json({
      code: 200,
      data: result,
      message: '用户信息获取成功',
    });
  } catch (error) {
    next(error);
  }
}
