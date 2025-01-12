'use client';

import { useState, useEffect } from 'react';
import SelectField from './SelectField';
import InlineEdit from './InlineEdit';

interface ColumnConfig {
  id: string;
  label: string;
  isVisible: boolean;
  isDefault: boolean;
}

interface ListingOverride {
  id: string;
  user_email: string;
  listing_id: string;
  title?: string;
  asking_price?: number;
  business_model?: string;
  revenue?: number;
  ebitda?: number;
  selling_multiple?: number;
  created_at: string;
  updated_at: string;
}

interface DealRowProps {
  listing: {
    id: string;
    title: string;
    asking_price: number;
    business_model: string;
    source_platform: string;
    revenue: number;
    ebitda: number;
    selling_multiple: number;
  };
  listing_override?: ListingOverride;
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
  onUpdateOverride: (listingId: string, field: string, value: string | number) => Promise<void>;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  statusColor: string;
  columnConfig: ColumnConfig[];
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

export default function DealRow({
  listing,
  listing_override,
  dealTracker,
  onUpdate,
  onUpdateOverride,
  isSelected,
  onSelect,
  statusColor,
  columnConfig
}: DealRowProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(dealTracker?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('DealRow: Notes updated from props:', {
      listingId: listing.id,
      newNotes: dealTracker?.notes,
      oldNotes: notesValue
    });
    setNotesValue(dealTracker?.notes || '');
  }, [dealTracker?.notes]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    console.log('DealRow: Notes changing:', {
      listingId: listing.id,
      oldValue: notesValue,
      newValue
    });
    setNotesValue(newValue);
    setError(null);
  };

  const handleNotesBlur = async () => {
    console.log('DealRow: Notes blur event:', {
      listingId: listing.id,
      currentValue: notesValue,
      originalValue: dealTracker?.notes,
      isSaving
    });

    if (notesValue !== dealTracker?.notes && !isSaving) {
      setIsSaving(true);
      setError(null);
      try {
        console.log('DealRow: Saving notes:', {
          listingId: listing.id,
          newValue: notesValue
        });
        await onUpdate(listing.id, 'notes', notesValue);
        console.log('DealRow: Notes saved successfully');
      } catch (error) {
        console.error('DealRow: Error saving notes:', error);
        setError('Failed to save notes. Please try again.');
        setNotesValue(dealTracker?.notes || '');
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditingNotes(false);
  };

  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log('DealRow: Key pressed:', {
      key: e.key,
      shiftKey: e.shiftKey,
      listingId: listing.id
    });

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNotesBlur();
    } else if (e.key === 'Escape') {
      console.log('DealRow: Canceling edit');
      setIsEditingNotes(false);
      setNotesValue(dealTracker?.notes || '');
      setError(null);
    }
  };

  const isColumnVisible = (columnId: string) => {
    return columnConfig.find(col => col.id === columnId)?.isVisible ?? false;
  };

