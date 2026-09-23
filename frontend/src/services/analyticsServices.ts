import { analyticsApi } from '../api/axios'
import type {
  CompatibilityFailureRulesResponse,
  CompatibilitySummaryResponse,
  EventCountResponse,
  FunnelResponse,
  ProductConversionResponse,
  SalesByCategoryResponse,
  SalesSummaryResponse,
  TopProductsResponse,
  UserRegistrationsResponse,
} from '../types/type'

async function getAnalytics<T>(path: string, signal?: AbortSignal): Promise<T> {
  return (await analyticsApi.get<T>(path, { signal })).data
}

export const getEventCount = (signal?: AbortSignal) =>
  getAnalytics<EventCountResponse>('/api/analytics/events/count', signal)

export const getTopProducts = (signal?: AbortSignal) =>
  getAnalytics<TopProductsResponse>('/api/analytics/top-products', signal)

export const getSalesSummary = (signal?: AbortSignal) =>
  getAnalytics<SalesSummaryResponse>('/api/analytics/sales/summary', signal)

export const getSalesByCategory = (signal?: AbortSignal) =>
  getAnalytics<SalesByCategoryResponse>('/api/analytics/sales/by-category', signal)

export const getProductConversion = (signal?: AbortSignal) =>
  getAnalytics<ProductConversionResponse>('/api/analytics/products/conversion', signal)

export const getCompatibilityFailureRules = (signal?: AbortSignal) =>
  getAnalytics<CompatibilityFailureRulesResponse>(
    '/api/analytics/compatibility/failure-rules',
    signal,
  )

export const getCompatibilitySummary = (signal?: AbortSignal) =>
  getAnalytics<CompatibilitySummaryResponse>(
    '/api/analytics/compatibility/summary',
    signal,
  )

export const getUserRegistrations = (signal?: AbortSignal) =>
  getAnalytics<UserRegistrationsResponse>(
    '/api/analytics/users/registrations',
    signal,
  )

export const getFunnel = (signal?: AbortSignal) =>
  getAnalytics<FunnelResponse>('/api/analytics/funnel', signal)
