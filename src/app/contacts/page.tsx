'use client'

import { useState, useRef } from 'react'
import { Plus, X, Search, Edit2, Archive, Trash2, Upload, Download } from 'lucide-react'
import { useCRM } from '@/context/CRMContext'
import type { Contact } from '@/types'

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

const CONTACT_TYPES = ['LP', 'GP', 'Advisor', 'Co-investor', 'Service Provider', 'Portfolio', 'Other']
const BLANK = { name: '', organization: '', phone: '', email: '', type: 'LP', categories: [] as string[] }

function toggleCat(arr: string[], cat: string) {
  return arr.includes(cat) ? arr.filter(c => c !== cat) : [...arr, cat]
}

// ── CSV helpers ─────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'))
  const rows = lines.slice(1).map(line => {
    const vals = parseCSVLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
  }).filter(row => row['name']?.trim())
  return { headers, rows }
}

// ────────────────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const {
    contacts, categories, customColumns,
    addContact, updateContact, deleteContact, archiveContact, addCustomColumn,
    importLogs, bulkAddContacts,
  } = useCRM()

  const [selectedContact, setSelected]   = useState<Contact | null>(null)
  const [editingContact, setEditing]      = useState<Contact | null>(null)
  const [isAddingContact, setAddContact]  = useState(false)
  const [isAddingColumn, setAddColumn]    = useState(false)
  const [isUploadingCSV, setUploadCSV]    = useState(false)
  const [searchQuery, setSearch]          = useState('')
  const [newContact, setNewContact]       = useState({ ...BLANK })
  const [newColumnLabel, setColLabel]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [csvRows, setCsvRows]             = useState<Record<string, string>[]>([])
  const [csvFilename, setCsvFilename]     = useState('')
  const fileInputRef                      = useRef<HTMLInputElement>(null)

  const filtered = contacts.filter(c =>
    [c.name, c.organization, c.email].some(v =>
      v.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  function handleAddContact() {
    if (!newContact.name.trim()) return
    addContact(newContact)
    setNewContact({ ...BLANK })
    setAddContact(false)
  }

  function handleAddColumn() {
    if (!newColumnLabel.trim()) return
    addCustomColumn(newColumnLabel)
    setColLabel('')
    setAddColumn(false)
  }

  function saveEdit() {
    if (!editingContact) return
    updateContact(editingContact)
    setSelected(editingContact)
    setEditing(null)
  }

  function handleArchive(id: string) {
    archiveContact(id)
    setSelected(null)
    setEditing(null)
  }

  function handleDelete(id: string) {
    deleteContact(id)
    setSelected(null)
    setEditing(null)
    setConfirmDelete(false)
  }

  function closeUploadModal() {
    setUploadCSV(false)
    setCsvRows([])
    setCsvFilename('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function downloadTemplate() {
    const standardHeaders = ['name', 'organization', 'phone', 'email', 'type', 'categories']
    const customHeaders   = customColumns.map(c => c.key)
    const allHeaders      = [...standardHeaders, ...customHeaders]
    const exampleRow      = [
      'Jane Smith', 'BlackRock', '+1 (212) 555-0100', 'jane@blackrock.com', 'LP', 'LP|Tier 1',
      ...customHeaders.map(() => ''),
    ]
    const csv  = [allHeaders.join(','), exampleRow.join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'contacts_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileSelect(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) return
    setCsvFilename(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const { rows } = parseCSV((e.target?.result as string) ?? '')
      setCsvRows(rows)
    }
    reader.readAsText(file)
  }

  function handleImport() {
    if (!csvRows.length) return
    const mapped: Omit<Contact, 'id'>[] = csvRows.map(row => ({
      name:         row['name'] ?? '',
      organization: row['organization'] ?? '',
      phone:        row['phone'] ?? '',
      email:        row['email'] ?? '',
      type:         row['type'] || 'LP',
      categories:   row['categories']
        ? row['categories'].split('|').map(s => s.trim()).filter(Boolean)
        : [],
      customFields: Object.fromEntries(customColumns.map(c => [c.key, row[c.key] ?? ''])),
    }))
    bulkAddContacts(mapped, csvFilename)
    closeUploadModal()
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
      {/* ── Table ── */}
      <div className="flex-1 flex flex-col min-w-0">
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
                  onClick={() => { setSelected(contact); setEditing(null); setConfirmDelete(false) }}
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
        <div className="px-8 py-2.5 border-t border-[#1e1e1e] flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-600">
            {filtered.length} {filtered.length === 1 ? 'contact' : 'contacts'}
          </span>
          <button
            onClick={() => setUploadCSV(true)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Upload size={12} /> Upload CSV
          </button>
        </div>
      </div>

      {/* ── Detail Panel ── */}
      {selectedContact && (
        <div className="w-72 border-l border-[#1e1e1e] bg-[#0f0f0f] flex flex-col shrink-0">
          <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between shrink-0">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Details</span>
            <button onClick={() => { setSelected(null); setEditing(null); setConfirmDelete(false) }} className="text-zinc-600 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>

          {editingContact ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                      key={cat.id}
                      onClick={() => setEditing({ ...editingContact, categories: toggleCat(editingContact.categories, cat.name) })}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                        editingContact.categories.includes(cat.name)
                          ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                          : 'border-[#2a2a2a] text-zinc-500 hover:border-zinc-500'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveEdit} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors">Save</button>
                <button onClick={() => setEditing(null)} className="px-4 py-2 border border-[#2a2a2a] rounded-lg text-sm text-zinc-400 hover:bg-[#1a1a1a] transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-base">{selectedContact.name}</h3>
                  <p className="text-sm text-zinc-400 mt-0.5">{selectedContact.organization}</p>
                </div>
                <button onClick={() => setEditing({ ...selectedContact })} className="p-1.5 text-zinc-600 hover:text-white transition-colors">
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
                          <span key={cat} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(cat)}`}>{cat}</span>
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

          {!editingContact && (
            <div className="p-4 border-t border-[#1e1e1e] space-y-2 shrink-0">
              <button
                onClick={() => handleArchive(selectedContact.id)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-zinc-400 border border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <Archive size={13} /> Archive
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400 flex-1">Delete permanently?</span>
                  <button onClick={() => handleDelete(selectedContact.id)} className="text-xs font-medium text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors">Yes</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded transition-colors">No</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 border border-red-900/40 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
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
                      key={cat.id}
                      type="button"
                      onClick={() => setNewContact(prev => ({ ...prev, categories: toggleCat(prev.categories, cat.name) }))}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                        newContact.categories.includes(cat.name)
                          ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                          : 'border-[#2a2a2a] text-zinc-500 hover:border-zinc-500'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddContact}
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
                onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                autoFocus
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleAddColumn}
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

      {/* ── Upload CSV Modal ── */}
      {isUploadingCSV && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeUploadModal}>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl w-[620px] p-6 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Import Contacts</h3>
              <button onClick={closeUploadModal} className="text-zinc-500 hover:text-white"><X size={15} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-0.5">
              {/* Download template */}
              <div className="flex items-center justify-between bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">CSV Template</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Download headers matching your current columns</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-400 border border-indigo-900/50 rounded-lg hover:bg-indigo-900/20 transition-colors whitespace-nowrap"
                >
                  <Download size={12} /> Download Template
                </button>
              </div>

              {/* Drop zone or preview */}
              {csvRows.length === 0 ? (
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#2a2a2a] rounded-lg py-12 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-zinc-600 transition-colors"
                >
                  <Upload size={22} className="text-zinc-600" />
                  <p className="text-sm text-zinc-400">
                    Drop your CSV here, or <span className="text-indigo-400 font-medium">browse file</span>
                  </p>
                  <p className="text-xs text-zinc-600">Only .csv files · categories separated by |</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{csvFilename} — {csvRows.length} rows</p>
                    <button
                      onClick={() => { setCsvRows([]); setCsvFilename(''); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-[#2a2a2a]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
                          {['name', 'organization', 'email', 'type', 'categories'].map(h => (
                            <th key={h} className="text-left px-3 py-2 text-zinc-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.slice(0, 6).map((row, i) => (
                          <tr key={i} className="border-b border-[#1e1e1e] last:border-0">
                            <td className="px-3 py-2 text-white whitespace-nowrap">{row['name'] || '—'}</td>
                            <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">{row['organization'] || '—'}</td>
                            <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">{row['email'] || '—'}</td>
                            <td className="px-3 py-2 text-zinc-400">{row['type'] || '—'}</td>
                            <td className="px-3 py-2 text-zinc-400">{row['categories'] || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvRows.length > 6 && (
                    <p className="text-xs text-zinc-600 mt-2 pl-1">+{csvRows.length - 6} more rows</p>
                  )}
                </div>
              )}

              {/* Import history */}
              {importLogs.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Import History</p>
                  <div className="space-y-1">
                    {importLogs.slice(0, 8).map(log => (
                      <div key={log.id} className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a] rounded-lg">
                        <span className="text-xs text-zinc-400 truncate mr-3">{log.filename}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-zinc-600">{log.rowCount} contacts</span>
                          <span className="text-xs text-zinc-700">
                            {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5 pt-5 border-t border-[#1e1e1e]">
              <button
                onClick={handleImport}
                disabled={csvRows.length === 0}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                {csvRows.length > 0
                  ? `Import ${csvRows.length} contact${csvRows.length !== 1 ? 's' : ''}`
                  : 'Import Contacts'}
              </button>
              <button onClick={closeUploadModal} className="px-5 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-zinc-400 hover:bg-[#1a1a1a] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
