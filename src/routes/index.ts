import { Router } from 'express';
import ossRoutes from './oss.js';
import authRoutes from './auth.js';
import articleRoutes from './article.js';
import waterfallRoutes from './waterfall.js';

const router = Router();

// 注册各个路由模块
router.use('/oss', ossRoutes);
router.use('/auth', authRoutes);
router.use('/article', articleRoutes);
router.use('/waterfall', waterfallRoutes);

export default router;

