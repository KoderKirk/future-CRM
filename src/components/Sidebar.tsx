'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Briefcase, Tag, Archive } from 'lucide-react'

const navItems = [
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Projects', href: '/projects', icon: Briefcase },
  { label: 'Category', href: '/category', icon: Tag },
  { label: 'Archive',  href: '/archive',  icon: Archive },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 bg-[#0f0f0f] border-r border-[#1e1e1e] flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-[#1e1e1e]">
        <span className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
          future-CRM
        </span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#1e1e2e] text-indigo-400'
                  : 'text-zinc-500 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
