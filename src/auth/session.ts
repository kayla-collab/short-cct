/**
 * Session management utilities
 */

import { generateSessionToken } from './password';

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'customer' | 'admin';
  email_verified: number;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

/**
 * Create a new session for a user
 */
export async function createSession(db: D1Database, userId: number): Promise<string> {
  const sessionId = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  await db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(sessionId, userId, expiresAt).run();

  return sessionId;
}

/**
 * Get session and user by session ID
 */
export async function getSessionWithUser(
  db: D1Database,
  sessionId: string
): Promise<{ session: Session; user: User } | null> {
  const result = await db.prepare(`
    SELECT 
      s.id as session_id,
      s.user_id,
      s.expires_at,
      s.created_at as session_created_at,
      u.id,
      u.email,
      u.name,
      u.role,
      u.email_verified,
      u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).bind(sessionId).first<{
    session_id: string;
    user_id: number;
    expires_at: string;
    session_created_at: string;
    id: number;
    email: string;
    name: string | null;
    role: 'customer' | 'admin';
    email_verified: number;
    created_at: string;
  }>();

  if (!result) {
    return null;
  }

  // Check if session is expired
  if (new Date(result.expires_at) < new Date()) {
    // Delete expired session
    await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
    return null;
  }

  return {
    session: {
      id: result.session_id,
      user_id: result.user_id,
      expires_at: result.expires_at,
      created_at: result.session_created_at,
    },
    user: {
      id: result.id,
      email: result.email,
      name: result.name,
      role: result.role,
      email_verified: result.email_verified,
      created_at: result.created_at,
    },
  };
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
}

/**
 * Delete all sessions for a user (logout everywhere)
 */
export async function deleteAllUserSessions(db: D1Database, userId: number): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(db: D1Database): Promise<number> {
  const result = await db.prepare(
    "DELETE FROM sessions WHERE expires_at < datetime('now')"
  ).run();
  return result.meta.changes || 0;
}

/**
 * Get session ID from cookie header
 */
export function getSessionIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === 'session_id') {
      return value;
    }
  }
  return null;
}

/**
 * Create Set-Cookie header for session
 */
export function createSessionCookie(sessionId: string, secure: boolean = true): string {
  const maxAge = SESSION_DURATION_MS / 1000; // Convert to seconds
  // Use SameSite=Lax to allow cookies on top-level navigation (links, redirects)
  // SameSite=Strict would prevent cookies from being sent when navigating to the site
  const sameSite = 'Lax';
  const secureFlag = secure ? '; Secure' : '';
  
  return `session_id=${sessionId}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=${sameSite}${secureFlag}`;
}

/**
 * Create Set-Cookie header to clear session
 */
export function createClearSessionCookie(): string {
  return 'session_id=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax';
}

/**
 * Rotate session - create new session and delete old one
 * This prevents session fixation attacks
 */
export async function rotateSession(db: D1Database, oldSessionId: string, userId: number): Promise<string> {
  // Create new session
  const newSessionId = await createSession(db, userId);
  
  // Delete old session
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(oldSessionId).run();
  
  return newSessionId;
}

/**
 * Limit concurrent sessions per user
 * Keeps only the N most recent sessions
 */
export async function limitUserSessions(db: D1Database, userId: number, maxSessions: number = 5): Promise<void> {
  try {
    // Get all sessions for user, ordered by creation date
    const sessions = await db.prepare(`
      SELECT id FROM sessions 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind(userId).all();
    
    const sessionIds = (sessions.results || []) as { id: string }[];
    
    // If more than max sessions, delete the oldest ones
    if (sessionIds.length > maxSessions) {
      const sessionsToDelete = sessionIds.slice(maxSessions);
      for (const session of sessionsToDelete) {
        await db.prepare('DELETE FROM sessions WHERE id = ?').bind(session.id).run();
      }
    }
  } catch (error) {
    console.error('Error limiting user sessions:', error);
  }
}

/**
 * Get active session count for user
 */
export async function getUserSessionCount(db: D1Database, userId: number): Promise<number> {
  const result = await db.prepare(
    "SELECT COUNT(*) as count FROM sessions WHERE user_id = ? AND expires_at > datetime('now')"
  ).bind(userId).first<{ count: number }>();
  return result?.count || 0;
}
