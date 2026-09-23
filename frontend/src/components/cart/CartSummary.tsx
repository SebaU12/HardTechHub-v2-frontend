import type { ReactNode } from 'react'
import { useCart } from '../../hooks'
import { formatPrice } from '../../utils/formatPrice'
import { calculateOrderEstimate } from '../../utils/orderTotals'
export function CartSummary({
  children,
  checkout = false,
}: {
  children: ReactNode
  checkout?: boolean
}) {
  const { subtotal, totalItems } = useCart()
  const estimate = calculateOrderEstimate(subtotal)
  return (
    <aside className="cart-summary">
      <span className="eyebrow">UN PASO MÁS CERCA</span>
      <h2>Resumen del pedido</h2>
      <div className="summary-row">
        <span>Productos</span>
        <strong>{totalItems}</strong>
      </div>
      <div className={`summary-row ${checkout ? '' : 'summary-total'}`}>
        <span>Subtotal</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>
      {checkout && (
        <>
          <div className="summary-row">
            <span>IGV estimado (18%)</span>
            <strong>{formatPrice(estimate.tax)}</strong>
          </div>
          <div className="summary-row">
            <span>Envío estimado</span>
            <strong>{formatPrice(estimate.shipping)}</strong>
          </div>
          <div className="summary-row summary-total">
            <span>Total estimado</span>
            <strong>{formatPrice(estimate.total)}</strong>
          </div>
        </>
      )}
      <p>
        {checkout
          ? 'El servidor volverá a calcular y registrar estos importes al confirmar.'
          : 'Impuestos y envío se calcularán al confirmar el pedido.'}
      </p>
      {children}
      <span className="summary-footnote">
        Revisa los productos y sus cantidades antes de continuar.
      </span>
    </aside>
  )
}
