import bcrypt from 'bcrypt';
import { prisma } from '../config/database.js';
import { generateAccessToken, generateRefreshToken, TokenPayload, verifyToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/errorHandler.js';

export type LoginUserRes = {
    accessToken: string;
    refreshToken: string;
    accessExpiresAt: number;
    refreshExpiresAt: number;
    userInfo: { id: string; username?: string; phone?: string; name?: string };
}
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
            OR: [
                { username: identifier },
                { phone: identifier },
            ],
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
        phone: user.phone || undefined,
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
        userInfo: {
            id: user.id,
            username: user.username || undefined,
            phone: user.phone || undefined,
            name: user.name || undefined,
        },
    };
}

/**
 * 刷新token
 */
export async function refreshUserToken(refresh_token: string): Promise<{ access_token: string; refresh_token: string }> {
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
        refresh_token: new_refresh_token 
    };
}

