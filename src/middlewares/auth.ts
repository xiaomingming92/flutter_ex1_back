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

