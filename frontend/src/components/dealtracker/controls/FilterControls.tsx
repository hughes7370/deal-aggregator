'use client';

import { Fragment } from 'react';
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
  onApplyFilters: (filters: {
    status?: string[];
    priority?: string[];
    type?: string[];
    next_steps?: string[];
  }) => void;
}

const TYPE_OPTIONS = ['SaaS', 'Ecommerce', 'Content', 'Agency', 'Other'];
const STATUS_OPTIONS = ['Interested', 'Contacted', 'Due Diligence', 'Offer Made', 'Not Interested', 'Closed', 'Lost'];
const NEXT_STEPS_OPTIONS = ['Review Listing', 'Contact Seller', 'Schedule Call', 'Request Info', 'Submit Offer', 'None'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export default function FilterControls({ isOpen, onClose, filters, onApplyFilters }: FilterControlsProps) {
  const handleFilterChange = (category: string, value: string) => {
    const currentFilters = filters[category as keyof typeof filters] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(v => v !== value)
      : [...currentFilters, value];

    onApplyFilters({
      ...filters,
      [category]: newFilters,
    });
  };

  const clearFilters = () => {
    onApplyFilters({});
    onClose();
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                    Filter Deals
                  </Dialog.Title>

                  <div className="mt-6 space-y-6">
                    {/* Status Filter */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Status</h4>
                      <div className="mt-2 space-y-2">
                        {STATUS_OPTIONS.map((status) => (
                          <label key={status} className="inline-flex items-center mr-4">
                            <input
                              type="checkbox"
                              checked={(filters.status || []).includes(status)}
                              onChange={() => handleFilterChange('status', status)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Priority</h4>
                      <div className="mt-2 space-y-2">
                        {PRIORITY_OPTIONS.map((priority) => (
                          <label key={priority} className="inline-flex items-center mr-4">
                            <input
                              type="checkbox"
                              checked={(filters.priority || []).includes(priority)}
                              onChange={() => handleFilterChange('priority', priority)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">{priority}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Type</h4>
                      <div className="mt-2 space-y-2">
                        {TYPE_OPTIONS.map((type) => (
                          <label key={type} className="inline-flex items-center mr-4">
                            <input
                              type="checkbox"
                              checked={(filters.type || []).includes(type)}
                              onChange={() => handleFilterChange('type', type)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Next Steps Filter */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Next Steps</h4>
                      <div className="mt-2 space-y-2">
                        {NEXT_STEPS_OPTIONS.map((step) => (
                          <label key={step} className="inline-flex items-center mr-4">
                            <input
                              type="checkbox"
                              checked={(filters.next_steps || []).includes(step)}
                              onChange={() => handleFilterChange('next_steps', step)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">{step}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Clear Filters
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
