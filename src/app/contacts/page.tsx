'use client'

import { useState } from 'react'
import { Plus, X, Search, Edit2 } from 'lucide-react'
import type { Contact, CustomColumn } from '@/types'

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

const SAMPLE_CONTACTS: Contact[] = [
  { id: '1', name: 'Sarah Chen',     organization: 'Sequoia Capital', phone: '+1 (415) 555-0193', email: 'sarah.chen@sequoia.com',     type: 'LP',          categories: ['Venture', 'Tier 1'] },
  { id: '2', name: 'Marcus Johnson', organization: 'Blackstone',      phone: '+1 (212) 555-0102', email: 'm.johnson@blackstone.com',   type: 'GP',          categories: ['PE', 'Tier 1'] },
  { id: '3', name: 'Priya Patel',    organization: 'CPPIB',           phone: '+1 (416) 555-0178', email: 'priya.patel@cppib.com',      type: 'LP',          categories: ['Pension Fund'] },
  { id: '4', name: 'David Kim',      organization: 'a16z',            phone: '+1 (650) 555-0134', email: 'd.kim@a16z.com',             type: 'LP',          categories: ['Venture'] },
  { id: '5', name: 'Lisa Thompson',  organization: 'Hamilton Lane',   phone: '+1 (610) 555-0156', email: 'l.thompson@hamiltonlane.com', type: 'Co-investor', categories: ['FoF'] },
]

const CONTACT_TYPES = ['LP', 'GP', 'Advisor', 'Co-investor', 'Service Provider', 'Portfolio', 'Other']
const DEFAULT_CATEGORIES = ['LP', 'GP', 'Tier 1', 'Venture', 'PE', 'Pension Fund', 'FoF', 'Co-investor']

const BLANK_CONTACT = { name: '', organization: '', phone: '', email: '', type: 'LP', categories: [] as string[] }

function toggleCat(arr: string[], cat: string) {
  return arr.includes(cat) ? arr.filter(c => c !== cat) : [...arr, cat]
}

