
// 创建中间件文件 src/middleware/apiKeyAuth.ts
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    logger.warn(`[API Key认证失败] ${req.method} ${req.originalUrl} - IP: ${req.ip} - 未提供API Key`);
    return res.status(401).json({ message: 'API Key is required' });
  }
  
  if (apiKey !== config.apiKey) {
    logger.warn(`[API Key认证失败] ${req.method} ${req.originalUrl} - IP: ${req.ip} - 无效的API Key`);
    return res.status(403).json({ message: 'Invalid API Key' });
  }
  
  logger.info(`[API Key认证成功] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};