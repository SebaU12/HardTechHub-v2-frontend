import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories, categoryHref } from '../../data/categories'
import { AssetImage } from '../common/AssetImage'
export function CategoryGrid({ setup = false }: { setup?: boolean }) {
  const selected = setup
    ? categories.filter((item) =>
        ['CPU', 'Motherboard', 'RAM', 'GPU', 'PSU'].includes(item.value),
      )
    : categories
  return (
    <div className={`category-grid ${setup ? 'setup-grid': ''}`}>
      {selected.map((item, index) => (
        <Link
          key={item.value}
          className="category-card"
          to={categoryHref(item.value)}
        >
          {setup && <span className="setup-number">0{index + 1}</span>}
          <AssetImage
            alt={item.label}
            fallback={<item.icon aria-hidden="true" size={42} strokeWidth={1} />}
          />
          <span>{item.label}</span>
          <ArrowUpRight size={14} className="category-arrow" />
        </Link>
      ))}
    </div>
  )
}
