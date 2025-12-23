/*
 * @Author       : Z2-WIN\xmm wujixmm@gmail.com
 * @Date         : 2025-12-11 11:45:31
 * @LastEditors  : Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime : 2025-12-23 18:09:17
 * @FilePath     : \ex1c:\Users\xmm\studioProjects\flutter_ex1_back\src\services\userService.ts
 * @Description  :
 */
import { logger } from '@/utils/logger.js';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
  verifyToken,
} from '../utils/jwt.js';

export type LoginUserRes = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
  userKeyInfo: {
    id: string;
    name?: string;
    avatar?: string; // 头像URL
    roles?: string[]; // 用户角色（用于权限控制）
  };
};

/**
 * 用户登录（支持用户名或手机号）
 */
export async function loginUser(
  identifier: string,
  password: string
): Promise<LoginUserRes> {
  // 查找用户（通过用户名或手机号）
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { phone: identifier }],
    },
  });

  if (!user) {
    const error: AppError = new Error('用户不存在');
    error.statusCode = 404;
    throw error;
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error: AppError = new Error('密码错误');
    error.statusCode = 401;
    throw error;
  }

  // 生成payload
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username || undefined,
  };

  // 生成双令牌
  const access_token = generateAccessToken(payload);
  const refresh_token = generateRefreshToken(payload);

  // 计算过期时间
  const accessExpiresAt = new Date();
  accessExpiresAt.setMinutes(accessExpiresAt.getMinutes() + 15); // access_token 15分钟过期

  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30); // refresh_token 30天过期

  // 删除旧的token记录
  await prisma.userToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  // 保存新的token记录
  await prisma.userToken.create({
    data: {
      userId: user.id,
      accessToken: access_token,
      refreshToken: refresh_token,
      accessExpiresAt,
      refreshExpiresAt,
    },
  });

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    accessExpiresAt: accessExpiresAt.valueOf(),
    refreshExpiresAt: refreshExpiresAt.valueOf(),
    userKeyInfo: {
      id: user.id,
      avatar: user.avatar || undefined,
      name: user.name || undefined,
    },
  };
}

/**
 * 刷新token
 */
export async function refreshUserToken(
  refresh_token: string
): Promise<{ access_token: string; refresh_token: string }> {
  // 验证旧refresh_token
  let payload: TokenPayload;

  try {
    payload = await verifyToken(refresh_token);
  } catch (error) {
    const appError: AppError = new Error('Token无效或已过期');
    appError.statusCode = 200;
    appError.code = 401;
    throw appError;
  }

  // 检查refresh_token是否在数据库中且未过期（防止已注销的token被刷新）
  const now = new Date();
  const tokenRecord = await prisma.userToken.findFirst({
    where: {
      refreshToken: refresh_token,
      userId: payload.userId,
      refreshExpiresAt: {
        gte: now, // 检查是否未过期
      },
      revokedAt: null, // 检查是否未被撤销
    },
  });

  if (!tokenRecord) {
    const appError: AppError = new Error('Token不存在或已失效');
    appError.statusCode = 200;
    appError.code = 500;
    throw appError;
  }

  // 生成新的双令牌
  const new_access_token = generateAccessToken(payload);
  const new_refresh_token = generateRefreshToken(payload);

  // 更新token记录
  const accessExpiresAt = new Date();
  accessExpiresAt.setMinutes(accessExpiresAt.getMinutes() + 15); // 15分钟后过期

  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30); // 30天后过期

  await prisma.userToken.update({
    where: { id: tokenRecord.id },
    data: {
      accessToken: new_access_token,
      refreshToken: new_refresh_token,
      accessExpiresAt,
      refreshExpiresAt,
    },
  });

  return {
    access_token: new_access_token,
    refresh_token: new_refresh_token,
  };
}

type UserInfo = {
  id: string;
  name: string;
  avatar: string;
  roles: { name: string; permissions: string[] }[];
  createdAt: Date;
  updatedAt: Date;
  bio: string;
  phone: string;
};

export async function getUserInfo(id: string): Promise<UserInfo> {
  // 查找用户（通过用户名或手机号）
  const user = await prisma.user.findFirst({
    where: {
      id,
    },
    include: {
      roles: {
        select: {
          name: true,
          permissions: {
            select: { code: true },
          },
        },
      },
    },
  });

  if (!user) {
    const error: AppError = new Error('用户不存在');
    error.statusCode = 404;
    throw error;
  }
  // 返回用户信息（不包含密码等敏感信息）
  // 处理关联查询的roles结果，提取角色名称

  // 处理角色权限，返回权限代码数组
  const rolesWithPermissions = user.roles.map(role => ({
    name: role.name,
    permissions: role.permissions.map(permission => permission.code), // 返回权限的code字段
  }));
  const maskPhone = user.phone?.replace(/\d{4,8}/g, '*') || ''; // 手机号中间4位用*号隐藏

  return {
    id: user.id,
    name: user.name || user.username || '',
    avatar: user.avatar || '', // 头像URL
    roles: rolesWithPermissions, // 用户角色列表（从关联查询结果中提取）
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    bio: user.bio || '', // 用户简介
    phone: maskPhone, // 用户手机号
  };
}
export async function getRealPhone(
  requesterId: string,
  targetUserId: string,
  requesterRole: string
): Promise<string> {
  // 1. 检查请求者权限
  if (requesterRole !== 'admin' && requesterId !== targetUserId) {
    const appError: AppError = new Error('无权查看他人手机号');
    appError.statusCode = 403;
    throw appError;
  }

  // 2. 记录访问日志
  logger.info(`用户 ${requesterId} 查看了用户 ${targetUserId} 的手机号`);

  const user = await prisma.user.findFirst({
    where: { id: targetUserId },
    select: { phone: true },
  });
  return user?.phone || '';
}
