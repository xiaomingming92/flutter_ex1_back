/*
 * @Author       : Z2-WIN\xmm wujixmm@gmail.com
 * @Date         : 2025-12-11 11:45:31
 * @LastEditors  : Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime : 2025-12-24 10:18:41
 * @FilePath     : \ex1c:\Users\xmm\studioProjects\flutter_ex1_back\src\index.ts
 * @Description  :
 */
import cors from 'cors';
import express from 'express';
import { config } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import { httpLoggerMiddleware, logger } from './utils/logger.js';

const app = express();

// 中间件
app.use(
  cors({
    origin: '*', // 在生产环境中应该指定具体的前端域名
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Add HTTP request logging middleware
app.use(httpLoggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/ex1/api', routes);

// 健康检查
app.get('/ex1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
const PORT = Number(config.port);
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server is running on port ${PORT} in ${config.nodeEnv} mode`);
});
