/*
 * @Author: Logging Configuration
 * @Description: Winston logger configuration for request logging and file management
 */
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

// Define log directory
const LOG_DIR = path.join(process.cwd(), 'logs');

// Create log directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'blue',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define format for log messages
const format = winston.format.combine(
  // Add timestamp with format
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add colored output for console
  winston.format.colorize({ all: true }),
  // Define log message format
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports (where logs will be stored)
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format,
    level: config.logging.level,
  }),
  // Error logs file
  new winston.transports.File({
    filename: path.join(LOG_DIR, 'error.log'),
    level: 'error',
    maxsize: config.logging.maxFileSize,
    maxFiles: config.logging.maxFiles,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
  // All logs file (excluding debug in production)
  new winston.transports.File({
    filename: path.join(LOG_DIR, 'combined.log'),
    maxsize: config.logging.maxFileSize,
    maxFiles: config.logging.maxFiles,
    level: config.logging.level,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
  // HTTP request logs file
  new winston.transports.File({
    filename: path.join(LOG_DIR, 'http.log'),
    maxsize: config.logging.maxFileSize,
    maxFiles: config.logging.maxFiles,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
];

// Create and export logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  transports,
  exitOnError: false,
});

// Create HTTP request logger middleware
export const httpLoggerMiddleware = (req: any, res: any, next: any) => {
  // Start timer
  const start = Date.now();
  
  // Log request start
  const logMessage = `${req.method} ${req.originalUrl} - IP: ${req.ip}`;
  logger.http(logMessage);
  
  // Capture response end
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms - IP: ${req.ip}`;
    logger.http(logMessage);
  });
  
  next();
};