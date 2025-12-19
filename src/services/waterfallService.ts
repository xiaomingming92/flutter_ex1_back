/*
 * @Author: xiaomingming wujixmm@gmail.com
 * @Date: 2025-12-06 11:11:46
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-19 16:39:02
 * @FilePath: \studioProjects\flutter_ex1_back\src\services\waterfallService.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
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
            select: {
                id: true,
                imageUrl: true,
                description: true,
                articleId: true,
                createdAt: true,
                updatedAt: true,
            },
        }),
        prisma.waterfallItem.count(),
    ]);
    // TODO 每个图片的url 都是腾讯oss服务的oss url，问题是如何获取图片的宽度和高度
    // 这里先假设每个图片的宽度和高度都是100
    items.forEach(item => {
        
    })

    const totalPages = Math.ceil(total / pageSize);

    return {
        items,
        total,
        page,
        pageSize,
        totalPages,
    };
}

