/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-06 16:21:20
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-19 17:13:51
 * @FilePath: \studioProjects\flutter_ex1_back\src\config\env.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import dotenv from 'dotenv';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

// 在ES模块中模拟__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// 加载.env文件
dotenv.config({
  path: resolve(join(__dirname, '../../', '.env')),
  quiet: false
});

// 加载.env.local文件（本地开发环境配置，优先级更高）
dotenv.config({
  path: resolve(join(__dirname, '../../', '.env.local')),
  override: true, // 覆盖已加载的.env变量
  quiet: false
});

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiKey: process.env.API_KEY,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
  tencentOSS: {
    domain: process.env.TENCENT_COS_DOMAIN || '',
    secretId: process.env.TENCENT_COS_SECRET_ID || '',
    secretKey: process.env.TENCENT_COS_SECRET_KEY || '',
    region: process.env.TENCENT_COS_REGION || '',
    bucket: process.env.TENCENT_COS_BUCKET || '',
  },
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE || '5242880'), // Default 5MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'), // Default 5 files
  },
};

