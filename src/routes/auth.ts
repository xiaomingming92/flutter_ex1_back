/*
 * @Author       : wujixmm
 * @Date         : 2025-12-06 16:21:20
 * @LastEditors  : wujixmm wujixmm@gmail.com
 * @LastEditTime : 2026-01-13 09:38:53
 * @FilePath     : /flutter_ex1_back/src/routes/auth.ts
 * @Description  : 鉴权路由
 *
 */

import { Router } from 'express';
import {
  loginController,
  logoutController,
  refreshTokenController,
  validateTokenController,
} from '../controllers/authController.js';

const router = Router();

// 用户登录
router.post('/login', loginController);

// Token状态检测
router.get('/check-token', validateTokenController);

// Token刷新
router.post('/refresh-token', refreshTokenController);

// 用户注销
router.post('/logout', logoutController);

// // 发送短信验证码
// router.post('/send-code', sendCodeController);

// // 短信验证码登录
// router.post('/sms-login', smsLoginController);

export default router;
