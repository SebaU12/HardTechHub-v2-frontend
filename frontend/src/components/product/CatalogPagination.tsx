import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <nav className="catalog-pagination" aria-label="Paginación del catálogo">
      <button
        type="button"
        className="button button-secondary"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
        Anterior
      </button>
      <span aria-live="polite">
        Página <strong>{currentPage}</strong> de {totalPages}
      </span>
      <button
        type="button"
        className="button button-secondary"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
