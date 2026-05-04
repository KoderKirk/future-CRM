export interface Contact {
  id: string
  name: string
  organization: string
  phone: string
  email: string
  type: string
  categories: string[]
  customFields?: Record<string, string>
}

export interface CustomColumn {
  id: string
  label: string
  key: string
}

export interface Category {
  id: string
  name: string
  color: string
  description: string
  contactCount: number
}

export interface Project {
  id: string
  name: string
  type: 'fund' | 'mandate' | 'other'
  description: string
  status: 'active' | 'pipeline' | 'closed'
}

export interface ImportLog {
  id: string
  filename: string
  rowCount: number
  createdAt: string
}

export interface ProjectContact {
  projectId: string
  contactId: string
  createdAt: string
}
