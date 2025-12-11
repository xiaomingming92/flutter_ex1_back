import { Router } from 'express';
import { getWaterfallItemsController } from '../controllers/waterfallController.js';

const router = Router();

// 获取瀑布流数据（公开接口，支持分页）
router.get('/', getWaterfallItemsController);

export default router;

