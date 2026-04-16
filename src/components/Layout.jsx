// React import not required with the new JSX transform

import Header from './Header'
import { Outlet } from 'react-router-dom'
import Menu from './Menu'

export default function Layout() {
  return (
    <div className="flex h-screen min-h-0 bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:block">
        <Menu variant="desktop" />
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="shrink-0">
          <Header />
        </div>

        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>

  )
}
