export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'client'
  active: boolean
  email_verified: boolean
  created_at: string
}

export interface Service {
  id: number
  name: string
  slug: string
  description: string
  base_price: number
  features: string[]
  icon: string
  order: number
  active: boolean
  supports_maintenance: boolean
}

export interface Project {
  id: number
  client_id: number
  service_id: number
  title: string
  description: string
  budget_hint: number | null
  status: string
  admin_price: number | null
  installments: number
  deposit_percentage: number | null
  maintenance_enabled: boolean
  maintenance_monthly: number | null
  accepted_at: string | null
  created_at: string
  updated_at: string
  next_due_date: string | null
  client?: User
  service?: Service
}

export interface Message {
  id: number
  project_id: number
  sender_id: number
  body: string
  created_at: string
  sender?: User
  attachments: Attachment[]
}

export interface Attachment {
  id: number
  owner_type: string
  owner_id: number
  filename: string
  mime: string
  size: number
  url: string
  uploaded_by: number
  created_at: string
}

export interface DeliveryRecord {
  id: number
  project_id: number
  note: string
  link: string | null
  created_at: string
  attachments: Attachment[]
}

export interface Payment {
  id: number
  project_id: number
  amount: number
  kind: string
  installment_number: number | null
  method: string | null
  status: string
  paid_at: string | null
  created_at: string
  receipts: Attachment[]
}

export interface FinanceEntry {
  id: number
  date: string
  description: string
  income: number | null
  expense: number | null
  created_at: string
}

export interface Notification {
  id: number
  user_id: number
  kind: string
  title: string
  body: string
  link: string | null
  read: boolean
  created_at: string
}

export interface CardCategoryItem {
  id: number
  slug: string
  name: string
  description: string
  order: number
}

export interface CardDesignItem {
  id: number
  name: string
  category_id: number
  tag: string | null
  discount_label: string | null
  demo_url: string | null
  image_url: string | null
  order: number
  active: boolean
  category?: CardCategoryItem
}

export interface PublicCardDesign {
  id: number
  name: string
  category: string
  category_name: string
  tag: string | null
  discount_label: string | null
  demo_url: string | null
  image_url: string | null
}

export interface CardCatalog {
  categories: CardCategoryItem[]
  designs: PublicCardDesign[]
}

export interface FormQuestion {
  id: number
  role: string | null
  field_type: string
  text: string
  order: number
  active: boolean
}

export interface PendingOrderImage {
  url: string
  filename: string
  mime: string
  size: number
}

export interface PendingOrderExchange {
  question: string
  answer: string
  images: PendingOrderImage[]
}

export interface PendingOrder {
  title: string
  description: string
  references: string
  design_id: number | null
  design_name: string
  source: 'custom' | 'template'
  exchanges: PendingOrderExchange[]
}

export interface AdminStats {
  total_projects: number
  active_projects: number
  total_clients: number
  monthly_income: number
  pending_payments: number
  recent_projects: Project[]
  income_by_service: { service_name: string; income: number }[]
  pending_cards: number
}

export interface MonthlyExpense {
  id: number
  service_name: string
  amount: number
  payment_date: string
  month_key: string
  created_at: string
}

export interface PortfolioItem {
  id: number
  title: string
  category: string
  site_url: string
  image_url: string | null
  order: number
  active: boolean
  created_at: string
  updated_at: string
}
