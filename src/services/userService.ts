/*
 * @Author       : Z2-WIN\xmm wujixmm@gmail.com
 * @Date         : 2025-12-11 11:45:31
 * @LastEditors  : Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime : 2025-12-23 17:41:44
 * @FilePath     : \ex1c:\Users\xmm\studioProjects\flutter_ex1_back\src\services\userService.ts
 * @Description  :
 */
import { logger } from '@/utils/logger.js';
import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

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
