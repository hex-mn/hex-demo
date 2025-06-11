// This file defines TypeScript interfaces for store settings, products, orders, user data, and related types used throughout the application.

// Store settings and configuration options
export interface StoreSettings {
  categories: { name: string; slug: string }[]
  processes: { name: string; code: string }[]
  menu: {
    id: number
    url: string
    title: string
    children: { url: string; title: string }[]
    isParent: boolean
  }[]
  logo?: string
  facebook?: string
  youtube?: string
  instagram?: string
  tiktok?: string
  x_platform?: string
  phone_number?: string
  delivery_fee_enabled: boolean
  delivery_fee_threshold?: number
  delivery_fee?: number
  payment_system_enabled: boolean
  payment_system_url?: string
  name?: string
  checkout_note?: string
  transaction_note?:string
  transaction_note_enabled?:boolean
}

// Default placeholder for store settings
export const placeholderSettings: StoreSettings = {
  categories: [],
  processes: [],
  menu: [],
  delivery_fee_enabled: true,
  payment_system_enabled: true,
}

// Represents a single value for a product attribute
export interface AttributeValue{
  value: string
}

// Represents a product attribute with possible values
export interface Attribute {
  name: string
  values: AttributeValue[]
}

// Represents an image for a product, with multiple resolutions
export interface ProductImage{
  id: string
  low: string
  mid: string
  high: string
}

// Represents a pair of attribute name and value for a product variant
export interface AttributePair{
  attribute: string
  value: string
}

// Represents a product variant (SKU, price, inventory, images, attributes, discount)
export interface ProductVariant {
  sku: string
  price: number
  inventory?: number
  images?: ProductImage[]
  attributes?: AttributePair[]
  discount_price: number | null
}

export interface ProductResponse {
  product: Product 
  bundle: Product[]
}

// Represents a product with details, images, category, and variants
export interface Product {
  description?: string;
  name: string
  slug: string
  images?: ProductImage[]
  category_name: string
  category_slug: string
  variants?: ProductVariant[]
  max_limit?: number
  is_featured?: boolean
  is_new?: boolean
}

// Represents a short version of a product (used in variants)
export interface ProductShort {
  name : string
  slug : string
  images?: ProductImage[]
  max_limit?:number
}

// Represents a full variant with product reference
export interface VariantFull{
  sku: string
  price: number
  inventory: number
  images?: ProductImage[]
  attributes?: AttributePair[]
  discount_price: number | null
  product: ProductShort
}

// Represents a product in an order (SKU, name, price, amount, subtotal)
export interface OrderProduct {
  sku: string
  name: string
  price: number
  amount: number
  subtotal: number
}

// Represents a single history entry for an order
export interface OrderHistory {
  created_at: string
  created_by: number
  process_code: string
  note: string | null
}

// Represents an order with all details, products, and history
export interface Order {
  id: string
  name: string
  address_code: string
  address_point: string
  address_city: string
  address_district: string
  address_khoroo: string
  address_description: string
  address_identifier: string
  email: string
  phone_numbers: string
  note: string
  is_delivered: boolean
  delivered_at?: string | null
  is_paid: boolean
  paid_at?: string | null
  process_code?: string
  delivery_fee?: number
  total_price?: number
  created_at?: string
  products: OrderProduct[]
  history: OrderHistory[]
  username: string | null
}

// Represents the response for an order API call
export interface OrderResponse {
  success: boolean
  order: Order
}

// Represents a user's profile information
export interface UserProfile {
  name: string
  email: string
  is_business: boolean
  ttd: string
  consumer_no: string
  phone_numbers: string
}

// Represents a user's address
export interface UserAddress {
  id: string
  code: string
  point: string
  city: string
  district: string
  khoroo: string
  description: string
}

// Represents all user data including profile and addresses
export interface UserData {
  profile: UserProfile
  addresses: UserAddress[]
}