  // Helper function to get the effective value (override or original)
  const getEffectiveValue = (field: keyof ListingOverride) => {
    if (listing_override && field in listing_override && listing_override[field] !== null) {
      return listing_override[field];
    }
    return listing[field as keyof typeof listing];
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="w-8 px-2 py-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </td>
      {isColumnVisible('business') && (
        <td className="px-3 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <InlineEdit
              value={getEffectiveValue('title') as string}
              onSave={(value) => onUpdateOverride(listing.id, 'title', value)}
              className="text-sm text-gray-900 font-medium"
            />
            <span className="text-xs text-gray-500 hidden sm:inline">•</span>
            <span className="text-xs text-gray-500">{listing.source_platform}</span>
          </div>
        </td>
      )}
      {isColumnVisible('asking_price') && (
        <td className="px-3 py-2">
          <InlineEdit
            value={getEffectiveValue('asking_price') as number}
            onSave={(value) => onUpdateOverride(listing.id, 'asking_price', value)}
            type="number"
            formatValue={(v) => `$${Number(v).toLocaleString()}`}
            className="text-sm text-gray-900 whitespace-nowrap"
          />
        </td>
      )}
      {isColumnVisible('revenue') && (
        <td className="hidden sm:table-cell px-3 py-2">
          <InlineEdit
            value={getEffectiveValue('revenue') as number}
            onSave={(value) => onUpdateOverride(listing.id, 'revenue', value)}
            type="number"
            formatValue={(v) => `$${Number(v).toLocaleString()}`}
            className="text-sm text-gray-900 whitespace-nowrap"
          />
        </td>
      )}
      {isColumnVisible('ebitda') && (
        <td className="hidden sm:table-cell px-3 py-2">
          <InlineEdit
            value={getEffectiveValue('ebitda') as number}
            onSave={(value) => onUpdateOverride(listing.id, 'ebitda', value)}
            type="number"
            formatValue={(v) => `$${Number(v).toLocaleString()}`}
            className="text-sm text-gray-900 whitespace-nowrap"
          />
        </td>
      )}
      {isColumnVisible('multiple') && (
        <td className="hidden sm:table-cell px-3 py-2">
          <InlineEdit
            value={getEffectiveValue('selling_multiple') as number}
            onSave={(value) => onUpdateOverride(listing.id, 'selling_multiple', value)}
            type="number"
            formatValue={(v) => `${Number(v).toFixed(1)}x`}
            className="text-sm text-gray-900 whitespace-nowrap"
          />
        </td>
      )}
      {isColumnVisible('status') && (
        <td className="px-3 py-2">
          <SelectField
            value={dealTracker?.status || ''}
            options={STATUS_OPTIONS}
            onChange={(value) => onUpdate(listing.id, 'status', value)}
            getOptionColor={getStatusColor}
            className="w-full sm:w-auto"
          />
        </td>
      )}
      {isColumnVisible('next_steps') && (
        <td className="px-3 py-2">
          <SelectField
            value={dealTracker?.next_steps || ''}
            options={NEXT_STEPS_OPTIONS}
            onChange={(value) => onUpdate(listing.id, 'next_steps', value)}
            getOptionColor={getNextStepsColor}
            className="w-full sm:w-auto"
          />
        </td>
      )}
      {isColumnVisible('priority') && (
        <td className="px-3 py-2">
          <SelectField
            value={dealTracker?.priority || ''}
            options={PRIORITY_OPTIONS}
            onChange={(value) => onUpdate(listing.id, 'priority', value)}
            getOptionColor={getPriorityColor}
            className="w-full sm:w-auto"
          />
        </td>
      )}
      {isColumnVisible('notes') && (
        <td className="px-3 py-2">
          <div className="relative">
            {isEditingNotes ? (
              <textarea
                value={notesValue}
                onChange={handleNotesChange}
                onBlur={handleNotesBlur}
                onKeyDown={handleNotesKeyDown}
                className="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
                rows={3}
                placeholder="Add notes..."
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingNotes(true)}
                className={`text-left w-full text-sm ${
                  notesValue ? 'text-gray-900' : 'text-gray-500 italic'
                } hover:text-gray-700`}
              >
                {notesValue || 'Add notes...'}
              </button>
            )}
            {error && (
              <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
          </div>
        </td>
      )}
      {isColumnVisible('last_updated') && (
        <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-500">
          {dealTracker?.last_updated ? new Date(dealTracker.last_updated).toLocaleDateString() : '-'}
        </td>
      )}
      {isColumnVisible('source') && (
        <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-500">
          {listing.source_platform}
        </td>
      )}
      {isColumnVisible('added') && (
        <td className="hidden sm:table-cell px-3 py-2 text-sm text-gray-500">
          {dealTracker?.created_at ? new Date(dealTracker.created_at).toLocaleDateString() : '-'}
        </td>
      )}
    </tr>
  );
}
