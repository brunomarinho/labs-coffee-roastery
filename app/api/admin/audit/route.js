import { NextResponse } from 'next/server'
import { requireAdminAuth, getClientIP } from '@/lib/auth-middleware'
import { getAuditLog, getAuditLogStats, logAdminAction } from '@/lib/audit-log'

export const GET = requireAdminAuth(async (req) => {
  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const stats = url.searchParams.get('stats') === 'true'
    
    let response
    
    if (stats) {
      response = await getAuditLogStats()
    } else {
      const auditLog = await getAuditLog(Math.min(limit, 200)) // Max 200 entries
      response = {
        logs: auditLog,
        count: auditLog.length,
        lastUpdated: new Date().toISOString()
      }
    }

    // Log the admin action
    await logAdminAction({
      action: stats ? 'view_audit_stats' : 'view_audit_log',
      ip: getClientIP(req),
      sessionToken: req.adminAuth?.sessionToken,
      timestamp: new Date().toISOString(),
      details: stats ? 'Viewed audit statistics' : `Viewed ${response.logs?.length || 0} audit entries`
    })
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting audit log:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar log de auditoria' },
      { status: 500 }
    )
  }
})