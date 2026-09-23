import {
  getCompatibilityFailureRules,
  getCompatibilitySummary,
  getEventCount,
  getFunnel,
  getProductConversion,
  getSalesByCategory,
  getSalesSummary,
  getTopProducts,
  getUserRegistrations,
} from '../services/analyticsServices'
import { useQuery } from './useQuery'

export function useAnalytics() {
  const events = useQuery('analytics:events', getEventCount)
  const topProducts = useQuery('analytics:top-products', getTopProducts)
  const salesSummary = useQuery('analytics:sales-summary', getSalesSummary)
  const salesByCategory = useQuery('analytics:sales-by-category', getSalesByCategory)
  const productConversion = useQuery('analytics:product-conversion', getProductConversion)
  const failureRules = useQuery('analytics:failure-rules', getCompatibilityFailureRules)
  const compatibilitySummary = useQuery('analytics:compatibility-summary', getCompatibilitySummary)
  const registrations = useQuery('analytics:registrations', getUserRegistrations)
  const funnel = useQuery('analytics:funnel', getFunnel)
  const queries = [
    events,
    topProducts,
    salesSummary,
    salesByCategory,
    productConversion,
    failureRules,
    compatibilitySummary,
    registrations,
    funnel,
  ]

  return {
    events,
    topProducts,
    salesSummary,
    salesByCategory,
    productConversion,
    failureRules,
    compatibilitySummary,
    registrations,
    funnel,
    loading: queries.some((query) => query.loading),
    refreshAll: () => queries.forEach((query) => query.refetch()),
  }
}
