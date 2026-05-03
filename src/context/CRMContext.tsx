'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Contact, CustomColumn, Category, Project } from '@/types'

const SAMPLE_CONTACTS: Contact[] = [
  { id: '1', name: 'Sarah Chen',     organization: 'Sequoia Capital', phone: '+1 (415) 555-0193', email: 'sarah.chen@sequoia.com',      type: 'LP',          categories: ['Venture', 'Tier 1'] },
  { id: '2', name: 'Marcus Johnson', organization: 'Blackstone',      phone: '+1 (212) 555-0102', email: 'm.johnson@blackstone.com',    type: 'GP',          categories: ['PE', 'Tier 1'] },
  { id: '3', name: 'Priya Patel',    organization: 'CPPIB',           phone: '+1 (416) 555-0178', email: 'priya.patel@cppib.com',       type: 'LP',          categories: ['Pension Fund'] },
  { id: '4', name: 'David Kim',      organization: 'a16z',            phone: '+1 (650) 555-0134', email: 'd.kim@a16z.com',              type: 'LP',          categories: ['Venture'] },
  { id: '5', name: 'Lisa Thompson',  organization: 'Hamilton Lane',   phone: '+1 (610) 555-0156', email: 'l.thompson@hamiltonlane.com', type: 'Co-investor', categories: ['FoF'] },
]

const SAMPLE_PROJECTS: Project[] = [
  { id: '1', name: 'PT30 II',      type: 'fund',    description: 'Second fund vehicle targeting private equity.',    status: 'active' },
  { id: '2', name: 'GP Raise Q3',  type: 'mandate', description: 'General partner capital raise mandate for Q3.',  status: 'pipeline' },
]

const SAMPLE_CATEGORIES: Category[] = [
  { id: '1', name: 'LP',           color: 'blue',    description: 'Limited partners',         contactCount: 3 },
  { id: '2', name: 'GP',           color: 'purple',  description: 'General partners',         contactCount: 1 },
  { id: '3', name: 'Tier 1',       color: 'emerald', description: 'Top-tier relationships',   contactCount: 2 },
  { id: '4', name: 'Venture',      color: 'amber',   description: 'Venture capital contacts', contactCount: 2 },
  { id: '5', name: 'PE',           color: 'rose',    description: 'Private equity contacts',  contactCount: 1 },
  { id: '6', name: 'Pension Fund', color: 'cyan',    description: 'Pension fund allocators',  contactCount: 1 },
  { id: '7', name: 'FoF',          color: 'indigo',  description: 'Fund of funds',            contactCount: 1 },
  { id: '8', name: 'Co-investor',  color: 'pink',    description: 'Co-investment partners',   contactCount: 1 },
]

interface CRMState {
  contacts: Contact[]
  archivedContacts: Contact[]
  projects: Project[]
  archivedProjects: Project[]
  categories: Category[]
  archivedCategories: Category[]
  customColumns: CustomColumn[]

  addContact: (c: Omit<Contact, 'id'>) => void
  updateContact: (c: Contact) => void
  deleteContact: (id: string) => void
  archiveContact: (id: string) => void
  restoreContact: (id: string) => void
  permanentDeleteContact: (id: string) => void

  addProject: (p: Omit<Project, 'id'>) => void
  deleteProject: (id: string) => void
  archiveProject: (id: string) => void
  restoreProject: (id: string) => void
  permanentDeleteProject: (id: string) => void

  addCategory: (c: Omit<Category, 'id' | 'contactCount'>) => void
  deleteCategory: (id: string) => void
  archiveCategory: (id: string) => void
  restoreCategory: (id: string) => void
  permanentDeleteCategory: (id: string) => void

  addCustomColumn: (label: string) => void
}

const CRMContext = createContext<CRMState | null>(null)

