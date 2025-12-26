/*
 * @Author       : Z2-WIN\xmm wujixmm@gmail.com
 * @Date         : 2025-12-11 11:45:31
 * @LastEditors  : Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime : 2025-12-26 08:48:16
 * @FilePath     : \ex1c:\Users\xmm\studioProjects\flutter_ex1_back\src\routes\index.ts
 * @Description  : 路由模块
 */
import { Router } from 'express';
import articleRoutes from './article.js';
import authRoutes from './auth.js';
import ossRoutes from './oss.js';
import userRoutes from './user.js';
import waterfallRoutes from './waterfall.js';

const router = Router();

// 注册各个路由模块
router.use('/oss', ossRoutes);
router.use('/auth', authRoutes);
router.use('/article', articleRoutes);
router.use('/waterfall', waterfallRoutes);
router.use('/user', userRoutes);

export default router;
