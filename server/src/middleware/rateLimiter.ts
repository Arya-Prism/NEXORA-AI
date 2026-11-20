import rateLimit from 'express-rate-limit';

// General API Rate Limiter: 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter Rate Limiter for AI endpoints: 30 requests per minute
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'AI request limit reached. Please wait a minute before making more requests.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoint rate limiter to prevent brute force: 15 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many login or registration attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
