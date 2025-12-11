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
    authorId: string
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

    const article = await prisma.article.create({
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

