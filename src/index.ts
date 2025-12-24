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
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${config.nodeEnv} mode`);
});
