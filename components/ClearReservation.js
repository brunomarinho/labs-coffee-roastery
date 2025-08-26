'use client'

import { useEffect } from 'react'

export default function ClearReservation() {
  useEffect(() => {
    // Clear any pending reservation when reaching the success page
    const pendingReservation = localStorage.getItem('pendingReservation')
    
    if (pendingReservation) {
      console.log('Purchase completed, clearing pending reservation from localStorage')
      localStorage.removeItem('pendingReservation')
    }
  }, [])
  
  return null
}