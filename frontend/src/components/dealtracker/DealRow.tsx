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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Interested':
      return 'bg-blue-50 text-blue-700';
    case 'Contacted':
      return 'bg-purple-50 text-purple-700';
    case 'Due Diligence':
      return 'bg-yellow-50 text-yellow-700';
    case 'Offer Made':
      return 'bg-orange-50 text-orange-700';
    case 'Not Interested':
      return 'bg-gray-50 text-gray-700';
    case 'Closed':
      return 'bg-green-50 text-green-700';
    case 'Lost':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

const getNextStepsColor = (nextSteps: string) => {
  switch (nextSteps) {
    case 'Review Listing':
      return 'bg-blue-50 text-blue-700';
    case 'Contact Seller':
      return 'bg-purple-50 text-purple-700';
    case 'Schedule Call':
      return 'bg-yellow-50 text-yellow-700';
    case 'Request Info':
      return 'bg-orange-50 text-orange-700';
    case 'Submit Offer':
      return 'bg-green-50 text-green-700';
    case 'None':
      return 'bg-gray-50 text-gray-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-50 text-red-700';
    case 'Medium':
      return 'bg-yellow-50 text-yellow-700';
    case 'Low':
      return 'bg-green-50 text-green-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

export default function DealRow({ listing, dealTracker, onUpdate, isSelected, onSelect, statusColor }: DealRowProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(dealTracker?.notes || '');

  const handleNotesBlur = () => {
    setIsEditingNotes(false);
    if (notesValue !== dealTracker?.notes) {
      onUpdate(listing.id, 'notes', notesValue);
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="w-8 px-2 py-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="w-1/4 px-3 py-2">
        <div className="text-sm text-gray-900 truncate max-w-[300px]">
          {listing.title}
        </div>
      </td>
      <td className="w-24 px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
        ${listing.asking_price.toLocaleString()}
      </td>
      <td className="w-28 px-3 py-2">
        <SelectField
          value={dealTracker?.status || 'Interested'}
          onChange={(value) => onUpdate(listing.id, 'status', value)}
          options={STATUS_OPTIONS}
          className={`text-xs ${getStatusColor(dealTracker?.status || 'Interested')}`}
        />
      </td>
      <td className="w-32 px-3 py-2">
        <SelectField
          value={dealTracker?.next_steps || 'Review Listing'}
          onChange={(value) => onUpdate(listing.id, 'next_steps', value)}
          options={NEXT_STEPS_OPTIONS}
          className={`text-xs ${getNextStepsColor(dealTracker?.next_steps || 'Review Listing')}`}
        />
      </td>
      <td className="w-24 px-3 py-2">
        <SelectField
          value={dealTracker?.priority || 'Medium'}
          onChange={(value) => onUpdate(listing.id, 'priority', value)}
          options={PRIORITY_OPTIONS}
          className={`text-xs ${getPriorityColor(dealTracker?.priority || 'Medium')}`}
        />
      </td>
      <td className="w-48 px-3 py-2">
        {isEditingNotes ? (
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={handleNotesBlur}
            autoFocus
            className="w-full p-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="text-xs text-gray-900 cursor-pointer truncate max-w-[200px]"
          >
            {dealTracker?.notes || 'Click to add notes...'}
          </div>
        )}
      </td>
      <td className="w-24 px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
        {dealTracker?.last_updated ? new Date(dealTracker.last_updated).toLocaleDateString() : '-'}
      </td>
      <td className="w-24 px-3 py-2 text-xs text-gray-500 truncate max-w-[100px]">
        {listing.source_platform}
      </td>
      <td className="w-24 px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
        {dealTracker?.created_at ? new Date(dealTracker.created_at).toLocaleDateString() : '-'}
      </td>
    </tr>
  );
}
