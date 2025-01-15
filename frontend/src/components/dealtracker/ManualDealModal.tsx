import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/outline';

interface ManualDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dealData: {
    title: string;
    asking_price?: number;
    business_model: string;
    revenue?: number;
    ebitda?: number;
    selling_multiple?: number;
    status: string;
    next_steps: string;
    priority: string;
    notes?: string;
  }) => Promise<{ success: boolean; message: string }>;
}

const BUSINESS_TYPES = ['SaaS', 'Ecommerce', 'Content', 'Service', 'Other'];
const STATUS_OPTIONS = ['Interested', 'Contacted', 'Due Diligence', 'Offer Made', 'Not Interested', 'Closed', 'Lost'];
const NEXT_STEPS_OPTIONS = ['Review Listing', 'Contact Seller', 'Schedule Call', 'Request Info', 'Submit Offer', 'None'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

// Add mapping for business type variations
const BUSINESS_TYPE_MAPPING: { [key: string]: string } = {
  'saas': 'SaaS',
  'software': 'SaaS',
  'software/saas': 'SaaS',
  'e-commerce': 'Ecommerce',
  'ecommerce': 'Ecommerce',
  'content': 'Content',
  'service': 'Service',
  'agency': 'Service',
  'marketplace': 'Other'
};

export default function ManualDealModal({ isOpen, onClose, onSubmit }: ManualDealModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    asking_price: '',
    business_model: 'SaaS',
    revenue: '',
    ebitda: '',
    selling_multiple: '',
    status: 'Interested',
    next_steps: 'Review Listing',
    priority: 'Medium',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await onSubmit({
        title: formData.title,
        asking_price: formData.asking_price ? Number(formData.asking_price) : undefined,
        business_model: formData.business_model,
        revenue: formData.revenue ? Number(formData.revenue) : undefined,
        ebitda: formData.ebitda ? Number(formData.ebitda) : undefined,
        selling_multiple: formData.selling_multiple ? Number(formData.selling_multiple) : undefined,
        status: formData.status,
        next_steps: formData.next_steps,
        priority: formData.priority,
        notes: formData.notes
      });

      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => {
          onClose();
        }, 1500); // Close modal after 1.5 seconds on success
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Map business model to standardized type if needed
    if (name === 'business_model') {
      updatedValue = BUSINESS_TYPE_MAPPING[value.toLowerCase()] || value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
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

                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                        Add New Deal
                      </Dialog.Title>

                      <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                        {/* Business Details Section */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Business Details</h4>
                          
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                              Business Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="title"
                              id="title"
                              required
                              value={formData.title}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              placeholder="Enter business name"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label htmlFor="asking_price" className="block text-sm font-medium text-gray-700 mb-1">
                                Asking Price
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                  <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                  type="number"
                                  name="asking_price"
                                  id="asking_price"
                                  value={formData.asking_price}
                                  onChange={handleInputChange}
                                  className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="business_model" className="block text-sm font-medium text-gray-700 mb-1">
                                Business Type <span className="text-red-500">*</span>
                              </label>
                              <select
                                name="business_model"
                                id="business_model"
                                required
                                value={formData.business_model}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              >
                                {BUSINESS_TYPES.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Financial Metrics Section */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Financial Metrics</h4>
                          
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-1">
                                Monthly Revenue
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                  <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                  type="number"
                                  name="revenue"
                                  id="revenue"
                                  value={formData.revenue}
                                  onChange={handleInputChange}
                                  className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="ebitda" className="block text-sm font-medium text-gray-700 mb-1">
                                Monthly Profit
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                  <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                  type="number"
                                  name="ebitda"
                                  id="ebitda"
                                  value={formData.ebitda}
                                  onChange={handleInputChange}
                                  className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="selling_multiple" className="block text-sm font-medium text-gray-700 mb-1">
                                Multiple
                              </label>
                              <div className="relative rounded-md shadow-sm">
                                <input
                                  type="number"
                                  name="selling_multiple"
                                  id="selling_multiple"
                                  value={formData.selling_multiple}
                                  onChange={handleInputChange}
                                  step="0.1"
                                  className="block w-full rounded-md border-0 py-1.5 pr-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                  placeholder="0.0"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                  <span className="text-gray-500 sm:text-sm">x</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Deal Status Section */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Deal Status</h4>
                          
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Status <span className="text-red-500">*</span>
                              </label>
                              <select
                                name="status"
                                id="status"
                                required
                                value={formData.status}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              >
                                {STATUS_OPTIONS.map(status => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label htmlFor="next_steps" className="block text-sm font-medium text-gray-700 mb-1">
                                Next Steps <span className="text-red-500">*</span>
                              </label>
                              <select
                                name="next_steps"
                                id="next_steps"
                                required
                                value={formData.next_steps}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              >
                                {NEXT_STEPS_OPTIONS.map(step => (
                                  <option key={step} value={step}>{step}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                Priority <span className="text-red-500">*</span>
                              </label>
                              <select
                                name="priority"
                                id="priority"
                                required
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              >
                                {PRIORITY_OPTIONS.map(priority => (
                                  <option key={priority} value={priority}>{priority}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Notes Section */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Additional Information</h4>
                          
                          <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <textarea
                              name="notes"
                              id="notes"
                              rows={3}
                              value={formData.notes}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              placeholder="Add any additional notes about the deal..."
                            />
                          </div>
                        </div>

                        {error && (
                          <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                              </div>
                            </div>
                          </div>
                        )}
                        {successMessage && (
                          <div className="mt-2 text-sm text-green-600 flex items-center">
                            <CheckIcon className="h-5 w-5 mr-1" />
                            {successMessage}
                          </div>
                        )}

                        <div className="mt-8 sm:mt-6 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                              </>
                            ) : (
                              'Add Deal'
                            )}
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
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 