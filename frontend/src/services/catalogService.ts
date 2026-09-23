import { catalogApi } from '../api/axios'
import type {
  CreateProductRequest,
  CreateProductResponse,
  DeleteProductResponse,
  Product,
  ProductDetail,
  UpdateProductRequest,
  UpdateProductResponse,
} from '../types/type'

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  return (await catalogApi.get<Product[]>('/api/products', { signal })).data
}
export async function getProduct(id: number, signal?: AbortSignal): Promise<ProductDetail> {
  return (await catalogApi.get<ProductDetail>(`/api/products/${id}`, { signal })).data
}
export async function createProduct(payload: CreateProductRequest): Promise<CreateProductResponse> {
  return (await catalogApi.post<CreateProductResponse>('/api/products', payload)).data
}
export async function updateProduct(id: number, payload: UpdateProductRequest): Promise<UpdateProductResponse> {
  return (await catalogApi.put<UpdateProductResponse>(`/api/products/${id}`, payload)).data
}
export async function deleteProduct(id: number): Promise<DeleteProductResponse> {
  return (await catalogApi.delete<DeleteProductResponse>(`/api/products/${id}`)).data
}
