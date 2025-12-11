/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-06 16:21:20
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-08 15:53:26
 * @FilePath: \studioProjects\ex1_back\src\controllers\authController.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { Request, Response, NextFunction } from 'express';
import { loginUser, refreshUserToken } from '../services/userService.js';
import { AppError } from '../middlewares/errorHandler.js';
import { verifyToken } from '@/utils/jwt.js';
import { validateAccessToken } from '@/services/tokenService.js';
import { prisma } from '@/config/database.js';

/**
 * 用户登录接口
 */
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 支持接收 username 或 identifier 参数
    const { identifier, username, password } = req.body;
    
    // 确定登录标识符
    const loginIdentifier = identifier || username;

    if (!loginIdentifier || !password) {
      const error: AppError = new Error('用户名/手机号和密码不能为空');
      error.statusCode = 400;
      throw error;
    }

    const result = await loginUser(loginIdentifier, password);

    res.json({
      success: true,
      code: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Token刷新接口
 */
export async function refreshTokenController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 支持接收 refresh_token 或 token 参数
    const { refresh_token, token } = req.body;
    const refreshToken = refresh_token || token;

    if (!refreshToken) {
      const error: AppError = new Error('Token不能为空');
      error.statusCode = 400;
      throw error;
    }

    const result = await refreshUserToken(refreshToken);

    res.json({
      success: true,
      code: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function  validateTokenController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      const error: AppError = new Error('Token不能为空');
      error.statusCode = 200;
      error.code = 400;
      throw error;
    }
    
    const result = await validateAccessToken(authorization);
    res.json({
      success: true,
      code: 200,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
}
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      const error: AppError = new Error('refresh_token不能为空');
      error.statusCode = 400;
      throw error;
    }
    
    // 不直接删除记录，而是标记为已撤销
    await prisma.userToken.updateMany({
      where: {
        refreshToken: refresh_token,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    
    res.json({
      code: 200,
      success: true,
      message: '注销成功',
    });
  } catch (error: any) {
    next(error);
  }
}