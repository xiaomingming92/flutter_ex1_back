/*
 * @Author       : Z2-WIN\xmm wujixmm@gmail.com
 * @Date         : 2025-12-11 11:45:31
 * @LastEditors  : Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime : 2025-12-20 11:03:16
 * @FilePath     : \ex1c:\Users\xmm\studioProjects\flutter_ex1_back\src\services\waterfallService.ts
 * @Description  : 瀑布流服务
 */

import { prisma } from '../config/database.js';

export interface WaterfallItemResponse {
    id: string;
    imageUrl: string;
    description: string | null;
    articleId: string;
    createdAt: Date;
    updatedAt: Date;
    width: number;
    height: number;
}

/**
 * 获取瀑布流数据（支持分页）
 * @param page 页码（从1开始）
 * @param pageSize 每页数量
 * @returns 瀑布流数据列表和总数
 */
export async function getWaterfallItems(
    page: number = 1,
    pageSize: number = 20
): Promise<{
    items: WaterfallItemResponse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}> {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
        prisma.waterfallItem.findMany({
            skip,
            take: pageSize,
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'desc' },
            ],
            include: {
                image: true,
            },
        }),
        prisma.waterfallItem.count(),
    ]);
    
    // 转换数据结构，将 image.url 映射到 imageUrl 字段
    const formattedItems = items.map(item => ({
        id: item.id,
        imageUrl: item.image?.url || '',
        description: item.description,
        articleId: item.articleId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        width: item.image?.width || 0,
        height: item.image?.height || 0,
    }));
    // 图片的url、宽度和高度已通过连表查询从images表获取

    const totalPages = Math.ceil(total / pageSize);

    return {
        items: formattedItems,
        total,
        page,
        pageSize,
        totalPages,
    };
}

