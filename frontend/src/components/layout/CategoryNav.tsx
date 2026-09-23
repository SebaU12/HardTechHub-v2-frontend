import { ArrowUpRight, BarChart3, Grid2X2, ShieldCheck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories, categoryHref } from '../../data/categories'
export function CategoryNav() {
  return (
    <nav className="category-nav" aria-label="Categorías principales">
      <div className="container category-nav-inner">
        <Link className="all-categories" to="/productos">
          <Grid2X2 size={16} />
          Todas las categorías
        </Link>
        {categories.map((item) => (
            <Link key={item.value} to={categoryHref(item.value)}>
              {item.value === 'RAM' ? 'RAM' : item.label}
            </Link>
          ))}
        <Link className="compatibility-link" to="/compatibilidad">
          <ShieldCheck size={14} />
          Compatibilidad
        </Link>
        <Link className="analytics-link" to="/analitica">
          <BarChart3 size={14} />
          Analítica
        </Link>
        <Link className="offers-link" to="/productos?sort=price-asc">
          <Zap size={14} />
          Explora precios
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </nav>
  )
}
