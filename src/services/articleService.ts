/*
 * @Author: xiaomingming wujixmm@gmail.com
 * @Date: 2025-12-06 11:11:35
 * @LastEditors: xiaomingming wujixmm@gmail.com
 * @LastEditTime: 2025-12-06 15:01:13
 * @FilePath: /ex1_back/src/services/articleService.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * 通过ID获取文章
 */
export async function getArticleById(articleId: string) {
    const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                },
            },
            media: {
                include: {
                    image: true,
                },
                orderBy: {
                    sortOrder: 'asc',
                },
            },
        },
    });

    if (!article) {
        const error: AppError = new Error('文章不存在');
        error.statusCode = 404;
        throw error;
    }

    return {
        id: article.id,
        title: article.title,
        content: article.content,
        authorId: article.authorId,
        authorName: article.author.name || article.author.username || '未知',
        images: article.media.map((m) => ({
            id: m.image.id,
            url: m.image.url,
            width: m.image.width,
            height: m.image.height,
        })),
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
    };
}

/**
 * 创建新文章
 */
export async function createArticle(
    title: string,
    content: string,
    authorId: string,
    imageIds?: string[]
) {
    // 验证作者是否存在
    const author = await prisma.user.findUnique({
        where: { id: authorId },
    });

    if (!author) {
        const error: AppError = new Error('作者不存在');
        error.statusCode = 404;
        throw error;
    }

    // 如果提供了图片ID，验证图片是否存在
    if (imageIds && imageIds.length > 0) {
        const images = await prisma.image.findMany({
            where: { id: { in: imageIds } },
        });
        if (images.length !== imageIds.length) {
            const error: AppError = new Error('部分图片不存在');
            error.statusCode = 400;
            throw error;
        }
    }

    // 使用事务创建文章和关联的媒体
    const article = await prisma.$transaction(async (tx) => {
        const createdArticle = await tx.article.create({
            data: {
                title,
                content,
                authorId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });

        // 如果有图片，创建 ArticleMedia 关联
        if (imageIds && imageIds.length > 0) {
            await tx.articleMedia.createMany({
                data: imageIds.map((imageId, index) => ({
                    articleId: createdArticle.id,
                    imageId,
                    sortOrder: index,
                })),
            });
        }

        return createdArticle;
    });

    return {
        id: article.id,
        title: article.title,
        content: article.content,
        authorId: article.authorId,
        authorName: article.author.name || article.author.username || '未知',
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
    };
}

