import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { useProducts } from '../hooks'
import { filterProducts, paginateProducts } from '../utils/catalog'
import { categoryInfo } from '../data/categories'
import { ProductGrid } from '../components/product/ProductGrid'
import { ProductFilters } from '../components/product/ProductFilters'
import { CatalogPagination } from '../components/product/CatalogPagination'
import { ErrorState, EmptyState } from '../components/common/States'
import { Breadcrumb } from '../components/common/Breadcrumb'

const CATALOG_PAGE_SIZE = 24

export function CatalogPage() {
  const { products, loading, error, refetch } = useProducts()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtered = useMemo(
    () => filterProducts(products, params),
    [products, params],
  )
  const requestedPage = Number(params.get('page'))
  const totalPages = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE))
  const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, totalPages)
    : 1
  const visibleProducts = paginateProducts(filtered, currentPage, CATALOG_PAGE_SIZE)
  const firstVisible = filtered.length
    ? (currentPage - 1) * CATALOG_PAGE_SIZE + 1
    : 0
  const lastVisible = Math.min(currentPage * CATALOG_PAGE_SIZE, filtered.length)
  const query = params.get('q')
  const title = query
    ? `Resultados para “${query}”`
    : categoryInfo(params.get('category') || '')?.label ||
      'Todo para tu próximo upgrade'
  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  function changePage(page: number) {
    const next = new URLSearchParams(params)
    if (page <= 1) next.delete('page')
    else next.set('page', String(page))
    setParams(next, { replace: true })
  }
  return (
    <div className="container page">
      <Breadcrumb current="Productos" />
      <div className="page-heading">
        <span className="eyebrow">ELIGE. COMBINA. CONSTRUYE.</span>
        <h1>{title}</h1>
        <p>Encuentra el componente que hace la diferencia.</p>
      </div>
      <div className="catalog-layout">
        <aside className={`filters ${filtersOpen ? 'filters-open' : ''}`}>
          <button
            className="filter-close icon-button"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
          >
            <X />
          </button>
          <ProductFilters
            products={products}
            params={params}
            update={update}
            reset={() => setParams({})}
          />
        </aside>
        <div className="catalog-results">
          <div className="catalog-toolbar">
            <span>
              <strong>{loading ? '—' : filtered.length}</strong> productos
              {!loading && filtered.length > 0 && (
                <small> · mostrando {firstVisible}–{lastVisible}</small>
              )}
            </span>
            <button
              className="button button-secondary filter-toggle"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={16} />
              Filtros
            </button>
            <label className="sort-control">
              Ordenar por
              <select
                value={params.get('sort') || ''}
                onChange={(event) => update('sort', event.target.value)}
              >
                <option value="">Más relevantes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name">Nombre A–Z</option>
              </select>
            </label>
          </div>
          {Array.from(params.entries()).filter(([key]) => !['sort', 'page'].includes(key))
            .length > 0 && (
            <div className="active-filters">
              {Array.from(params.entries())
                .filter(([key]) => !['sort', 'page'].includes(key))
                .map(([key, value]) => (
                  <button key={key} onClick={() => update(key, '')}>
                    {key === 'minPrice'
                      ? 'Desde S/ '
                      : key === 'maxPrice'
                        ? 'Hasta S/ '
                        : ''}
                    {categoryInfo(value)?.label || value}
                    <X size={12} />
                    <span className="sr-only">Quitar filtro</span>
                  </button>
                ))}
            </div>
          )}
          {error ? (
            <ErrorState message={error} retry={refetch} />
          ) : !loading && !filtered.length ? (
            <EmptyState
              title="No encontramos esa combinación"
              message="Prueba con otra categoría, marca o rango de precio."
              href="/productos"
              action="Ver todos los productos"
            />
          ) : (
            <>
              <ProductGrid products={visibleProducts} loading={loading} compact />
              {!loading && filtered.length > 0 && (
                <CatalogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={changePage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
