/**
 * Authentication middleware for Hono
 */

import { Context, Next } from 'hono';
import { getSessionIdFromCookie, getSessionWithUser, User } from './session';

// Extend Hono context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: User | null;
    sessionId: string | null;
  }
}

/**
 * Middleware to attach user to context if logged in
 * Does not block requests - just adds user info if available
 */
export async function authMiddleware(c: Context<{ Bindings: { DB: D1Database } }>, next: Next) {
  const cookieHeader = c.req.header('Cookie');
  const sessionId = getSessionIdFromCookie(cookieHeader);

  if (sessionId) {
    try {
      const sessionData = await getSessionWithUser(c.env.DB, sessionId);
      if (sessionData) {
        c.set('user', sessionData.user);
        c.set('sessionId', sessionId);
      } else {
        c.set('user', null);
        c.set('sessionId', null);
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      c.set('user', null);
      c.set('sessionId', null);
    }
  } else {
    c.set('user', null);
    c.set('sessionId', null);
  }

  await next();
}

/**
 * Middleware that requires authentication
 * Returns 401 if not logged in
 */
export async function requireAuth(c: Context<{ Bindings: { DB: D1Database } }>, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401);
  }

  await next();
}

/**
 * Middleware that requires admin role
 * Returns 403 if not admin
 */
export async function requireAdmin(c: Context<{ Bindings: { DB: D1Database } }>, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401);
  }

  if (user.role !== 'admin') {
    return c.json({ error: 'Admin access required', code: 'FORBIDDEN' }, 403);
  }

  await next();
}

/**
 * Simple rate limiting using in-memory store
 * Note: In production with multiple workers, use KV or Durable Objects
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();

    // Clean up old entries on each request (instead of setInterval)
    for (const [k, r] of rateLimitStore) {
      if (r.resetAt < now) {
        rateLimitStore.delete(k);
      }
    }

    let record = rateLimitStore.get(key);

    if (!record || record.resetAt < now) {
      record = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, record);
    }

    record.count++;

    if (record.count > maxRequests) {
      return c.json({ 
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMITED'
      }, 429);
    }

    await next();
  };
}
