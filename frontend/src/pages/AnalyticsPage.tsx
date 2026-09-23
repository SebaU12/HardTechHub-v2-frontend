import type { ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useAnalytics } from '../hooks'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { LoadingSpinner } from '../components/common/States'
import { formatPrice } from '../utils/formatPrice'
import type { AnalyticsMetadata } from '../types/type'

interface QueryState {
  loading: boolean
  error: string | null
  refetch: () => void
}

function formatCount(value: number | undefined): string {
  return new Intl.NumberFormat('es-PE').format(value ?? 0)
}

function formatPercent(value: number | null | undefined): string {
  return value == null ? '0 %' : `${value.toFixed(1)} %`
}

function QueryMetadata({ data }: { data?: AnalyticsMetadata }) {
  if (!data) return null
  return (
    <footer className="analytics-metadata">
      <span><Database size={12} /> {data.backend}</span>
      {data.duration_ms != null && <span>{formatCount(data.duration_ms)} ms</span>}
      {data.query_execution_id && (
        <span title={data.query_execution_id}>
          Query {data.query_execution_id.slice(0, 8)}…
        </span>
      )}
    </footer>
  )
}

function AnalyticsPanel({
  title,
  eyebrow,
  query,
  metadata,
  children,
}: {
  title: string
  eyebrow: string
  query: QueryState
  metadata?: AnalyticsMetadata
  children: ReactNode
}) {
  return (
    <section className="analytics-panel">
      <header>
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={query.refetch}
          aria-label={`Recargar ${title}`}
          disabled={query.loading}
        >
          <RefreshCw size={16} className={query.loading ? 'spin' : ''} />
        </button>
      </header>
      {query.loading ? (
        <div className="analytics-panel-loading" role="status">
          <LoadingSpinner /> Consultando Athena…
        </div>
      ) : query.error ? (
        <div className="analytics-panel-error" role="alert">
          <AlertTriangle size={18} />
          <div><strong>Consulta no disponible</strong><p>{query.error}</p></div>
          <button type="button" onClick={query.refetch}><RotateCcw size={14} /> Reintentar</button>
        </div>
      ) : (
        <>
          <div className="analytics-panel-content">{children}</div>
          <QueryMetadata data={metadata} />
        </>
      )}
    </section>
  )
}

