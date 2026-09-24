import { useState, type FormEvent } from 'react'
import { AlertTriangle, PackageSearch, RefreshCw } from 'lucide-react'
import { useLowStock } from '../hooks/useLowStock'
import { useInventoryAdjustment } from '../hooks/useInventoryAdjustment'
import { ErrorState, LoadingSpinner } from '../components/common/States'

export function InventoryPage() {
  return (
    <div className="container page">
      <div className="page-heading">
        <span className="eyebrow">GESTIÓN DE STOCK</span>
        <h1>
          Inventario<span className="accent">.</span>
        </h1>
        <p>Consulta productos con stock bajo y registra ajustes de inventario.</p>
      </div>
      <div style={{ display: 'grid', gap: '2.5rem' }}>
        <LowStockSection />
        <AdjustmentSection />
      </div>
    </div>
  )
}

function LowStockSection() {
  const { items, loading, error, refetch } = useLowStock()

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <AlertTriangle size={20} />
        <h2 style={{ margin: 0 }}>Productos con stock bajo</h2>
        <button
          className="button button-secondary"
          style={{ marginLeft: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorState message={error} retry={refetch} />
      ) : items.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }} className="muted">
          <PackageSearch size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
          <p>Todos los productos tienen stock suficiente.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border, #e5e7eb)', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.75rem' }}>Producto ID</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>Disponible</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>Reservado</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>Vendible</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.product_id}
                  style={{ borderBottom: '1px solid var(--border, #e5e7eb)' }}
                >
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>
                    #{item.product_id}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>{item.available_quantity}</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>{item.reserved_quantity}</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <span
                      className={`status-badge ${item.sellable_quantity <= 0 ? 'status-cancelled' : 'status-pending'}`}
                    >
                      {item.sellable_quantity}
                    </span>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>{item.minimum_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function AdjustmentSection() {
  const { adjust, loading, error } = useInventoryAdjustment()
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSuccess('')
    const pid = parseInt(productId, 10)
    const qty = parseInt(quantity, 10)
    if (!pid || qty === 0 || !reason.trim()) return
    try {
      const result = await adjust({ product_id: pid, quantity_delta: qty, reason: reason.trim() })
      setSuccess(
        `Ajuste registrado. Stock vendible actualizado a ${result.sellable_quantity} unidades.`,
      )
      setProductId('')
      setQuantity('')
      setReason('')
    } catch {
      // error shown via hook
    }
  }

  return (
    <section>
      <h2 style={{ marginBottom: '1rem' }}>Registrar ajuste de stock</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'grid', gap: '1rem', maxWidth: '480px' }}
      >
        <div>
          <label htmlFor="inv-product-id" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
            ID de producto
          </label>
          <input
            id="inv-product-id"
            type="number"
            min="1"
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Ej: 1"
          />
        </div>
        <div>
          <label htmlFor="inv-quantity" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
            Cantidad (positivo = entrada, negativo = salida)
          </label>
          <input
            id="inv-quantity"
            type="number"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Ej: 10 o -3"
          />
        </div>
        <div>
          <label htmlFor="inv-reason" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
            Motivo
          </label>
          <input
            id="inv-reason"
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Recepción de mercancía"
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-success" role="status">
            {success}
          </p>
        )}
        <button className="button" type="submit" disabled={loading} style={{ width: 'fit-content' }}>
          {loading ? <LoadingSpinner /> : null}
          {loading ? 'Registrando…' : 'Registrar ajuste'}
        </button>
      </form>
    </section>
  )
}
