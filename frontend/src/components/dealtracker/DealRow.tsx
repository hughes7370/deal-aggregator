'use client';

import { useState } from 'react';
import SelectField from './SelectField';

interface DealRowProps {
  listing: {
    id: string;
    title: string;
    asking_price: number;
    business_model: string;
    source_platform: string;
  };
  dealTracker?: {
    id: string;
    status: string;
    next_steps: string;
    priority: string;
    notes: string;
    last_updated: string;
    created_at: string;
  };
  onUpdate: (listingId: string, field: string, value: string | number) => void;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  statusColor: string;
}

const TYPE_OPTIONS = ['SaaS', 'Ecommerce', 'Content', 'Agency', 'Other'];
const STATUS_OPTIONS = ['Interested', 'Contacted', 'Due Diligence', 'Offer Made', 'Not Interested', 'Closed', 'Lost'];
const NEXT_STEPS_OPTIONS = ['Review Listing', 'Contact Seller', 'Schedule Call', 'Request Info', 'Submit Offer', 'None'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export default function DealRow({ listing, dealTracker, onUpdate, isSelected, onSelect, statusColor }: DealRowProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(dealTracker?.notes || '');

  const handleNotesBlur = () => {
    setIsEditingNotes(false);
    if (notesValue !== dealTracker?.notes) {
      onUpdate(listing.id, 'notes', notesValue);
    }
  };

  const getBusinessType = (type: string | null | undefined) => {
    // If type is null or undefined, return 'Other'
    if (!type) return 'Other';
    
    // Map the business type from the listing to our options
    const typeMap: { [key: string]: string } = {
      'saas': 'SaaS',
      'ecommerce': 'Ecommerce',
      'content': 'Content',
      'agency': 'Agency',
    };
    return typeMap[type.toLowerCase()] || 'Other';
  };

  return (
    <tr className={isSelected ? 'bg-blue-50' : undefined}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {listing.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${listing.asking_price.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {getBusinessType(listing.business_model)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <SelectField
          value={dealTracker?.status || 'Interested'}
          onChange={(value) => onUpdate(listing.id, 'status', value)}
          options={STATUS_OPTIONS}
          className={`min-w-[140px] ${statusColor} rounded-lg border-0 font-medium`}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <SelectField
          value={dealTracker?.next_steps || 'Review Listing'}
          onChange={(value) => onUpdate(listing.id, 'next_steps', value)}
          options={NEXT_STEPS_OPTIONS}
          className="min-w-[140px] bg-gray-50 rounded-lg"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <SelectField
          value={dealTracker?.priority || 'Medium'}
          onChange={(value) => onUpdate(listing.id, 'priority', value)}
          options={PRIORITY_OPTIONS}
          className={`min-w-[100px] rounded-lg ${
            dealTracker?.priority === 'High' 
              ? 'bg-red-50 text-red-700' 
              : dealTracker?.priority === 'Medium'
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-green-50 text-green-700'
          }`}
        />
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {isEditingNotes ? (
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={handleNotesBlur}
            className="w-full min-w-[200px] h-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            {dealTracker?.notes || 'Click to add notes...'}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {dealTracker?.last_updated ? new Date(dealTracker.last_updated).toLocaleDateString() : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {listing.source_platform || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {dealTracker?.created_at ? new Date(dealTracker.created_at).toLocaleDateString() : '-'}
      </td>
    </tr>
  );
}
