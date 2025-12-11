/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-06 16:21:20
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-09 17:52:01
 * @FilePath: \studioProjects\ex1_back\src\config\env.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import dotenv from 'dotenv';

// 添加quiet: true选项隐藏dotenv的默认日志
dotenv.config({ quiet: false });

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
  tencentOSS: {
    secretId: process.env.TENCENT_OSS_SECRET_ID || '',
    secretKey: process.env.TENCENT_OSS_SECRET_KEY || '',
    region: process.env.TENCENT_OSS_REGION || 'ap-guangzhou',
    bucket: process.env.TENCENT_OSS_BUCKET || '',
    domain: process.env.TENCENT_OSS_DOMAIN || '',
  },
};

