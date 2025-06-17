// Local Storage utility for dropdown values
import { logger } from './logger'

const STORAGE_PREFIX = 'esports-tracker-'

export interface DropdownValues {
  // Tournament page
  tournamentStatus?: string
  tournamentDateFilter?: string
  tournamentItemsPerPage?: number
  
  // Match page
  matchGame?: string
  matchDateFilter?: string
  matchItemsPerPage?: number
  
  // Team page
  teamItemsPerPage?: number
  
  // Player page
  playerItemsPerPage?: number
}

// Get all stored dropdown values
export const getStoredDropdownValues = (): DropdownValues => {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}dropdown-values`)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    logger.warn('Failed to parse stored dropdown values:', error)
    return {}
  }
}

// Save dropdown values to local storage
export const saveDropdownValues = (values: Partial<DropdownValues>) => {
  if (typeof window === 'undefined') return
  
  try {
    const existing = getStoredDropdownValues()
    const updated = { ...existing, ...values }
    localStorage.setItem(`${STORAGE_PREFIX}dropdown-values`, JSON.stringify(updated))
  } catch (error) {
    logger.warn('Failed to save dropdown values:', error)
  }
}

// Get specific dropdown value with fallback
export const getDropdownValue = <T>(key: keyof DropdownValues, fallback: T): T => {
  const values = getStoredDropdownValues()
  return (values[key] as T) ?? fallback
}

// Save individual dropdown value
export const saveDropdownValue = (key: keyof DropdownValues, value: string | number) => {
  saveDropdownValues({ [key]: value })
}

// Clear all stored dropdown values
export const clearStoredDropdownValues = () => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}dropdown-values`)
  } catch (error) {
    logger.warn('Failed to clear stored dropdown values:', error)
  }
} 
