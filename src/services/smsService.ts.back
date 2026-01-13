/*
 * @Author       : Z2-WIN\xmm wujixmm@gmail.com
 * @Date         : 2025-12-26 16:30:00
 * @LastEditors  : Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime : 2025-12-26 16:30:00
 * @FilePath     : \flutter_ex1_back\src\services\smsService.ts
 * @Description  : 阿里云短信服务
 */
import Dysmsapi from '@alicloud/dysmsapi20170525';
import * as OpenApi from '@alicloud/openapi-client';
import * as Util from '@alicloud/tea-util';
import { logger } from '@/utils/logger.js';
import Redis from 'ioredis';

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: 0,
    });

    redisClient.on('error', err => {
      logger.error('Redis连接错误:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis连接成功');
    });
  }
  return redisClient;
}

function createClient(): Dysmsapi {
  const config = new OpenApi.Config({
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  });
  config.endpoint = 'dysmsapi.aliyuncs.com';
  return new Dysmsapi(config);
}

function generateCode(length = 6): string {
  const code = Math.floor(Math.random() * Math.pow(10, length)).toString();
  return code.padStart(length, '0');
}

export async function sendSmsCode(
  phone: string
): Promise<{ success: boolean; message: string; code?: string }> {
  try {
    if (!phone) {
      return { success: false, message: '手机号不能为空' };
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return { success: false, message: '手机号格式不正确' };
    }

    const redis = getRedisClient();
    const rateLimitKey = `sms:rate:${phone}`;
    const existingCode = await redis.get(`sms:code:${phone}`);

    if (existingCode) {
      const ttl = await redis.ttl(`sms:code:${phone}`);
      return { success: false, message: `验证码已发送，请${ttl}秒后再试` };
    }

    const lastSendTime = await redis.get(rateLimitKey);
    if (lastSendTime) {
      const elapsed = Date.now() - parseInt(lastSendTime);
      if (elapsed < 60000) {
        const remaining = Math.ceil((60000 - elapsed) / 1000);
        return {
          success: false,
          message: `发送过于频繁，请${remaining}秒后再试`,
        };
      }
    }

    const code = generateCode(6);
    const signName = process.env.ALIYUN_SMS_SIGN_NAME || '速通互联验证码';
    const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE || '100001';
    const templateParam = JSON.stringify({ code, min: '5' });

    const client = createClient();
    const request = new Dysmsapi.SendSmsRequest({
      phoneNumbers: phone,
      signName,
      templateCode,
      templateParam,
    });

    const runtime = new Util.RuntimeOptions({});
    const resp = await client.sendSms(request, runtime);

    if (resp.statusCode === 200 && resp.body) {
      if (resp.body.code === 'OK') {
        await redis.set(`sms:code:${phone}`, code, 'EX', 300);
        await redis.set(rateLimitKey, Date.now().toString(), 'EX', 60);

        logger.info(`验证码已发送到手机号: ${phone}, 验证码: ${code}`);
        return { success: true, message: '验证码发送成功', code };
      } else {
        logger.error(
          `发送验证码失败: ${resp.body.code} - ${resp.body.message}`
        );
        return {
          success: false,
          message: resp.body.message || '发送验证码失败，请稍后重试',
        };
      }
    } else {
      logger.error(`发送验证码失败: ${JSON.stringify(resp)}`);
      return { success: false, message: '发送验证码失败，请稍后重试' };
    }
  } catch (error) {
    logger.error('发送验证码异常:', error);
    return { success: false, message: '发送验证码失败，请稍后重试' };
  }
}

export async function verifySmsCode(
  phone: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!phone || !code) {
      return { success: false, message: '手机号和验证码不能为空' };
    }

    const redis = getRedisClient();
    const storedCode = await redis.get(`sms:code:${phone}`);

    if (!storedCode) {
      return { success: false, message: '验证码已过期或不存在' };
    }

    if (storedCode !== code) {
      return { success: false, message: '验证码错误' };
    }

    await redis.del(`sms:code:${phone}`);
    logger.info(`验证码验证成功: ${phone}`);
    return { success: true, message: '验证码验证成功' };
  } catch (error) {
    logger.error('验证码验证异常:', error);
    return { success: false, message: '验证码验证失败' };
  }
}