export default function ContactsPage() {
  const [contacts, setContacts]           = useState<Contact[]>(SAMPLE_CONTACTS)
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([])
  const [categories]                      = useState<string[]>(DEFAULT_CATEGORIES)
  const [selectedContact, setSelected]    = useState<Contact | null>(null)
  const [editingContact, setEditing]      = useState<Contact | null>(null)
  const [isAddingContact, setAddContact]  = useState(false)
  const [isAddingColumn, setAddColumn]    = useState(false)
  const [searchQuery, setSearch]          = useState('')
  const [newContact, setNewContact]       = useState({ ...BLANK_CONTACT })
  const [newColumnLabel, setColLabel]     = useState('')

  const filtered = contacts.filter(c =>
    [c.name, c.organization, c.email].some(v =>
      v.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  function addContact() {
    if (!newContact.name.trim()) return
    setContacts(prev => [...prev, { ...newContact, id: Date.now().toString() }])
    setNewContact({ ...BLANK_CONTACT })
    setAddContact(false)
  }

  function addColumn() {
    if (!newColumnLabel.trim()) return
    const key = newColumnLabel.toLowerCase().replace(/\s+/g, '_')
    setCustomColumns(prev => [...prev, { id: Date.now().toString(), label: newColumnLabel, key }])
    setColLabel('')
    setAddColumn(false)
  }

  function saveEdit() {
    if (!editingContact) return
    setContacts(prev => prev.map(c => c.id === editingContact.id ? editingContact : c))
    setSelected(editingContact)
    setEditing(null)
  }

  const allColumns = [
    { key: 'name',         label: 'Name' },
    { key: 'organization', label: 'Organization' },
    { key: 'phone',        label: 'Phone' },
    { key: 'email',        label: 'Email' },
    { key: 'type',         label: 'Type' },
    { key: 'categories',   label: 'Category' },
    ...customColumns,
  ]

  return (
    <div className="flex h-full">
      {/* ── Table area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-8 py-5 border-b border-[#1e1e1e] flex items-center justify-between gap-4 shrink-0">
          <h2 className="text-lg font-semibold">Contacts</h2>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearch(e.target.value)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-8 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 w-52"
              />
            </div>
            <button
              onClick={() => setAddColumn(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 border border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              <Plus size={13} /> Add Column
            </button>
            <button
              onClick={() => setAddContact(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium"
            >
              <Plus size={13} /> Add Contact
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10">
              <tr className="border-b border-[#1e1e1e]">
                {allColumns.map(col => (
                  <th key={col.key} className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(contact => (
                <tr
                  key={contact.id}
                  onClick={() => { setSelected(contact); setEditing(null) }}
                  className={`border-b border-[#1a1a1a] cursor-pointer transition-colors hover:bg-[#141414] ${
                    selectedContact?.id === contact.id ? 'bg-[#141414]' : ''
                  }`}
                >
                  <td className="px-6 py-3.5 font-medium text-white whitespace-nowrap">{contact.name}</td>
                  <td className="px-6 py-3.5 text-zinc-400 whitespace-nowrap">{contact.organization}</td>
                  <td className="px-6 py-3.5 text-zinc-400 whitespace-nowrap">{contact.phone}</td>
                  <td className="px-6 py-3.5 text-zinc-400 whitespace-nowrap">{contact.email}</td>
                  <td className="px-6 py-3.5 text-zinc-400 whitespace-nowrap">{contact.type}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {contact.categories.map(cat => (
                        <span key={cat} className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(cat)}`}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  {customColumns.map(col => (
                    <td key={col.key} className="px-6 py-3.5 text-zinc-400">
                      {contact.customFields?.[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-zinc-600 text-sm">
              {searchQuery ? 'No contacts match your search.' : 'No contacts yet. Add your first one.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-2.5 border-t border-[#1e1e1e] text-xs text-zinc-600 shrink-0">
          {filtered.length} {filtered.length === 1 ? 'contact' : 'contacts'}
        </div>
      </div>

      {/* ── Contact Detail Panel ── */}
      {selectedContact && (
        <div className="w-72 border-l border-[#1e1e1e] bg-[#0f0f0f] flex flex-col shrink-0 overflow-y-auto">
          <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between shrink-0">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Details</span>
            <button onClick={() => { setSelected(null); setEditing(null) }} className="text-zinc-600 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>

          {editingContact ? (
            /* Edit mode */
            <div className="flex-1 p-5 space-y-4">
              {(['name', 'organization', 'phone', 'email'] as const).map(key => (
                <div key={key}>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider capitalize">{key}</label>
                  <input
                    value={editingContact[key]}
                    onChange={e => setEditing({ ...editingContact, [key]: e.target.value })}
                    className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Type</label>
                <select
                  value={editingContact.type}
                  onChange={e => setEditing({ ...editingContact, type: e.target.value })}
                  className="mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {CONTACT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Categories</label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setEditing({ ...editingContact, categories: toggleCat(editingContact.categories, cat) })}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                        editingContact.categories.includes(cat)
                          ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                          : 'border-[#2a2a2a] text-zinc-500 hover:border-zinc-500'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveEdit} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors">
                  Save
                </button>
                <button onClick={() => setEditing(null)} className="px-4 py-2 border border-[#2a2a2a] rounded-lg text-sm text-zinc-400 hover:bg-[#1a1a1a] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View mode */
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-base">{selectedContact.name}</h3>
                  <p className="text-sm text-zinc-400 mt-0.5">{selectedContact.organization}</p>
                </div>
                <button
                  onClick={() => setEditing({ ...selectedContact })}
                  className="p-1.5 text-zinc-600 hover:text-white transition-colors"
                >
                  <Edit2 size={13} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Email', value: selectedContact.email },
                  { label: 'Phone', value: selectedContact.phone },
                  { label: 'Type',  value: selectedContact.type },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
                    <p className="mt-1 text-sm text-white">{value || '—'}</p>
                  </div>
                ))}

                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Categories</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedContact.categories.length > 0
                      ? selectedContact.categories.map(cat => (
                          <span key={cat} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(cat)}`}>
                            {cat}
                          </span>
                        ))
                      : <span className="text-sm text-zinc-600">None</span>
                    }
                  </div>
                </div>

                {customColumns.map(col => (
                  <div key={col.key}>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{col.label}</p>
                    <p className="mt-1 text-sm text-white">{selectedContact.customFields?.[col.key] ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Add Contact Modal ── */}
      {isAddingContact && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setAddContact(false)}>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl w-[480px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Add Contact</h3>
              <button onClick={() => setAddContact(false)} className="text-zinc-500 hover:text-white"><X size={15} /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'name',         label: 'Name',         placeholder: 'Full name' },
                { key: 'organization', label: 'Organization', placeholder: 'Company or fund' },
                { key: 'phone',        label: 'Phone',        placeholder: '+1 (555) 000-0000' },
                { key: 'email',        label: 'Email',        placeholder: 'email@company.com' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={newContact[field.key as keyof typeof newContact] as string}
                    onChange={e => setNewContact(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Type</label>
                <select
                  value={newContact.type}
                  onChange={e => setNewContact(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {CONTACT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Categories</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewContact(prev => ({ ...prev, categories: toggleCat(prev.categories, cat) }))}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                        newContact.categories.includes(cat)
                          ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                          : 'border-[#2a2a2a] text-zinc-500 hover:border-zinc-500'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={addContact}
                disabled={!newContact.name.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                Add Contact
              </button>
              <button onClick={() => setAddContact(false)} className="px-5 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-zinc-400 hover:bg-[#1a1a1a] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Column Modal ── */}
      {isAddingColumn && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setAddColumn(false)}>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl w-[360px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Add Column</h3>
              <button onClick={() => setAddColumn(false)} className="text-zinc-500 hover:text-white"><X size={15} /></button>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Column Name</label>
              <input
                type="text"
                placeholder="e.g. LinkedIn, Location, Notes"
                value={newColumnLabel}
                onChange={e => setColLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addColumn()}
                autoFocus
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={addColumn}
                disabled={!newColumnLabel.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                Add Column
              </button>
              <button onClick={() => setAddColumn(false)} className="px-5 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-zinc-400 hover:bg-[#1a1a1a] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
