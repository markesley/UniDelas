// app/contexts/EmergencyContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'

export type EmergencyEvent = {
  id: string
  nome: string
  latitude: number
  longitude: number
}

interface EmergencyContextValue {
  emergencies: EmergencyEvent[]
  addEmergency: (e: EmergencyEvent) => void
  clearEmergencies: () => void
}

const EmergencyContext = createContext<EmergencyContextValue | undefined>(undefined)

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const [emergencies, setEmergencies] = useState<EmergencyEvent[]>([])
  const addEmergency = (e: EmergencyEvent) => setEmergencies((old) => [e, ...old])
  const clearEmergencies = () => setEmergencies([])
  return (
    <EmergencyContext.Provider value={{ emergencies, addEmergency, clearEmergencies }}>
      {children}
    </EmergencyContext.Provider>
  )
}

export function useEmergency() {
  const ctx = useContext(EmergencyContext)
  if (!ctx) throw new Error('useEmergency must be inside EmergencyProvider')
  return ctx
}
