export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'client'
  active: boolean
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

export interface AdminStats {
  total_projects: number
  active_projects: number
  total_clients: number
  monthly_income: number
  pending_payments: number
  recent_projects: Project[]
  income_by_service: { service_name: string; income: number }[]
}
