/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-06 16:21:20
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-15 17:21:37
 * @FilePath: \studioProjects\ex1_back\src\utils\jwt.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';
import { logger } from './logger.js';

export interface TokenPayload {
  userId: string;
  username?: string;
  phone?: string;
  expiresIn?: number;
  type?: 'access' | 'refresh';
}

/**
 * 生成JWT access_token
 * @param payload token负载
 * @returns access_token字符串
 */
export function generateAccessToken(payload: TokenPayload): string {
  const token = jwt.sign(
    payload,
    config.jwt.secret,
    {
      expiresIn: '15m', // access_token 15分钟过期
    } as SignOptions
  );
  logger.info(`[JWT] 生成access_token - 用户: ${payload.username || payload.userId}`);
  return token;
}

/**
 * 生成JWT refresh_token
 * @param payload token负载
 * @returns refresh_token字符串
 */
export function generateRefreshToken(payload: TokenPayload): string {
  const token = jwt.sign(
    payload,
    config.jwt.secret,
    {
      expiresIn: '30d', // refresh_token 30天过期
    } as SignOptions
  );
  logger.info(`[JWT] 生成refresh_token - 用户: ${payload.username || payload.userId}`);
  return token;
}

/**
 * 验证JWT token
 * @param token token字符串
 * @returns token负载
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    logger.info(`[JWT] 验证token成功 - 用户: ${decoded.username || decoded.userId} - 类型: ${decoded.type || '未知'}`);
    return decoded;
  } catch (error) {
    let errorMessage = 'Token验证失败';
    if (error instanceof jwt.TokenExpiredError) {
      errorMessage = 'Token已过期';
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorMessage = 'Token无效';
    }
    logger.error(`[JWT] ${errorMessage} - 错误: ${error instanceof Error ? error.message : '未知错误'}`);
    throw new Error(errorMessage);
  }
}

/**
 * 刷新token（生成新的access_token，保持相同的负载）
 * @param token 旧refresh_token
 * @returns 新access_token
 */
export async function refreshToken(token: string): Promise<string> {
  const payload = await verifyToken(token);
  // 确保只有refresh_token才能刷新
  if (payload.type !== 'refresh') {
    logger.error(`[JWT] 刷新token失败 - 不是refresh_token类型`);
    throw new Error('只有refresh_token才能用于刷新');
  }
  // 移除type字段和过期时间相关信息
  const { type, expiresIn, ...newPayload } = payload;
  const newAccessToken = generateAccessToken(newPayload as TokenPayload);
  logger.info(`[JWT] 刷新token成功 - 用户: ${payload.username || payload.userId}`);
  return newAccessToken;
}