export function CRMProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts]                     = useState<Contact[]>(SAMPLE_CONTACTS)
  const [archivedContacts, setArchivedContacts]     = useState<Contact[]>([])
  const [projects, setProjects]                     = useState<Project[]>(SAMPLE_PROJECTS)
  const [archivedProjects, setArchivedProjects]     = useState<Project[]>([])
  const [categories, setCategories]                 = useState<Category[]>(SAMPLE_CATEGORIES)
  const [archivedCategories, setArchivedCategories] = useState<Category[]>([])
  const [customColumns, setCustomColumns]           = useState<CustomColumn[]>([])

  // ── Contacts ──
  const addContact = (c: Omit<Contact, 'id'>) =>
    setContacts(prev => [...prev, { ...c, id: Date.now().toString() }])
  const updateContact = (c: Contact) =>
    setContacts(prev => prev.map(x => x.id === c.id ? c : x))
  const deleteContact = (id: string) =>
    setContacts(prev => prev.filter(c => c.id !== id))
  const archiveContact = (id: string) => {
    const item = contacts.find(c => c.id === id)
    if (!item) return
    setContacts(prev => prev.filter(c => c.id !== id))
    setArchivedContacts(prev => [...prev, item])
  }
  const restoreContact = (id: string) => {
    const item = archivedContacts.find(c => c.id === id)
    if (!item) return
    setArchivedContacts(prev => prev.filter(c => c.id !== id))
    setContacts(prev => [...prev, item])
  }
  const permanentDeleteContact = (id: string) =>
    setArchivedContacts(prev => prev.filter(c => c.id !== id))

  // ── Projects ──
  const addProject = (p: Omit<Project, 'id'>) =>
    setProjects(prev => [...prev, { ...p, id: Date.now().toString() }])
  const deleteProject = (id: string) =>
    setProjects(prev => prev.filter(p => p.id !== id))
  const archiveProject = (id: string) => {
    const item = projects.find(p => p.id === id)
    if (!item) return
    setProjects(prev => prev.filter(p => p.id !== id))
    setArchivedProjects(prev => [...prev, item])
  }
  const restoreProject = (id: string) => {
    const item = archivedProjects.find(p => p.id === id)
    if (!item) return
    setArchivedProjects(prev => prev.filter(p => p.id !== id))
    setProjects(prev => [...prev, item])
  }
  const permanentDeleteProject = (id: string) =>
    setArchivedProjects(prev => prev.filter(p => p.id !== id))

  // ── Categories ──
  const addCategory = (c: Omit<Category, 'id' | 'contactCount'>) =>
    setCategories(prev => [...prev, { ...c, id: Date.now().toString(), contactCount: 0 }])
  const deleteCategory = (id: string) =>
    setCategories(prev => prev.filter(c => c.id !== id))
  const archiveCategory = (id: string) => {
    const item = categories.find(c => c.id === id)
    if (!item) return
    setCategories(prev => prev.filter(c => c.id !== id))
    setArchivedCategories(prev => [...prev, item])
  }
  const restoreCategory = (id: string) => {
    const item = archivedCategories.find(c => c.id === id)
    if (!item) return
    setArchivedCategories(prev => prev.filter(c => c.id !== id))
    setCategories(prev => [...prev, item])
  }
  const permanentDeleteCategory = (id: string) =>
    setArchivedCategories(prev => prev.filter(c => c.id !== id))

  const addCustomColumn = (label: string) => {
    const key = label.toLowerCase().replace(/\s+/g, '_')
    setCustomColumns(prev => [...prev, { id: Date.now().toString(), label, key }])
  }

  return (
    <CRMContext.Provider value={{
      contacts, archivedContacts,
      projects, archivedProjects,
      categories, archivedCategories,
      customColumns,
      addContact, updateContact, deleteContact, archiveContact, restoreContact, permanentDeleteContact,
      addProject, deleteProject, archiveProject, restoreProject, permanentDeleteProject,
      addCategory, deleteCategory, archiveCategory, restoreCategory, permanentDeleteCategory,
      addCustomColumn,
    }}>
      {children}
    </CRMContext.Provider>
  )
}

export function useCRM() {
  const ctx = useContext(CRMContext)
  if (!ctx) throw new Error('useCRM must be used within CRMProvider')
  return ctx
}
