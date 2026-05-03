'use client'

import { useState } from 'react'
import { Plus, X, Archive, Trash2 } from 'lucide-react'
import { useCRM } from '@/context/CRMContext'

const COLOR_OPTIONS = [
  { value: 'indigo',  bg: 'bg-indigo-500',  badge: 'bg-indigo-900/40 text-indigo-300' },
  { value: 'blue',    bg: 'bg-blue-500',    badge: 'bg-blue-900/40 text-blue-300' },
  { value: 'emerald', bg: 'bg-emerald-500', badge: 'bg-emerald-900/40 text-emerald-300' },
  { value: 'amber',   bg: 'bg-amber-500',   badge: 'bg-amber-900/40 text-amber-300' },
  { value: 'rose',    bg: 'bg-rose-500',    badge: 'bg-rose-900/40 text-rose-300' },
  { value: 'purple',  bg: 'bg-purple-500',  badge: 'bg-purple-900/40 text-purple-300' },
  { value: 'cyan',    bg: 'bg-cyan-500',    badge: 'bg-cyan-900/40 text-cyan-300' },
  { value: 'pink',    bg: 'bg-pink-500',    badge: 'bg-pink-900/40 text-pink-300' },
]

function getBadgeClass(color: string) {
  return COLOR_OPTIONS.find(c => c.value === color)?.badge ?? 'bg-zinc-800 text-zinc-300'
}
function getBgClass(color: string) {
  return COLOR_OPTIONS.find(c => c.value === color)?.bg ?? 'bg-zinc-500'
}

const BLANK = { name: '', color: 'indigo', description: '' }

export default function CategoryPage() {
  const { categories, addCategory, deleteCategory, archiveCategory } = useCRM()
  const [isAdding, setAdding]         = useState(false)
  const [form, setForm]               = useState({ ...BLANK })
  const [confirmDeleteId, setConfirm] = useState<string | null>(null)

  function handleAdd() {
    if (!form.name.trim()) return
    addCategory(form)
    setForm({ ...BLANK })
    setAdding(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Categories</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium"
        >
          <Plus size={13} /> Add Category
        </button>
      </div>
      <p className="text-sm text-zinc-500 mb-8">Tags that describe your contacts — characteristics, tiers, relationship types.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 group hover:border-[#2a2a2a] transition-colors">
            <div className="flex items-start justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeClass(cat.color)}`}>
                {cat.name}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => archiveCategory(cat.id)}
                  title="Archive"
                  className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <Archive size={12} />
                </button>
                {confirmDeleteId === cat.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { deleteCategory(cat.id); setConfirm(null) }} className="text-xs font-medium text-red-400 hover:text-red-300 px-1">Yes</button>
                    <button onClick={() => setConfirm(null)} className="text-xs text-zinc-500 hover:text-zinc-300 px-1">No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirm(cat.id)}
                    title="Delete"
                    className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            {cat.description && (
              <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{cat.description}</p>
            )}
            <p className="text-xs text-zinc-700 mt-3">
              {cat.contactCount} {cat.contactCount === 1 ? 'contact' : 'contacts'}
            </p>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-zinc-600 text-sm">No categories yet. Add your first one.</div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setAdding(false)}>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl w-[400px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Add Category</h3>
              <button onClick={() => setAdding(false)} className="text-zinc-500 hover:text-white"><X size={15} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Name</label>
                <input
                  placeholder="e.g. Family Office, Strategic"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Color</label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(p => ({ ...p, color: opt.value }))}
                      className={`w-6 h-6 rounded-full ${opt.bg} transition-all ${
                        form.color === opt.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111]' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Description</label>
                <input
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                disabled={!form.name.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                Add Category
              </button>
              <button onClick={() => setAdding(false)} className="px-5 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-zinc-400 hover:bg-[#1a1a1a] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
