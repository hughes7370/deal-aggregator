'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import SelectField from './SelectField';

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (deal: {
    business_name: string;
    price: number;
    type: string;
    status: string;
    next_steps: string;
    priority: string;
    notes: string;
  }) => void;
}

const TYPE_OPTIONS = ['SaaS', 'Ecommerce', 'Content', 'Agency', 'Other'];
const STATUS_OPTIONS = ['Interested', 'Contacted', 'Due Diligence', 'Offer Made', 'Not Interested', 'Closed', 'Lost'];
const NEXT_STEPS_OPTIONS = ['Review Listing', 'Contact Seller', 'Schedule Call', 'Request Info', 'Submit Offer', 'None'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export default function AddDealModal({ isOpen, onClose, onAdd }: AddDealModalProps) {
  const [formData, setFormData] = useState({
    business_name: '',
    price: '',
    type: TYPE_OPTIONS[0],
    status: STATUS_OPTIONS[0],
    next_steps: NEXT_STEPS_OPTIONS[0],
    priority: PRIORITY_OPTIONS[0],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      price: parseFloat(formData.price) || 0,
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Add New Deal
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                          Business Name
                        </label>
                        <input
                          type="text"
                          id="business_name"
                          value={formData.business_name}
                          onChange={(e) => handleChange('business_name', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <input
                          type="number"
                          id="price"
                          value={formData.price}
                          onChange={(e) => handleChange('price', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <div className="mt-1">
                          <SelectField
                            value={formData.type}
                            onChange={(value) => handleChange('type', value)}
                            options={TYPE_OPTIONS}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">
                          <SelectField
                            value={formData.status}
                            onChange={(value) => handleChange('status', value)}
                            options={STATUS_OPTIONS}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Next Steps</label>
                        <div className="mt-1">
                          <SelectField
                            value={formData.next_steps}
                            onChange={(value) => handleChange('next_steps', value)}
                            options={NEXT_STEPS_OPTIONS}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <div className="mt-1">
                          <SelectField
                            value={formData.priority}
                            onChange={(value) => handleChange('priority', value)}
                            options={PRIORITY_OPTIONS}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleChange('notes', e.target.value)}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                        >
                          Add Deal
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
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
