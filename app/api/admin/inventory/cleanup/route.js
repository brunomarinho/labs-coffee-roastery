import { NextResponse } from 'next/server'
import { requireAdminAuth, getClientIP } from '@/lib/auth-middleware'
import { logAdminAction } from '@/lib/audit-log'
import { cleanupOrphanedReservations } from '@/lib/redis-reservations'
import redis from '@/lib/redis'

export const POST = requireAdminAuth(async (req) => {
  try {
    if (!redis) {
      return NextResponse.json(
        { error: 'Redis não disponível para limpeza' },
        { status: 503 }
      )
    }

    // Check if force cleanup is requested
    let body = {}
    try {
      body = await req.json()
    } catch (e) {
      // No body provided, proceed with normal cleanup
    }

    let cleanedReservations = 0
    
    if (body.force) {
      // Force cleanup - delete ALL reservations
      const allReservationKeys = await redis.keys('reservation:*')
      const allReservedKeys = await redis.keys('reserved:*')
      
      for (const key of allReservationKeys) {
        await redis.del(key)
        cleanedReservations++
      }
      
      for (const key of allReservedKeys) {
        await redis.del(key)
      }
      
      console.log(`Force cleanup: removed ${cleanedReservations} reservations`)
    } else {
      // Run normal cleanup operation
      cleanedReservations = await cleanupOrphanedReservations()
    }
    
    // Get additional cleanup stats
    const cleanupStats = {
      orphanedReservations: cleanedReservations,
      timestamp: new Date().toISOString(),
    }

    // Log the admin action
    await logAdminAction({
      action: body.force ? 'force_cleanup_reservations' : 'cleanup_reservations',
      ip: getClientIP(req),
      sessionToken: req.adminAuth?.sessionToken,
      timestamp: new Date().toISOString(),
      details: body.force 
        ? `Force cleaned ${cleanedReservations} reservations`
        : `Cleaned ${cleanedReservations} orphaned reservations`,
      cleanupStats,
      forced: body.force || false
    })

    return NextResponse.json({
      success: true,
      message: `Limpeza concluída: ${cleanedReservations} reservas órfãs removidas`,
      stats: cleanupStats
    })
  } catch (error) {
    console.error('Error during reservation cleanup:', error)
    return NextResponse.json(
      { error: 'Erro durante limpeza de reservas' },
      { status: 500 }
    )
  }
})

// GET endpoint to check what would be cleaned without actually cleaning
export const GET = requireAdminAuth(async (req) => {
  try {
    if (!redis) {
      return NextResponse.json(
        { error: 'Redis não disponível' },
        { status: 503 }
      )
    }

    // Get all reservation keys for analysis
    const reservationKeys = await redis.keys('reservation:*')
    const reservedKeys = await redis.keys('reserved:*')
    
    const orphanedReservations = []
    const activeReservations = []
    
    for (const key of reservationKeys) {
      const ttl = await redis.ttl(key)
      
      if (ttl === -1) {
        // No expiry - orphaned
        orphanedReservations.push({
          key,
          sessionId: key.replace('reservation:', ''),
          issue: 'No expiry set'
        })
      } else if (ttl === -2) {
        // Key doesn't exist (shouldn't happen in this context)
        orphanedReservations.push({
          key,
          sessionId: key.replace('reservation:', ''),
          issue: 'Key expired or deleted'
        })
      } else {
        // Active reservation
        activeReservations.push({
          key,
          sessionId: key.replace('reservation:', ''),
          ttl: ttl
        })
      }
    }

    const orphanedReservedCounters = []
    for (const reservedKey of reservedKeys) {
      const ttl = await redis.ttl(reservedKey)
      if (ttl === -1) {
        const count = await redis.get(reservedKey)
        orphanedReservedCounters.push({
          key: reservedKey,
          inventoryId: reservedKey.replace('reserved:', ''),
          count: parseInt(count || 0),
          issue: 'Reserved counter without expiry'
        })
      }
    }

    // Log the admin action (viewing cleanup status)
    await logAdminAction({
      action: 'view_cleanup_status',
      ip: getClientIP(req),
      sessionToken: req.adminAuth?.sessionToken,
      timestamp: new Date().toISOString(),
      details: `Viewed cleanup status: ${orphanedReservations.length} orphaned reservations, ${orphanedReservedCounters.length} orphaned counters`
    })

    return NextResponse.json({
      analysis: {
        totalReservations: reservationKeys.length,
        activeReservations: activeReservations.length,
        orphanedReservations: orphanedReservations.length,
        orphanedReservedCounters: orphanedReservedCounters.length,
      },
      details: {
        orphanedReservations,
        orphanedReservedCounters,
        activeReservations: activeReservations.slice(0, 10) // Limit to first 10 for readability
      },
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing reservations:', error)
    return NextResponse.json(
      { error: 'Erro ao analisar reservas' },
      { status: 500 }
    )
  }
})