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
          className={`text-xs ${statusColor}`}
        />
      </td>
      <td className="w-32 px-3 py-2">
        <SelectField
          value={dealTracker?.next_steps || 'Review Listing'}
          onChange={(value) => onUpdate(listing.id, 'next_steps', value)}
          options={NEXT_STEPS_OPTIONS}
          className="text-xs bg-gray-50"
        />
      </td>
      <td className="w-24 px-3 py-2">
        <SelectField
          value={dealTracker?.priority || 'Medium'}
          onChange={(value) => onUpdate(listing.id, 'priority', value)}
          options={PRIORITY_OPTIONS}
          className={`text-xs ${
            dealTracker?.priority === 'High' 
              ? 'bg-red-50 text-red-700' 
              : dealTracker?.priority === 'Medium'
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-green-50 text-green-700'
          }`}
        />
      </td>
      <td className="w-48 px-3 py-2">
        <div
          onClick={() => {
            const textarea = document.createElement('textarea');
            textarea.value = dealTracker?.notes || '';
            textarea.className = 'w-full p-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500';
            textarea.onblur = (e) => {
              const target = e.target as HTMLTextAreaElement;
              onUpdate(listing.id, 'notes', target.value);
              if (target.parentElement) {
                target.parentElement.replaceChild(
                  document.createTextNode(target.value || 'Click to add notes...'),
                  target
                );
              }
            };
            const textNode = document.createTextNode(dealTracker?.notes || 'Click to add notes...');
            if (textNode.parentElement) {
              textNode.parentElement.replaceChild(textarea, textNode);
              textarea.focus();
            }
          }}
          className="text-xs text-gray-900 cursor-pointer truncate max-w-[200px]"
        >
          {dealTracker?.notes || 'Click to add notes...'}
        </div>
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
