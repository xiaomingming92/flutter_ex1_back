// 创建中间件文件 src/middleware/apiKeyAuth.ts
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API Key is required' });
  }
  
  if (apiKey !== config.apiKey) {
    return res.status(403).json({ message: 'Invalid API Key' });
  }
  
  next();
};