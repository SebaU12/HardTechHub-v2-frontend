export const ORDER_TAX_RATE = 0.18
export const ORDER_SHIPPING_COST = 25

export interface OrderEstimate {
  subtotal: number
  tax: number
  shipping: number
  total: number
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateOrderEstimate(subtotal: number): OrderEstimate {
  const safeSubtotal = Number.isFinite(subtotal) && subtotal > 0
    ? roundMoney(subtotal)
    : 0
  const tax = roundMoney(safeSubtotal * ORDER_TAX_RATE)
  const shipping = safeSubtotal > 0 ? ORDER_SHIPPING_COST : 0
  return {
    subtotal: safeSubtotal,
    tax,
    shipping,
    total: roundMoney(safeSubtotal + tax + shipping),
  }
}
