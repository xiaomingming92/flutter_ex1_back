/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-11 11:45:31
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-15 15:14:39
 * @FilePath: \studioProjects\flutter_ex1_back\src\middlewares\auth.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

// 扩展Request类型以包含user信息
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * JWT认证中间件
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const error: AppError = new Error('未提供认证token');
      error.statusCode = 401;
      throw error;
    }

    const payload = await verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof Error && (error as AppError).statusCode) {
      next(error);
    } else {
      const appError: AppError = new Error('Token验证失败');
      appError.statusCode = 401;
      next(appError);
    }
  }
}

