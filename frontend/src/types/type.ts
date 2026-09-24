export interface EventPublication {
  event_published: boolean
  event_key: string | null
}

export interface AuthRequest {
  email: string
  password: string
}

export interface RegisterResponse extends EventPublication {
  message: string
  user_id: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserProfile {
  user_id: string
  email: string
  roles: string[]
  preferences: Record<string, unknown>
  created_at: string | null
}

export interface Product {
  id: number
  sku: string
  name: string
  description: string | null
  price: string
  specs: Record<string, unknown>
  image_url: string | null
  category: string
  brand: string
}

export interface ProductDetail extends Product {
  is_active: boolean
  created_at: string
}

export interface CreateProductRequest {
  category_id: number
  brand_id: number
  sku: string
  name: string
  price: number
  description?: string
  specs: Record<string, unknown>
  image_url?: string
}

export interface CreateProductResponse extends EventPublication {
  id: number
  sku: string
  name: string
  price: string
}

// PUT reemplaza todos estos campos; no se debe enviar un objeto parcial.
export interface UpdateProductRequest {
  name: string
  description: string
  price: number
  specs: Record<string, unknown>
  image_url: string
  is_active: boolean
}

export interface UpdateProductResponse {
  updated: boolean
  event_published: boolean
  event_keys: string[]
}

export interface DeleteProductResponse extends EventPublication {
  deleted: boolean
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED'
export type InventoryOrderStatus =
  | 'RESERVED'
  | 'CONFIRMED'
  | 'CONFIRMATION_PENDING'
  | 'RELEASED'
  | 'CANCELLED'

// FastAPI puede serializar Decimal como número en lecturas de MySQL; las
// respuestas de creación y Athena conservan explícitamente strings decimales.
export type Money = string | number

export interface OrderItemRequest {
  product_id: number
  quantity: number
}

export interface CreateOrderRequest {
  user_id: string
  items: OrderItemRequest[]
}

export interface CreateOrderResponse extends EventPublication {
  order_id: number
  status: OrderStatus
  total_amount: string
  inventory_reservation_id: string
  inventory_status: InventoryOrderStatus
}

export interface Order {
  id: number
  user_id: string
  status: OrderStatus
  subtotal: Money
  tax: Money
  shipping_cost: Money
  total_amount: Money
  inventory_reservation_id?: string | null
  inventory_status?: InventoryOrderStatus | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_sku: string
  product_name: string
  quantity: number
  unit_price: Money
  subtotal: Money
}

export interface OrderDetail {
  order: Order
  items: OrderItem[]
}

export interface UpdateOrderStatusResponse extends EventPublication {
  order_id: number
  status: OrderStatus
  inventory_status: InventoryOrderStatus | null
}

export type ComponentType = 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'psu'

export interface CompatibilityComponentRequest {
  type: ComponentType
  product_id: number
}

export interface CompatibilityRequest {
  components: CompatibilityComponentRequest[]
  user_id?: string | null
  session_id?: string | null
}

export type CompatibilityRule = 'CPU_SOCKET' | 'RAM_TYPE' | 'PSU_POWER'
export type CompatibilityStatus = 'PASS' | 'FAIL'

export interface CompatibilityCheck {
  rule: CompatibilityRule
  status: CompatibilityStatus
  details: Record<string, unknown>
}

export interface CompatibilityResponse extends EventPublication {
  compatible: boolean
  checks: CompatibilityCheck[]
}

export interface AnalyticsMetadata {
  backend: 'athena' | 's3'
  query_execution_id?: string
  duration_ms?: number
}

export interface EventCountResponse extends AnalyticsMetadata {
  total_events: number
  by_type: Record<string, number>
  prefix?: string
}

export interface TopProductMetric {
  product_id: number
  views: number
}

export interface TopProductsResponse extends AnalyticsMetadata {
  top_products: TopProductMetric[]
}

export interface SalesSummary {
  order_count: number
  non_cancelled_orders: number
  gross_revenue: string
  average_order_value: string
}

export interface SalesSummaryResponse extends AnalyticsMetadata {
  sales_summary: SalesSummary
}

export interface CategorySales {
  category: string
  units_sold: number
  sales_amount: string
}

export interface SalesByCategoryResponse extends AnalyticsMetadata {
  categories: CategorySales[]
}

export interface ProductConversion {
  product_id: number
  name: string
  category: string
  view_count: number
  units_sold: number
}

export interface ProductConversionResponse extends AnalyticsMetadata {
  products: ProductConversion[]
}

export interface CompatibilityFailureRule {
  failed_rule: CompatibilityRule
  failure_count: number
}

export interface CompatibilityFailureRulesResponse extends AnalyticsMetadata {
  failure_rules: CompatibilityFailureRule[]
}

export interface CompatibilitySummary {
  checked_builds: number
  compatible_builds: number
  compatible_rate_pct: number | null
}

export interface CompatibilitySummaryResponse extends AnalyticsMetadata {
  compatibility: CompatibilitySummary
}

export interface UserRegistrationMetric {
  registration_day: string
  registered_users: number
}

export interface UserRegistrationsResponse extends AnalyticsMetadata {
  registrations: UserRegistrationMetric[]
}

export interface FunnelMetric {
  users_with_view: number
  users_with_compatibility_check: number
  users_with_order: number
  view_to_check_pct: number | null
  check_to_order_pct: number | null
}

export interface FunnelResponse extends AnalyticsMetadata {
  funnel: FunnelMetric
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface InventoryStock {
  product_id: number
  available_quantity: number
  reserved_quantity: number
  sellable_quantity: number
  minimum_quantity: number
  low_stock: boolean
  updated_at: string
  event_published?: boolean | null
  event_key?: string | null
  event_keys?: string[] | null
}

export interface LowStockResponse {
  items: InventoryStock[]
  limit: number
  offset: number
}

export interface AdjustStockRequest {
  product_id: number
  quantity_delta: number
  minimum_quantity?: number
  reason: string
}

export type AdjustStockResponse = InventoryStock
