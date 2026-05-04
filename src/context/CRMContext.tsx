'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Contact, CustomColumn, Category, Project, ImportLog } from '@/types'
import { supabase } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

function dbToContact(r: Row): Contact {
  return {
    id:           r.id,
    name:         r.name,
    organization: r.organization ?? '',
    phone:        r.phone ?? '',
    email:        r.email ?? '',
    type:         r.type ?? '',
    categories:   r.categories ?? [],
    customFields: r.custom_fields ?? {},
  }
}

function dbToProject(r: Row): Project {
  return {
    id:          r.id,
    name:        r.name,
    type:        r.type ?? 'fund',
    description: r.description ?? '',
    status:      r.status ?? 'pipeline',
  }
}

function dbToCategory(r: Row, contactCount = 0): Category {
  return {
    id:           r.id,
    name:         r.name,
    color:        r.color ?? 'indigo',
    description:  r.description ?? '',
    contactCount,
  }
}

interface CRMState {
  loading: boolean
  contacts: Contact[]
  archivedContacts: Contact[]
  projects: Project[]
  archivedProjects: Project[]
  categories: Category[]
  archivedCategories: Category[]
  customColumns: CustomColumn[]

  addContact:             (c: Omit<Contact, 'id'>) => void
  updateContact:          (c: Contact) => void
  deleteContact:          (id: string) => void
  archiveContact:         (id: string) => void
  restoreContact:         (id: string) => void
  permanentDeleteContact: (id: string) => void

  addProject:             (p: Omit<Project, 'id'>) => void
  deleteProject:          (id: string) => void
  archiveProject:         (id: string) => void
  restoreProject:         (id: string) => void
  permanentDeleteProject: (id: string) => void

  addCategory:             (c: Omit<Category, 'id' | 'contactCount'>) => void
  deleteCategory:          (id: string) => void
  archiveCategory:         (id: string) => void
  restoreCategory:         (id: string) => void
  permanentDeleteCategory: (id: string) => void

  addCustomColumn: (label: string) => void

  importLogs: ImportLog[]
  bulkAddContacts: (contacts: Omit<Contact, 'id'>[], filename: string) => void
}

const CRMContext = createContext<CRMState | null>(null)

