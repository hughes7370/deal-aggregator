'use client';

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Logo from "./Logo";

export default function Header() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => pathname === path;

  const NavLinks = () => (
    <>
      <Link 
        href="/dashboard"
        className={`block w-full px-4 py-2 text-base font-medium rounded-md ${
          isActive('/dashboard')
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Dashboard
      </Link>
      <Link 
        href="/dealflow"
        className={`block w-full px-4 py-2 text-base font-medium rounded-md ${
          isActive('/dealflow')
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Deal Flow
      </Link>
      <Link 
        href="/dealtracker"
        className={`block w-full px-4 py-2 text-base font-medium rounded-md ${
          isActive('/dealtracker')
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Deal Tracker
      </Link>
      <Link 
        href="/alert-management"
        className={`block w-full px-4 py-2 text-base font-medium rounded-md ${
          isActive('/alert-management')
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Alert Management
      </Link>
    </>
  );

  const DesktopNavLinks = () => (
    <>
      <Link 
        href="/dashboard"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive('/dashboard')
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        Dashboard
      </Link>
      <Link 
        href="/dealflow"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive('/dealflow')
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        Deal Flow
      </Link>
      <Link 
        href="/dealtracker"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive('/dealtracker')
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        Deal Tracker
      </Link>
      <Link 
        href="/alert-management"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive('/alert-management')
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        Alert Management
      </Link>
    </>
  );

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
            {userId && (
              <nav className="hidden md:flex ml-10 space-x-4">
                <DesktopNavLinks />
              </nav>
            )}
          </div>
          <div className="flex items-center">
            {userId ? (
              <>
                <UserButton afterSignOutUrl="/" />
                <button
                  type="button"
                  className="md:hidden ml-2 p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
          <div className="md:hidden border-t border-gray-200">
            <nav className="flex flex-col py-3">
              <NavLinks />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 