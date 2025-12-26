/*
 * @Author: Z2-WIN\xmm wujixmm@gmail.com
 * @Date: 2025-12-06 16:21:20
 * @LastEditors: Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime: 2025-12-26 16:30:00
 * @FilePath: \studioProjects\ex1_back\src\routes\auth.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Router } from 'express';
import {
  loginController,
  logoutController,
  refreshTokenController,
  validateTokenController,
  sendCodeController,
  smsLoginController,
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

// 发送短信验证码
router.post('/send-code', sendCodeController);

// 短信验证码登录
router.post('/sms-login', smsLoginController);

export default router;
