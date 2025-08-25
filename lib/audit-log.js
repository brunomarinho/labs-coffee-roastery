import redis from '@/lib/redis';

export async function logAdminAction(event) {
  try {
    if (!redis) {
      console.warn('Redis not available for audit logging');
      return false;
    }
    
    const auditKey = 'admin_audit_log';
    const eventData = {
      timestamp: event.timestamp || new Date().toISOString(),
      action: event.action,
      ip: event.ip,
      sessionToken: event.sessionToken, // Partial token for security
      ...event // Spread other event properties (inventoryId, oldValue, newValue, etc.)
    };
    
    const eventString = JSON.stringify(eventData);
    
    // Add to audit log list (newest first)
    await redis.lpush(auditKey, eventString);
    
    // Keep only last 1000 entries and set 30-day expiration
    await redis.ltrim(auditKey, 0, 999);
    await redis.expire(auditKey, 2592000); // 30 days
    
    return true;
  } catch (error) {
    console.error('Failed to log admin action:', error);
    return false;
  }
}

export async function getAuditLog(limit = 50) {
  try {
    const auditKey = 'admin_audit_log';
    const events = await redis.lrange(auditKey, 0, limit - 1);
    
    return events.map(eventString => {
      try {
        return JSON.parse(eventString);
      } catch (parseError) {
        console.error('Failed to parse audit log entry:', parseError);
        return null;
      }
    }).filter(event => event !== null);
  } catch (error) {
    console.error('Failed to retrieve audit log:', error);
    return [];
  }
}

export async function getAuditLogStats() {
  try {
    const auditKey = 'admin_audit_log';
    const totalEntries = await redis.llen(auditKey);
    
    // Get recent activity (last 100 entries for analysis)
    const recentEvents = await redis.lrange(auditKey, 0, 99);
    const parsedEvents = recentEvents.map(eventString => {
      try {
        return JSON.parse(eventString);
      } catch (parseError) {
        return null;
      }
    }).filter(event => event !== null);
    
    // Calculate stats
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const last24h = parsedEvents.filter(event => 
      new Date(event.timestamp) > oneDayAgo
    ).length;
    
    const lastWeek = parsedEvents.filter(event => 
      new Date(event.timestamp) > oneWeekAgo
    ).length;
    
    const actionCounts = parsedEvents.reduce((counts, event) => {
      counts[event.action] = (counts[event.action] || 0) + 1;
      return counts;
    }, {});
    
    const uniqueIPs = new Set(parsedEvents.map(event => event.ip)).size;
    
    return {
      totalEntries,
      last24h,
      lastWeek,
      actionCounts,
      uniqueIPs,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get audit log stats:', error);
    return {
      totalEntries: 0,
      last24h: 0,
      lastWeek: 0,
      actionCounts: {},
      uniqueIPs: 0,
      lastUpdated: new Date().toISOString(),
      error: 'Failed to load stats'
    };
  }
}

// Helper function to format audit log entries for display
export function formatAuditEntry(entry) {
  const actionLabels = {
    'login_success': 'Login realizado',
    'login_failed': 'Tentativa de login falhada',
    'login_blocked': 'Login bloqueado',
    'logout': 'Logout realizado',
    'view_inventory': 'Inventário visualizado',
    'update_inventory': 'Inventário atualizado',
    'sync_inventory': 'Sincronização de inventário',
    'session_ip_mismatch': 'Violação de IP detectada'
  };
  
  const formattedEntry = {
    timestamp: new Date(entry.timestamp).toLocaleString('pt-BR'),
    action: actionLabels[entry.action] || entry.action,
    ip: entry.ip,
    details: entry.details || '',
    ...entry
  };
  
  // Add specific formatting for different action types
  if (entry.action === 'update_inventory' && entry.inventoryId) {
    formattedEntry.details = `${entry.inventoryId}: ${entry.oldValue} → ${entry.newValue}`;
  }
  
  return formattedEntry;
}