/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-11 11:45:31
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-19 14:24:02
 * @FilePath: \studioProjects\flutter_ex1_back\src\controllers\waterfallController.ts
 * @Description: 
 */
import { Request, Response, NextFunction } from 'express';
import { getWaterfallItems } from '../services/waterfallService.js';
import { logger } from '@/utils/logger.js';

/**
 * 获取瀑布流数据（支持分页）
 */
export async function getWaterfallItemsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const result = await getWaterfallItems(page, pageSize);
    logger.info(`获取瀑布流数据成功，页码：${page}，每页数据：${result.items}`);
    res.json({
      code: 200,
      message: '获取瀑布流数据成功',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

