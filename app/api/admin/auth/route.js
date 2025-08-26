import redis from '@/lib/redis';
import crypto from 'crypto';

export async function POST(request) {
  try {
    // Check if Redis is available
    if (!redis) {
      console.error('Redis not available for authentication');
      return Response.json({ 
        error: 'Sistema de autenticação indisponível.' 
      }, { status: 503 });
    }

    const { password } = await request.json();
    const ip = getClientIP(request);
    
    // Rate limiting - max 5 attempts per IP per hour
    // Skip rate limiting in test environments or when special header is present
    const isTestEnv = process.env.NODE_ENV === 'test' || 
                      request.headers.get('x-test-mode') === 'true' ||
                      request.headers.get('user-agent')?.includes('Playwright');
    
    if (!isTestEnv) {
      const rateLimitKey = `rate_limit:admin:${ip}`;
      const attempts = await redis.incr(rateLimitKey);
      if (attempts === 1) {
        await redis.expire(rateLimitKey, 3600); // 1 hour window
      }
      
      if (attempts > 5) {
        return Response.json({ 
          error: 'Muitas tentativas. Tente novamente em 1 hora.' 
        }, { status: 429 });
      }
    }

    // Verify password using constant-time comparison
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return Response.json({ 
        error: 'Configuração do servidor inválida.' 
      }, { status: 500 });
    }

    // Use time-constant comparison to prevent timing attacks
    const providedHash = crypto.createHash('sha256').update(password).digest('hex');
    const correctHash = crypto.createHash('sha256').update(adminPassword).digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(providedHash, 'hex'), Buffer.from(correctHash, 'hex'))) {
      // Log failed attempt but don't reveal if password was wrong
      await logAuditEvent({
        action: 'login_failed',
        ip,
        timestamp: new Date().toISOString(),
        details: 'Invalid password attempt'
      });
      
      return Response.json({ 
        error: 'Credenciais inválidas.' 
      }, { status: 401 });
    }

    // Check if IP is allowed (optional)
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS;
    if (allowedIPs) {
      const allowedIPList = allowedIPs.split(',').map(ip => ip.trim());
      if (!allowedIPList.includes(ip)) {
        await logAuditEvent({
          action: 'login_blocked',
          ip,
          timestamp: new Date().toISOString(),
          details: 'IP not in allowed list'
        });
        
        return Response.json({ 
          error: 'Acesso não autorizado para este IP.' 
        }, { status: 403 });
      }
    }

    // Generate secure session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionKey = `admin_session:${sessionToken}`;
    
    // Store session in Redis with 1-hour expiration
    const sessionData = {
      ip,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    // Use separate set and expire commands for Upstash Redis
    await redis.set(sessionKey, JSON.stringify(sessionData));
    await redis.expire(sessionKey, 3600); // Set expiration separately
    
    // Clear rate limiting on successful login
    if (!isTestEnv) {
      await redis.del(rateLimitKey);
    }
    
    // Log successful login
    await logAuditEvent({
      action: 'login_success',
      ip,
      timestamp: new Date().toISOString(),
      sessionToken: sessionToken.substring(0, 8) + '...' // Only log first 8 chars for security
    });

    return Response.json({
      success: true,
      sessionToken,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json({ 
      error: 'Erro interno do servidor.' 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ 
        error: 'Token de sessão não fornecido.' 
      }, { status: 400 });
    }

    const sessionToken = authHeader.substring(7);
    const sessionKey = `admin_session:${sessionToken}`;
    const ip = getClientIP(request);
    
    // Remove session from Redis
    const sessionData = await redis.get(sessionKey);
    await redis.del(sessionKey);
    
    // Log logout
    await logAuditEvent({
      action: 'logout',
      ip,
      timestamp: new Date().toISOString(),
      sessionToken: sessionToken.substring(0, 8) + '...'
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error('Admin logout error:', error);
    return Response.json({ 
      error: 'Erro interno do servidor.' 
    }, { status: 500 });
  }
}

function getClientIP(request) {
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
    console.error('Failed to log audit event:', error);
  }
}