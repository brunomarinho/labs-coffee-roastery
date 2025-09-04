import redis from '@/lib/redis';
import logger from './logger.js';

export async function verifyAdminSession(request) {
  try {
    // Check if Redis is available
    if (!redis) {
      throw new Error('Sistema de autenticação indisponível.');
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token de sessão não fornecido.');
    }

    const sessionToken = authHeader.substring(7);
    const sessionKey = `admin_session:${sessionToken}`;
    
    // Get session from Redis
    const sessionDataString = await redis.get(sessionKey);
    
    if (!sessionDataString) {
      throw new Error('Sessão inválida ou expirada.');
    }

    // Upstash Redis automatically parses JSON, so check if it's already an object
    const sessionData = typeof sessionDataString === 'string' 
      ? JSON.parse(sessionDataString) 
      : sessionDataString;
    
    const currentIP = getClientIP(request);
    
    // Verify IP matches the session (prevents session hijacking)
    if (sessionData.ip !== currentIP) {
      // Log suspicious activity
      await logAuditEvent({
        action: 'session_ip_mismatch',
        originalIP: sessionData.ip,
        currentIP,
        timestamp: new Date().toISOString(),
        sessionToken: sessionToken.substring(0, 8) + '...'
      });
      
      // Invalidate the session
      await redis.del(sessionKey);
      throw new Error('Violação de segurança detectada. Sessão invalidada.');
    }

    // Update last activity timestamp
    sessionData.lastActivity = new Date().toISOString();
    // Store as JSON string for consistency
    await redis.set(sessionKey, JSON.stringify(sessionData));
    await redis.expire(sessionKey, 3600); // Extend expiration

    // Return user info
    return {
      authenticated: true,
      sessionData,
      sessionToken: sessionToken.substring(0, 8) + '...' // Partial token for logging
    };

  } catch (error) {
    throw new Error(error.message || 'Erro de autenticação.');
  }
}

export function requireAdminAuth(handler) {
  return async function(request, context) {
    try {
      const authResult = await verifyAdminSession(request);
      
      // Add auth info to request context
      request.adminAuth = authResult;
      
      return await handler(request, context);
    } catch (error) {
      return Response.json({ 
        error: error.message 
      }, { status: 401 });
    }
  };
}

export function getClientIP(request) {
  // Check various headers for the real client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || cfConnectingIP || 'unknown';
}

async function logAuditEvent(event) {
  try {
    const auditKey = 'admin_audit_log';
    const eventString = JSON.stringify(event);
    
    // Add to audit log list
    await redis.lpush(auditKey, eventString);
    
    // Keep only last 1000 entries and set 30-day expiration
    await redis.ltrim(auditKey, 0, 999);
    await redis.expire(auditKey, 2592000); // 30 days
  } catch (error) {
    logger.error('Failed to log audit event:', error);
  }
}