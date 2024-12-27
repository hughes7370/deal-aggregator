'use client';

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => pathname === path;

  const NavLinks = () => (
    <>
      <Link 
        href="/dashboard"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive('/dashboard')
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Dashboard
      </Link>
      <Link 
        href="/dashboard/preferences"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive('/dashboard/preferences')
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Alert Preferences
      </Link>
    </>
  );

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold text-gray-900 font-inter">
              DealSight
            </Link>
            {userId && (
              <nav className="hidden md:flex ml-10 space-x-4">
                <NavLinks />
              </nav>
            )}
          </div>
          <div className="flex items-center">
            {userId ? (
              <>
                <UserButton afterSignOutUrl="/" />
                <button
                  type="button"
                  className="md:hidden ml-2 p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <span className="sr-only">Open menu</span>
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {userId && isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <nav className="flex flex-col space-y-1 px-2 pb-3 pt-2">
              <NavLinks />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 