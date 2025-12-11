/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-06 16:21:20
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-08 15:44:09
 * @FilePath: \studioProjects\ex1_back\src\utils\jwt.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';

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
  return jwt.sign(
    payload,
    config.jwt.secret,
    {
      expiresIn: '15m', // access_token 15分钟过期
    } as SignOptions
  );
}

/**
 * 生成JWT refresh_token
 * @param payload token负载
 * @returns refresh_token字符串
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    config.jwt.secret,
    {
      expiresIn: '30d', // refresh_token 30天过期
    } as SignOptions
  );
}

/**
 * 验证JWT token
 * @param token token字符串
 * @returns token负载
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token已过期');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token无效');
    }
    throw new Error('Token验证失败');
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
    throw new Error('只有refresh_token才能用于刷新');
  }
  // 移除type字段和过期时间相关信息
  const { type, expiresIn, ...newPayload } = payload;
  return generateAccessToken(newPayload as TokenPayload);
}

