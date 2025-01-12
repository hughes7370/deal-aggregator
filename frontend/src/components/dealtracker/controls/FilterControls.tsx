'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilterControlsProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status?: string[];
    priority?: string[];
    type?: string[];
    next_steps?: string[];
  };
  onApplyFilters: (filters: any) => void;
}

const STATUS_OPTIONS = ['Interested', 'Contacted', 'Due Diligence', 'Offer Made', 'Not Interested', 'Closed', 'Lost'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];
const TYPE_OPTIONS = ['SaaS', 'Ecommerce', 'Content', 'Agency', 'Other'];
const NEXT_STEPS_OPTIONS = ['Review Listing', 'Contact Seller', 'Schedule Call', 'Request Info', 'Submit Offer', 'None'];

export default function FilterControls({ isOpen, onClose, filters, onApplyFilters }: FilterControlsProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Keep local filters in sync with parent filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (type: string, value: string) => {
    setLocalFilters(prev => {
      const currentValues = prev[type] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [type]: newValues
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      status: [],
      priority: [],
      type: [],
      next_steps: []
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center sm:items-center p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-t-xl sm:rounded-xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full sm:my-8 sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      Filter Deals
                    </Dialog.Title>
                    
                    <div className="space-y-6">
                      {/* Status Filter */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Status</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {STATUS_OPTIONS.map((status) => (
                            <label
                              key={status}
                              className={`relative flex items-center justify-center px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                                localFilters.status?.includes(status)
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={localFilters.status?.includes(status)}
                                onChange={() => handleFilterChange('status', status)}
                              />
                              {status}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Priority Filter */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Priority</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {PRIORITY_OPTIONS.map((priority) => (
                            <label
                              key={priority}
                              className={`relative flex items-center justify-center px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                                localFilters.priority?.includes(priority)
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={localFilters.priority?.includes(priority)}
                                onChange={() => handleFilterChange('priority', priority)}
                              />
                              {priority}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Business Type Filter */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Business Type</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {TYPE_OPTIONS.map((type) => (
                            <label
                              key={type}
                              className={`relative flex items-center justify-center px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                                localFilters.type?.includes(type)
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={localFilters.type?.includes(type)}
                                onChange={() => handleFilterChange('type', type)}
                              />
                              {type}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Next Steps Filter */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Next Steps</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {NEXT_STEPS_OPTIONS.map((step) => (
                            <label
                              key={step}
                              className={`relative flex items-center justify-center px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                                localFilters.next_steps?.includes(step)
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={localFilters.next_steps?.includes(step)}
                                onChange={() => handleFilterChange('next_steps', step)}
                              />
                              {step}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
                    onClick={handleClear}
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
                    onClick={handleApply}
                  >
                    Apply Filters
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
