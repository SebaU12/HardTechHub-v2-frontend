import { Minus, Plus } from 'lucide-react'
export function QuantitySelector({
  value,
  onChange,
  label = 'Cantidad',
  disabled = false,
  max = 999,
}: {
  value: number
  onChange: (value: number) => void
  label?: string
  disabled?: boolean
  max?: number
}) {
  return (
    <div className="quantity-selector" role="group" aria-label={label}>
      <button
        aria-label={`Reducir ${label}`}
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={15} />
      </button>
      <output aria-live="polite">{value}</output>
      <button
        aria-label={`Aumentar ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={15} />
      </button>
    </div>
  )
}
