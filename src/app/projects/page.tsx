'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Briefcase, Archive, Trash2 } from 'lucide-react'
import { useCRM } from '@/context/CRMContext'
import type { Project } from '@/types'

const STATUS_STYLES: Record<Project['status'], string> = {
  active:   'bg-emerald-900/40 text-emerald-300',
  pipeline: 'bg-amber-900/40 text-amber-300',
  closed:   'bg-zinc-800 text-zinc-400',
}

const BLANK = { name: '', type: 'fund' as Project['type'], description: '', status: 'pipeline' as Project['status'] }

export default function ProjectsPage() {
  const { projects, addProject, deleteProject, archiveProject } = useCRM()
  const router                        = useRouter()
  const [isAdding, setAdding]         = useState(false)
  const [form, setForm]               = useState({ ...BLANK })
  const [confirmDeleteId, setConfirm] = useState<string | null>(null)

  function handleAdd() {
    if (!form.name.trim()) return
    addProject(form)
    setForm({ ...BLANK })
    setAdding(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-semibold">Projects</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium"
        >
          <Plus size={13} /> Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <div key={project.id} onClick={() => router.push(`/projects/${project.id}`)} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#2a2a2a] transition-colors group relative cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#1a1a1a] rounded-lg">
                <Briefcase size={15} className="text-indigo-400" />
              </div>
              <div className="flex items-center gap-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[project.status]}`}>
                  {project.status}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  <button
                    onClick={e => { e.stopPropagation(); archiveProject(project.id) }}
                    title="Archive"
                    className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-[#2a2a2a] rounded transition-colors"
                  >
                    <Archive size={13} />
                  </button>
                  {confirmDeleteId === project.id ? (
                    <div className="flex items-center gap-1 bg-[#1e1010] border border-red-900/40 rounded px-2 py-1" onClick={e => e.stopPropagation()}>
                      <span className="text-xs text-red-400">Delete?</span>
                      <button onClick={() => { deleteProject(project.id); setConfirm(null) }} className="text-xs font-medium text-red-400 hover:text-red-300 px-1">Yes</button>
                      <button onClick={() => setConfirm(null)} className="text-xs text-zinc-500 hover:text-zinc-300 px-1">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setConfirm(project.id) }}
                      title="Delete"
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <h3 className="font-semibold mt-4">{project.name}</h3>
            <p className="text-xs text-indigo-400 mt-0.5 capitalize">{project.type}</p>
            {project.description && (
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{project.description}</p>
            )}
          </div>
        ))}

        <button
          onClick={() => setAdding(true)}
          className="border border-dashed border-[#2a2a2a] rounded-xl p-5 flex items-center justify-center gap-2 text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 transition-colors"
        >
          <Plus size={15} />
          <span className="text-sm">New Project</span>
        </button>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-16 text-zinc-600 text-sm">No projects yet. Add your first one.</div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setAdding(false)}>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl w-[440px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Add Project</h3>
              <button onClick={() => setAdding(false)} className="text-zinc-500 hover:text-white"><X size={15} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Name</label>
                <input
                  placeholder="e.g. PT30 II, GP Raise"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value as Project['type'] }))}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="fund">Fund</option>
                    <option value="mandate">Mandate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as Project['status'] }))}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pipeline">Pipeline</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                disabled={!form.name.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                Add Project
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
