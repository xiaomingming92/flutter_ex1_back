import { Request, Response, NextFunction } from 'express';
import { getWaterfallItems } from '../services/waterfallService.js';

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

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

