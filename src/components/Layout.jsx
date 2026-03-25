// React import not required with the new JSX transform

import Header from './Header'
import { Outlet } from 'react-router-dom'
import Menu from './Menu'

export default function Layout() {
  return (
    <div className="flex h-screen">
    {/* Menu */}
    <Menu/>

    {/* Main Content */}
    <div className="w-full">
      {/* Header */}
      <Header />

      {/* Page Content */}
      <div className="p-4 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  </div>

  )
}
