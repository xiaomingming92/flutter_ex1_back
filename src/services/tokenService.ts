/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-08 15:43:32
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-08 15:54:15
 * @FilePath: \studioProjects\ex1_back\src\services\tokenService.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { prisma } from '../config/database.js';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * 验证访问令牌
 * @param token 访问令牌
 * @returns 验证结果
 */
export async function validateAccessToken(token: string): Promise<TokenPayload> {
  // 首先验证JWT签名和基本有效性
  let payload: TokenPayload;
  
  try {
    payload = await verifyToken(token);
  } catch (error: any) {
    const appError: AppError = new Error(error.message);
    appError.statusCode = 200;
    if (error.message === 'Token已过期') {
      appError.code = 401;
    } else {
      appError.code = 401;
    }
    throw appError;
  }
  
  // 检查token是否在数据库中且未被撤销
  const now = new Date();
  const tokenRecord = await prisma.userToken.findFirst({
    where: {
      accessToken: token,
      userId: payload.userId,
      accessExpiresAt: {
        gte: now, // 检查是否未过期zz
      },
      revokedAt: null, // 检查是否未被撤销
    },
  });
  
  if (!tokenRecord) {
    const appError: AppError = new Error('Token已失效');
    appError.statusCode = 200;
    appError.code = 401;
    throw appError;
  }
  
  return payload;
}