export function CRMProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading]                           = useState(true)
  const [contacts, setContacts]                         = useState<Contact[]>([])
  const [archivedContacts, setArchivedContacts]         = useState<Contact[]>([])
  const [projects, setProjects]                         = useState<Project[]>([])
  const [archivedProjects, setArchivedProjects]         = useState<Project[]>([])
  const [categories, setCategories]                     = useState<Category[]>([])
  const [archivedCategories, setArchivedCategories]     = useState<Category[]>([])
  const [customColumns, setCustomColumns]               = useState<CustomColumn[]>([])
  const [importLogs, setImportLogs]                     = useState<ImportLog[]>([])

  function withCounts(catRows: Row[], activeContacts: Contact[]): Category[] {
    return catRows.map(r => dbToCategory(r, activeContacts.filter(c => c.categories.includes(r.name)).length))
  }

  useEffect(() => {
    async function load() {
      const [
        { data: cRows },
        { data: pRows },
        { data: catRows },
        { data: colRows },
        { data: logRows },
      ] = await Promise.all([
        supabase.from('contacts').select('*').order('created_at'),
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('categories').select('*').order('created_at'),
        supabase.from('custom_columns').select('*').order('created_at'),
        supabase.from('import_logs').select('*').order('created_at', { ascending: false }).limit(20),
      ])

      const activeC   = (cRows ?? []).filter(r => !r.archived).map(dbToContact)
      const archivedC = (cRows ?? []).filter(r =>  r.archived).map(dbToContact)
      const activeP   = (pRows ?? []).filter(r => !r.archived).map(dbToProject)
      const archivedP = (pRows ?? []).filter(r =>  r.archived).map(dbToProject)
      const activeCat   = (catRows ?? []).filter(r => !r.archived)
      const archivedCat = (catRows ?? []).filter(r =>  r.archived)

      setContacts(activeC)
      setArchivedContacts(archivedC)
      setProjects(activeP)
      setArchivedProjects(archivedP)
      setCategories(withCounts(activeCat, activeC))
      setArchivedCategories(archivedCat.map(r => dbToCategory(r, 0)))
      setCustomColumns((colRows ?? []).map(r => ({ id: r.id, label: r.label, key: r.key })))
      setImportLogs((logRows ?? []).map(r => ({ id: r.id, filename: r.filename, rowCount: r.row_count, createdAt: r.created_at })))
      setLoading(false)
    }
    load()
  }, [])

  // ── Contacts ──────────────────────────────────────────────────────────────

  const addContact = (c: Omit<Contact, 'id'>) => {
    supabase.from('contacts').insert({
      name: c.name, organization: c.organization, phone: c.phone,
      email: c.email, type: c.type, categories: c.categories,
      custom_fields: c.customFields ?? {},
    }).select().single().then(({ data }) => {
      if (data) setContacts(prev => [...prev, dbToContact(data)])
    })
  }

  const updateContact = (c: Contact) => {
    supabase.from('contacts').update({
      name: c.name, organization: c.organization, phone: c.phone,
      email: c.email, type: c.type, categories: c.categories,
      custom_fields: c.customFields ?? {},
    }).eq('id', c.id).then(() => {
      setContacts(prev => prev.map(x => x.id === c.id ? c : x))
    })
  }

  const deleteContact = (id: string) => {
    supabase.from('contacts').delete().eq('id', id).then(() => {
      setContacts(prev => prev.filter(c => c.id !== id))
    })
  }

  const archiveContact = (id: string) => {
    const item = contacts.find(c => c.id === id)
    if (!item) return
    supabase.from('contacts').update({ archived: true }).eq('id', id).then(() => {
      setContacts(prev => prev.filter(c => c.id !== id))
      setArchivedContacts(prev => [...prev, item])
    })
  }

  const restoreContact = (id: string) => {
    const item = archivedContacts.find(c => c.id === id)
    if (!item) return
    supabase.from('contacts').update({ archived: false }).eq('id', id).then(() => {
      setArchivedContacts(prev => prev.filter(c => c.id !== id))
      setContacts(prev => [...prev, item])
    })
  }

  const permanentDeleteContact = (id: string) => {
    supabase.from('contacts').delete().eq('id', id).then(() => {
      setArchivedContacts(prev => prev.filter(c => c.id !== id))
    })
  }

  // ── Projects ──────────────────────────────────────────────────────────────

  const addProject = (p: Omit<Project, 'id'>) => {
    supabase.from('projects').insert({
      name: p.name, type: p.type, description: p.description, status: p.status,
    }).select().single().then(({ data }) => {
      if (data) setProjects(prev => [...prev, dbToProject(data)])
    })
  }

  const deleteProject = (id: string) => {
    supabase.from('projects').delete().eq('id', id).then(() => {
      setProjects(prev => prev.filter(p => p.id !== id))
    })
  }

  const archiveProject = (id: string) => {
    const item = projects.find(p => p.id === id)
    if (!item) return
    supabase.from('projects').update({ archived: true }).eq('id', id).then(() => {
      setProjects(prev => prev.filter(p => p.id !== id))
      setArchivedProjects(prev => [...prev, item])
    })
  }

  const restoreProject = (id: string) => {
    const item = archivedProjects.find(p => p.id === id)
    if (!item) return
    supabase.from('projects').update({ archived: false }).eq('id', id).then(() => {
      setArchivedProjects(prev => prev.filter(p => p.id !== id))
      setProjects(prev => [...prev, item])
    })
  }

  const permanentDeleteProject = (id: string) => {
    supabase.from('projects').delete().eq('id', id).then(() => {
      setArchivedProjects(prev => prev.filter(p => p.id !== id))
    })
  }

  // ── Categories ────────────────────────────────────────────────────────────

  const addCategory = (c: Omit<Category, 'id' | 'contactCount'>) => {
    supabase.from('categories').insert({
      name: c.name, color: c.color, description: c.description,
    }).select().single().then(({ data }) => {
      if (data) setCategories(prev => [...prev, dbToCategory(data, 0)])
    })
  }

  const deleteCategory = (id: string) => {
    supabase.from('categories').delete().eq('id', id).then(() => {
      setCategories(prev => prev.filter(c => c.id !== id))
    })
  }

  const archiveCategory = (id: string) => {
    const item = categories.find(c => c.id === id)
    if (!item) return
    supabase.from('categories').update({ archived: true }).eq('id', id).then(() => {
      setCategories(prev => prev.filter(c => c.id !== id))
      setArchivedCategories(prev => [...prev, item])
    })
  }

  const restoreCategory = (id: string) => {
    const item = archivedCategories.find(c => c.id === id)
    if (!item) return
    supabase.from('categories').update({ archived: false }).eq('id', id).then(() => {
      setArchivedCategories(prev => prev.filter(c => c.id !== id))
      setCategories(prev => [...prev, item])
    })
  }

  const permanentDeleteCategory = (id: string) => {
    supabase.from('categories').delete().eq('id', id).then(() => {
      setArchivedCategories(prev => prev.filter(c => c.id !== id))
    })
  }

  const bulkAddContacts = (newContacts: Omit<Contact, 'id'>[], filename: string) => {
    const rows = newContacts.map(c => ({
      name: c.name, organization: c.organization, phone: c.phone,
      email: c.email, type: c.type, categories: c.categories,
      custom_fields: c.customFields ?? {},
    }))
    supabase.from('contacts').insert(rows).select().then(({ data }) => {
      if (data) setContacts(prev => [...prev, ...data.map(dbToContact)])
      supabase.from('import_logs')
        .insert({ filename, row_count: newContacts.length })
        .select().single()
        .then(({ data: log }) => {
          if (log) setImportLogs(prev => [{ id: log.id, filename: log.filename, rowCount: log.row_count, createdAt: log.created_at }, ...prev])
        })
    })
  }

  const addCustomColumn = (label: string) => {
    const key = label.toLowerCase().replace(/\s+/g, '_')
    supabase.from('custom_columns').insert({ label, key }).select().single().then(({ data }) => {
      if (data) setCustomColumns(prev => [...prev, { id: data.id, label: data.label, key: data.key }])
    })
  }

  return (
    <CRMContext.Provider value={{
      loading,
      contacts, archivedContacts,
      projects, archivedProjects,
      categories, archivedCategories,
      customColumns,
      addContact, updateContact, deleteContact, archiveContact, restoreContact, permanentDeleteContact,
      addProject, deleteProject, archiveProject, restoreProject, permanentDeleteProject,
      addCategory, deleteCategory, archiveCategory, restoreCategory, permanentDeleteCategory,
      addCustomColumn,
      importLogs, bulkAddContacts,
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
