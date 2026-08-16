import type { PendingOrder } from '../types'

const KEY = 'clik_pending_order'

export function getPendingOrder(): PendingOrder | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as PendingOrder
  } catch {
    return null
  }
}

export function setPendingOrder(order: PendingOrder) {
  localStorage.setItem(KEY, JSON.stringify(order))
}

export function clearPendingOrder() {
  localStorage.removeItem(KEY)
}
