'use client'

import { useState } from 'react'
import { RotateCcw, Trash2, Briefcase } from 'lucide-react'
import { useCRM } from '@/context/CRMContext'

type Tab = 'contacts' | 'projects' | 'categories'

const CATEGORY_COLORS: Record<string, string> = {
  'LP':           'bg-blue-900/40 text-blue-300',
  'GP':           'bg-purple-900/40 text-purple-300',
  'Tier 1':       'bg-emerald-900/40 text-emerald-300',
  'Venture':      'bg-amber-900/40 text-amber-300',
  'PE':           'bg-rose-900/40 text-rose-300',
  'Pension Fund': 'bg-cyan-900/40 text-cyan-300',
  'FoF':          'bg-indigo-900/40 text-indigo-300',
  'Co-investor':  'bg-pink-900/40 text-pink-300',
}
function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? 'bg-zinc-800 text-zinc-300'
}

const COLOR_OPTIONS = [
  { value: 'indigo',  badge: 'bg-indigo-900/40 text-indigo-300' },
  { value: 'blue',    badge: 'bg-blue-900/40 text-blue-300' },
  { value: 'emerald', badge: 'bg-emerald-900/40 text-emerald-300' },
  { value: 'amber',   badge: 'bg-amber-900/40 text-amber-300' },
  { value: 'rose',    badge: 'bg-rose-900/40 text-rose-300' },
  { value: 'purple',  badge: 'bg-purple-900/40 text-purple-300' },
  { value: 'cyan',    badge: 'bg-cyan-900/40 text-cyan-300' },
  { value: 'pink',    badge: 'bg-pink-900/40 text-pink-300' },
]
function getBadgeClass(color: string) {
  return COLOR_OPTIONS.find(c => c.value === color)?.badge ?? 'bg-zinc-800 text-zinc-300'
}

const STATUS_STYLES: Record<string, string> = {
  active:   'bg-emerald-900/40 text-emerald-300',
  pipeline: 'bg-amber-900/40 text-amber-300',
  closed:   'bg-zinc-800 text-zinc-400',
}

export default function ArchivePage() {
  const {
    archivedContacts, restoreContact, permanentDeleteContact,
    archivedProjects, restoreProject, permanentDeleteProject,
    archivedCategories, restoreCategory, permanentDeleteCategory,
  } = useCRM()

  const [activeTab, setActiveTab]     = useState<Tab>('contacts')
  const [confirmId, setConfirmId]     = useState<string | null>(null)

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'contacts',   label: 'Contacts',   count: archivedContacts.length },
    { key: 'projects',   label: 'Projects',   count: archivedProjects.length },
    { key: 'categories', label: 'Categories', count: archivedCategories.length },
  ]

  function ConfirmDelete({ id, onConfirm }: { id: string; onConfirm: () => void }) {
    if (confirmId === id) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-red-400">Delete permanently?</span>
          <button onClick={() => { onConfirm(); setConfirmId(null) }} className="text-xs font-medium text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded transition-colors">Yes</button>
          <button onClick={() => setConfirmId(null)} className="text-xs text-zinc-500 hover:text-zinc-300 px-1.5 py-0.5 rounded transition-colors">No</button>
        </div>
      )
    }
    return (
      <button onClick={() => setConfirmId(id)} className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors" title="Delete permanently">
        <Trash2 size={14} />
      </button>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Archive</h2>
        <p className="text-sm text-zinc-500 mt-1">Archived items are hidden from active views. Restore or permanently delete them here.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#1e1e1e]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setConfirmId(null) }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === tab.key ? 'bg-indigo-900/50 text-indigo-300' : 'bg-zinc-800 text-zinc-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Contacts tab ── */}
      {activeTab === 'contacts' && (
        archivedContacts.length === 0 ? (
          <EmptyState label="No archived contacts" />
        ) : (
          <div className="space-y-2">
            {archivedContacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between bg-[#111] border border-[#1e1e1e] rounded-xl px-5 py-3.5 hover:border-[#2a2a2a] transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-white">{contact.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{contact.organization} · {contact.type}</p>
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1">
                    {contact.categories.slice(0, 3).map(cat => (
                      <span key={cat} className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(cat)}`}>{cat}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <button
                    onClick={() => restoreContact(contact.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 border border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] transition-colors"
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                  <ConfirmDelete id={contact.id} onConfirm={() => permanentDeleteContact(contact.id)} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Projects tab ── */}
      {activeTab === 'projects' && (
        archivedProjects.length === 0 ? (
          <EmptyState label="No archived projects" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedProjects.map(project => (
              <div key={project.id} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#2a2a2a] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-[#1a1a1a] rounded-lg">
                    <Briefcase size={15} className="text-zinc-500" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[project.status] ?? 'bg-zinc-800 text-zinc-400'}`}>
                    {project.status}
                  </span>
                </div>
                <h3 className="font-semibold mt-4 text-zinc-300">{project.name}</h3>
                <p className="text-xs text-zinc-600 mt-0.5 capitalize">{project.type}</p>
                {project.description && (
                  <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{project.description}</p>
                )}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1e1e1e]">
                  <button
                    onClick={() => restoreProject(project.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 border border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] transition-colors flex-1 justify-center"
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                  <ConfirmDelete id={project.id} onConfirm={() => permanentDeleteProject(project.id)} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Categories tab ── */}
      {activeTab === 'categories' && (
        archivedCategories.length === 0 ? (
          <EmptyState label="No archived categories" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {archivedCategories.map(cat => (
              <div key={cat.id} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors">
                <span className={`px-3 py-1 rounded-full text-sm font-medium opacity-60 ${getBadgeClass(cat.color)}`}>
                  {cat.name}
                </span>
                {cat.description && (
                  <p className="text-xs text-zinc-600 mt-3 leading-relaxed">{cat.description}</p>
                )}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1e1e1e]">
                  <button
                    onClick={() => restoreCategory(cat.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 border border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] transition-colors flex-1 justify-center"
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                  <ConfirmDelete id={cat.id} onConfirm={() => permanentDeleteCategory(cat.id)} />
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16 text-zinc-600 text-sm">{label}</div>
  )
}
