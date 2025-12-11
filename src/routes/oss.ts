import { Router } from 'express';
import { uploadFileController, getFileDownloadUrlController } from '../controllers/ossController.js';
import { upload } from '../middlewares/upload.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// 文件上传（需要认证）
router.post('/upload', authenticateToken, upload.single('file'), uploadFileController);

// 获取文件下载URL（需要认证）
router.get('/download/:fileKey', authenticateToken, getFileDownloadUrlController);

export default router;