function BarRows({ rows }: { rows: Array<{ label: string; value: number }> }) {
  const maximum = Math.max(...rows.map((row) => row.value), 1)
  if (!rows.length) return <p className="analytics-empty">Sin datos para mostrar.</p>
  return (
    <div className="analytics-bars">
      {rows.map((row) => (
        <div className="analytics-bar-row" key={row.label}>
          <div><span>{row.label}</span><strong>{formatCount(row.value)}</strong></div>
          <span><i style={{ width: `${(row.value / maximum) * 100}%` }} /></span>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  const analytics = useAnalytics()
  const events = analytics.events.data
  const topProducts = analytics.topProducts.data
  const sales = analytics.salesSummary.data
  const categories = analytics.salesByCategory.data
  const conversion = analytics.productConversion.data
  const failures = analytics.failureRules.data
  const compatibility = analytics.compatibilitySummary.data
  const registrations = analytics.registrations.data
  const funnel = analytics.funnel.data
  const registeredUsers = registrations?.registrations.reduce(
    (total, row) => total + row.registered_users,
    0,
  )

  return (
    <div className="container page analytics-page">
      <Breadcrumb current="Analítica" />
      <div className="analytics-heading">
        <div className="page-heading">
          <span className="eyebrow">S3 · GLUE · ATHENA</span>
          <h1>El backend, convertido en información<span className="accent">.</span></h1>
          <p>Nueve consultas independientes sobre eventos y snapshots del data lake.</p>
        </div>
        <button className="button button-secondary" onClick={analytics.refreshAll} disabled={analytics.loading}>
          <RefreshCw size={17} className={analytics.loading ? 'spin' : ''} />
          {analytics.loading ? 'Consultando…' : 'Actualizar dashboard'}
        </button>
      </div>

      <div className="analytics-kpis">
        <article><Activity /><span>Eventos procesados</span><strong>{events ? formatCount(events.total_events) : '—'}</strong></article>
        <article><ShoppingBag /><span>Ingresos no cancelados</span><strong>{sales ? formatPrice(sales.sales_summary.gross_revenue) : '—'}</strong></article>
        <article><ShieldCheck /><span>Builds compatibles</span><strong>{compatibility ? formatPercent(compatibility.compatibility.compatible_rate_pct) : '—'}</strong></article>
        <article><Users /><span>Usuarios registrados</span><strong>{registeredUsers == null ? '—' : formatCount(registeredUsers)}</strong></article>
      </div>

      <div className="analytics-grid analytics-grid-two">
        <AnalyticsPanel title="Eventos por tipo" eyebrow="ACTIVIDAD" query={analytics.events} metadata={events}>
          <BarRows rows={Object.entries(events?.by_type ?? {}).map(([label, value]) => ({ label, value }))} />
        </AnalyticsPanel>
        <AnalyticsPanel title="Productos más vistos" eyebrow="INTERÉS" query={analytics.topProducts} metadata={topProducts}>
          <BarRows rows={(topProducts?.top_products ?? []).map((row) => ({ label: `Producto #${row.product_id}`, value: row.views }))} />
        </AnalyticsPanel>
      </div>

      <div className="analytics-grid analytics-grid-two">
        <AnalyticsPanel title="Resumen de ventas" eyebrow="PEDIDOS" query={analytics.salesSummary} metadata={sales}>
          {sales ? (
            <div className="analytics-stat-grid">
              <div><span>Órdenes</span><strong>{formatCount(sales.sales_summary.order_count)}</strong></div>
              <div><span>No canceladas</span><strong>{formatCount(sales.sales_summary.non_cancelled_orders)}</strong></div>
              <div><span>Ingresos</span><strong>{formatPrice(sales.sales_summary.gross_revenue)}</strong></div>
              <div><span>Ticket promedio</span><strong>{formatPrice(sales.sales_summary.average_order_value)}</strong></div>
            </div>
          ) : <p className="analytics-empty">Sin resumen de ventas.</p>}
        </AnalyticsPanel>
        <AnalyticsPanel title="Ventas por categoría" eyebrow="CATÁLOGO" query={analytics.salesByCategory} metadata={categories}>
          {(categories?.categories.length ?? 0) > 0 ? (
            <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Categoría</th><th>Unidades</th><th>Ventas</th></tr></thead><tbody>
              {categories!.categories.map((row) => <tr key={row.category}><td>{row.category}</td><td>{formatCount(row.units_sold)}</td><td>{formatPrice(row.sales_amount)}</td></tr>)}
            </tbody></table></div>
          ) : <p className="analytics-empty">Sin ventas por categoría.</p>}
        </AnalyticsPanel>
      </div>

      <AnalyticsPanel title="Vistas frente a ventas" eyebrow="CONVERSIÓN DE PRODUCTOS" query={analytics.productConversion} metadata={conversion}>
        {(conversion?.products.length ?? 0) > 0 ? (
          <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Vistas</th><th>Unidades</th></tr></thead><tbody>
            {conversion!.products.map((row) => <tr key={row.product_id}><td><strong>{row.name}</strong><small>#{row.product_id}</small></td><td>{row.category}</td><td>{formatCount(row.view_count)}</td><td>{formatCount(row.units_sold)}</td></tr>)}
          </tbody></table></div>
        ) : <p className="analytics-empty">No hay productos con vistas para comparar.</p>}
      </AnalyticsPanel>

      <div className="analytics-grid analytics-grid-two">
        <AnalyticsPanel title="Compatibilidad" eyebrow="CALIDAD DEL BUILD" query={analytics.compatibilitySummary} metadata={compatibility}>
          {compatibility ? (
            <div className="compatibility-analytics-summary">
              <strong>{formatPercent(compatibility.compatibility.compatible_rate_pct)}</strong>
              <div><span>{formatCount(compatibility.compatibility.compatible_builds)} compatibles</span><span>{formatCount(compatibility.compatibility.checked_builds)} comprobados</span></div>
            </div>
          ) : <p className="analytics-empty">Sin comprobaciones registradas.</p>}
        </AnalyticsPanel>
        <AnalyticsPanel title="Reglas con más fallos" eyebrow="DIAGNÓSTICO" query={analytics.failureRules} metadata={failures}>
          {(failures?.failure_rules.length ?? 0) > 0
            ? <BarRows rows={failures!.failure_rules.map((row) => ({ label: row.failed_rule, value: row.failure_count }))} />
            : <p className="analytics-empty analytics-positive"><ShieldCheck size={20} /> No hay reglas fallidas.</p>}
        </AnalyticsPanel>
      </div>

      <div className="analytics-grid analytics-grid-two">
        <AnalyticsPanel title="Registros por día" eyebrow="IDENTIDAD" query={analytics.registrations} metadata={registrations}>
          {(registrations?.registrations.length ?? 0) > 0 ? (
            <div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Fecha</th><th>Usuarios</th></tr></thead><tbody>
              {registrations!.registrations.map((row) => <tr key={row.registration_day}><td>{row.registration_day}</td><td>{formatCount(row.registered_users)}</td></tr>)}
            </tbody></table></div>
          ) : <p className="analytics-empty">No hay registros en el periodo.</p>}
        </AnalyticsPanel>
        <AnalyticsPanel title="Embudo de usuario" eyebrow="VISTA → CHECK → ORDEN" query={analytics.funnel} metadata={funnel}>
          {funnel ? (
            <div className="analytics-funnel">
              <div><span>Vieron productos</span><strong>{formatCount(funnel.funnel.users_with_view)}</strong></div>
              <TrendingUp size={16} />
              <div><span>Comprobaron</span><strong>{formatCount(funnel.funnel.users_with_compatibility_check)}</strong><small>{formatPercent(funnel.funnel.view_to_check_pct)}</small></div>
              <TrendingUp size={16} />
              <div><span>Ordenaron</span><strong>{formatCount(funnel.funnel.users_with_order)}</strong><small>{formatPercent(funnel.funnel.check_to_order_pct)}</small></div>
            </div>
          ) : <p className="analytics-empty">Sin datos para el embudo.</p>}
        </AnalyticsPanel>
      </div>

      <div className="analytics-note"><BarChart3 size={18} /><p>Los valores provienen de consultas reales ejecutadas por Analytics Service en Amazon Athena. Cada tarjeta puede recargarse de forma independiente.</p></div>
    </div>
  )
}
