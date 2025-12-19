/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-11 11:45:31
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-19 14:34:10
 * @FilePath: \studioProjects\flutter_ex1_back\src\middlewares\errorHandler.ts
 * @Description: 
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.code || 500;

  // 记录错误到日志系统
  logger.error(`[错误处理] ${req.method} ${req.originalUrl} - IP: ${req.ip} - 状态码: ${statusCode} - 错误: ${message}${err.stack ? ` - 堆栈: ${err.stack}` : ''}`);

  res.status(statusCode).json({
    code: statusCode,
    message,
    error: {
      message,
      code: errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

