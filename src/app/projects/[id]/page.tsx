'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import { useCRM } from '@/context/CRMContext'

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

const STATUS_STYLES: Record<string, string> = {
  active:   'bg-emerald-900/40 text-emerald-300',
  pipeline: 'bg-amber-900/40 text-amber-300',
  closed:   'bg-zinc-800 text-zinc-400',
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { projects, contacts, projectContacts, removeContactFromProject } = useCRM()

  const project = projects.find(p => p.id === params.id)

  if (!project) {
    return (
      <div className="p-8">
        <button onClick={() => router.push('/projects')} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-6">
          <ArrowLeft size={14} /> Projects
        </button>
        <p className="text-zinc-600 text-sm">Project not found.</p>
      </div>
    )
  }

  const committedContactIds = projectContacts
    .filter(pc => pc.projectId === project.id)
    .map(pc => pc.contactId)

  const committedContacts = contacts.filter(c => committedContactIds.includes(c.id))

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Back nav */}
      <button
        onClick={() => router.push('/projects')}
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-6 w-fit"
      >
        <ArrowLeft size={14} /> Projects
      </button>

      {/* Project header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[project.status] ?? ''}`}>
              {project.status}
            </span>
          </div>
          <p className="text-sm text-zinc-500 capitalize">{project.type}</p>
          {project.description && (
            <p className="text-sm text-zinc-500 mt-2 max-w-lg leading-relaxed">{project.description}</p>
          )}
        </div>
      </div>

      {/* Committed contacts */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-300">
            Committed Contacts
            <span className="ml-2 text-zinc-600 font-normal">{committedContacts.length}</span>
          </h3>
        </div>

        {committedContacts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-zinc-600 text-sm">No contacts committed to this project yet.</p>
              <p className="text-zinc-700 text-xs mt-1">Select contacts on the Contacts page and use "Commit to Pipeline".</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto rounded-xl border border-[#1e1e1e]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#0a0a0a] z-10">
                <tr className="border-b border-[#1e1e1e]">
                  {['Name', 'Organization', 'Email', 'Phone', 'Type', 'Categories', ''].map((h, i) => (
                    <th key={i} className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {committedContacts.map(contact => (
                  <tr key={contact.id} className="border-b border-[#1a1a1a] hover:bg-[#141414] transition-colors group">
                    <td className="px-6 py-3.5 font-medium text-white whitespace-nowrap">{contact.name}</td>
                    <td className="px-6 py-3.5 text-zinc-400 whitespace-nowrap">{contact.organization}</td>
                    <td className="px-6 py-3.5 text-zinc-400 whitespace-nowrap">{contact.email}</td>
                    <td className="px-6 py-3.5 text-zinc-400 whitespace-nowrap">{contact.phone}</td>
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
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => removeContactFromProject(contact.id, project.id)}
                        title="Remove from project"
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
