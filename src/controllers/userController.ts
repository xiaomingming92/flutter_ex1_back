/*
 * @Author       : Z2-WIN\xmm wujixmm@gmail.com
 * @Date         : 2025-12-23 18:06:07
 * @LastEditors  : Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime : 2026-01-05 14:52:36
 * @FilePath     : \ex1c:\Users\xmm\studioProjects\flutter_ex1_back\src\controllers\userController.ts
 * @Description  :
 */
// import { prisma } from '@/config/database.js';
// import { validateAccessToken } from '@/services/tokenService.js';
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
    const { id } = req.query as { id: string };

    if (!id) {
      const error: AppError = new Error('用户ID不能为空');
      error.statusCode = 400;
      throw error;
    }

    const result = await getUserInfo(id);
    console.log('查询到的用户详情', result);
    res.json({
      code: 200,
      data: result,
      message: '用户信息获取成功',
    });
  } catch (error) {
    next(error);
  }
}
