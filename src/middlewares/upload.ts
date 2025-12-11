import multer from 'multer';

// 配置multer，将文件存储在内存中（Buffer）
const storage = multer.memoryStorage();

// 文件大小限制：10MB
const limits = {
  fileSize: 10 * 1024 * 1024,
};

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允许所有文件类型，或者可以根据需要限制
  cb(null, true);
};

export const upload = multer({
  storage,
  limits,
  fileFilter,
});

