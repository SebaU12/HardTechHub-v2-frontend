import type { Product } from '../types/type'
export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}
export function matchesSearch(product: Product, query: string): boolean {
  return normalize([product.name, product.brand, product.category, product.sku].join(' ')).includes(normalize(query))
}
export function getSearchSuggestions(products: Product[], query: string, limit = 5): Product[] {
  if (!query.trim() || limit <= 0) return []
  const suggestions: Product[] = []
  for (const product of products) {
    if (matchesSearch(product, query)) suggestions.push(product)
    if (suggestions.length === limit) break
  }
  return suggestions
}
export function filterProducts(products: Product[], params: URLSearchParams): Product[] {
  const category = params.get('category') || ''
  const brand = params.get('brand') || ''
  const min = params.get('minPrice') || ''
  const max = params.get('maxPrice') || ''
  const result = products.filter(product => matchesSearch(product, params.get('q') || '') &&
    (!category || normalize(product.category) === normalize(category)) &&
    (!brand || normalize(product.brand) === normalize(brand)) &&
    (!min || Number(product.price) >= Number(min)) && (!max || Number(product.price) <= Number(max)))
  switch (params.get('sort')) {
    case 'price-asc': return result.sort((a, b) => Number(a.price) - Number(b.price))
    case 'price-desc': return result.sort((a, b) => Number(b.price) - Number(a.price))
    case 'name': return result.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    default: return result
  }
}
export function paginateProducts(products: Product[], page: number, pageSize: number): Product[] {
  if (pageSize <= 0) return []
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1
  const offset = (safePage - 1) * pageSize
  return products.slice(offset, offset + pageSize)
}
export function specValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(specValue).join(', ')
  if (value && typeof value === 'object') return JSON.stringify(value)
  return '—'
}
export function formatDate(value: string | null): string {
  if (!value) return 'No disponible'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No disponible' : new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(date)
}
