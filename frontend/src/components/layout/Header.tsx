'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Company Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8">
                <svg viewBox="0 0 32 32" className="w-full h-full text-blue-600">
                  <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path 
                    d="M16 8v16M8 16h16" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                VentureScope
              </span>
            </Link>
          </div>

          {/* Login Button */}
          <div>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 