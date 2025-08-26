import { NextResponse } from 'next/server'
import { releaseReservation } from '@/lib/redis-reservations'
import redis from '@/lib/redis'

export async function POST(request) {
  try {
    const { sessionId, inventoryId } = await request.json()
    
    if (!sessionId || !inventoryId) {
      return NextResponse.json(
        { error: 'sessionId e inventoryId são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Verify the reservation exists before releasing
    const reservationKey = `reservation:${sessionId}`
    const reservationExists = await redis.get(reservationKey)
    
    if (!reservationExists) {
      // Reservation doesn't exist or already expired
      return NextResponse.json({
        released: false,
        message: 'Reserva não encontrada ou já expirada'
      })
    }
    
    // Release the reservation
    const releasedQuantity = await releaseReservation(inventoryId, sessionId)
    
    console.log(`Released reservation for session ${sessionId}, inventory ${inventoryId}: ${releasedQuantity} units`)
    
    return NextResponse.json({
      released: true,
      quantity: releasedQuantity,
      message: 'Reserva liberada com sucesso'
    })
  } catch (error) {
    console.error('Error releasing reservation:', error)
    return NextResponse.json(
      { error: 'Erro ao liberar reserva' },
      { status: 500 }
    )
  }
}