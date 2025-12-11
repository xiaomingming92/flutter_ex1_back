import { Router } from 'express';
import { getArticleByIdController, createArticleController } from '../controllers/articleController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// 获取文章（公开接口）
router.get('/:id', getArticleByIdController);

// 创建文章（需要认证）
router.post('/', authenticateToken, createArticleController);

export default router;

