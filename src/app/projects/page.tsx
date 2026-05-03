'use client'

import { useState } from 'react'
import { Plus, X, Briefcase } from 'lucide-react'
import type { Project } from '@/types'

const STATUS_STYLES: Record<Project['status'], string> = {
  active:   'bg-emerald-900/40 text-emerald-300',
  pipeline: 'bg-amber-900/40 text-amber-300',
  closed:   'bg-zinc-800 text-zinc-400',
}

const SAMPLE_PROJECTS: Project[] = [
  { id: '1', name: 'PT30 II',    type: 'fund',     description: 'Second fund vehicle targeting private equity.',    status: 'active' },
  { id: '2', name: 'GP Raise Q3', type: 'mandate', description: 'General partner capital raise mandate for Q3.',    status: 'pipeline' },
]

const BLANK = { name: '', type: 'fund' as Project['type'], description: '', status: 'pipeline' as Project['status'] }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS)
  const [isAdding, setAdding]   = useState(false)
  const [form, setForm]         = useState({ ...BLANK })

  function addProject() {
    if (!form.name.trim()) return
    setProjects(prev => [...prev, { ...form, id: Date.now().toString() }])
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
          <div key={project.id} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#2a2a2a] transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-[#1a1a1a] rounded-lg">
                <Briefcase size={15} className="text-indigo-400" />
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[project.status]}`}>
                {project.status}
              </span>
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
                onClick={addProject}
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
