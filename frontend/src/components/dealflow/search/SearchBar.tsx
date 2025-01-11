import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'

export type SearchScope = 'all' | 'title' | 'description' | 'location'

interface SearchBarProps {
  onSearch: (query: string, scope: SearchScope) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ onSearch, placeholder = "Search deals by keyword...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>('all')
  const [isOpen, setIsOpen] = useState(false)
  const [isScopeOpen, setIsScopeOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scopeDropdownRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save recent searches to localStorage
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(event.target as Node)) {
        setIsScopeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle search
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      onSearch(debouncedQuery, scope)
      saveSearch(debouncedQuery)
    } else if (debouncedQuery === '') {
      onSearch('', scope)
    }
  }, [debouncedQuery, scope, onSearch])

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleScopeChange = (newScope: SearchScope) => {
    setScope(newScope)
    setIsScopeOpen(false)
  }

  const getScopeLabel = (scopeValue: SearchScope) => {
    switch (scopeValue) {
      case 'all':
        return 'All Fields'
      case 'title':
        return 'Title Only'
      case 'description':
        return 'Description Only'
      case 'location':
        return 'Location Only'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main search container */}
      <motion.div 
        className="relative group flex"
        initial={false}
        animate={{ 
          scale: isOpen || isScopeOpen ? 1.01 : 1,
          boxShadow: isOpen || isScopeOpen ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors" aria-hidden="true" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="block w-full rounded-l-xl border border-r-0 border-gray-300 bg-white py-3 pl-11 pr-12 text-sm placeholder-gray-500 shadow-sm transition-all duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-offset-0 group-hover:border-gray-400"
            placeholder={placeholder}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 transition-opacity duration-200"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Keyboard shortcut hint */}
          <AnimatePresence>
            {!query && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5"
              >
                <kbd className="hidden sm:inline-flex items-center rounded border border-gray-200 px-2 font-sans text-sm text-gray-400 group-hover:border-gray-300">
                  /
                </kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scope selector button */}
        <div className="relative" ref={scopeDropdownRef}>
          <motion.button
            whileHover={{ backgroundColor: '#F9FAFB' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsScopeOpen(!isScopeOpen)}
            className={`flex items-center h-full px-4 border border-l-0 border-gray-300 rounded-r-xl bg-white transition-all duration-200 ${
              isScopeOpen ? 'border-indigo-500 ring-2 ring-indigo-200 text-indigo-600' : ''
            }`}
          >
            <AdjustmentsHorizontalIcon className={`h-5 w-5 transition-colors ${isScopeOpen ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className="sr-only">Search options</span>
          </motion.button>

          {/* Scope selector dropdown */}
          <AnimatePresence>
            {isScopeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                className="absolute right-0 mt-2 w-48 rounded-lg bg-white py-1.5 shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
              >
                {(['all', 'title', 'description', 'location'] as const).map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => handleScopeChange(option)}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      scope === option
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {scope === option && (
                      <motion.span
                        layoutId="scopeIndicator"
                        className="absolute left-2 text-indigo-600 font-bold"
                        transition={{ type: "spring", bounce: 0.25 }}
                      >
                        •
                      </motion.span>
                    )}
                    {getScopeLabel(option)}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Recent searches dropdown */}
      <AnimatePresence>
        {isOpen && recentSearches.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 z-40 overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Searches</h3>
            </div>
            {recentSearches.map((search, index) => (
              <motion.button
                key={index}
                onClick={() => handleRecentSearchClick(search)}
                className="flex w-full items-center px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                whileHover={{ x: 4, backgroundColor: '#F9FAFB' }}
                whileTap={{ scale: 0.98 }}
              >
                <ClockIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                {search}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 