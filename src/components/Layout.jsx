import React from 'react'

import Header from './Header'
import { Outlet } from 'react-router-dom'
import Menu from './Menu'

export default function Layout() {
  return (
    <div className="flex h-screen">
    {/* Sidebar */}
    <div className="w-64 p-4 hidden md:block  bg-gray-800 text-white">

      <h1 className='text-center p-4 font-bold tracking-wide text-lg '> Sistema POS</h1>
      <Menu />
    </div>

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
