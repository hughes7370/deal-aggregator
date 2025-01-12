'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import SelectField from './SelectField';
import Link from 'next/link';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DealRowProps {
  listing: {
    id: string;
    title: string;
    asking_price: number;
    business_model: string;
    source_platform: string;
  };
  dealTracker: {
    id?: string;
    status?: string;
    next_steps?: string;
    priority?: string;
    notes?: string;
    last_updated?: string;
    custom_business_name?: string;
    custom_asking_price?: number;
  } | null;
  onUpdate: (listingId: string, field: string, value: string | number) => void;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  statusColor: string;
}

export default function DealRow({
  listing,
  dealTracker,
  onUpdate,
  isSelected,
  onSelect,
  statusColor,
}: DealRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempName, setTempName] = useState(dealTracker?.custom_business_name || listing.title);
  const [tempPrice, setTempPrice] = useState(dealTracker?.custom_asking_price?.toString() || listing.asking_price.toString());

  const handleSaveName = () => {
    onUpdate(listing.id, 'custom_business_name', tempName);
    setIsEditingName(false);
  };

  const handleSavePrice = () => {
    const numericPrice = parseFloat(tempPrice);
    if (!isNaN(numericPrice)) {
      onUpdate(listing.id, 'custom_asking_price', numericPrice);
    }
    setIsEditingPrice(false);
  };

  const handleCancelEdit = (field: 'name' | 'price') => {
    if (field === 'name') {
      setTempName(dealTracker?.custom_business_name || listing.title);
      setIsEditingName(false);
    } else {
      setTempPrice(dealTracker?.custom_asking_price?.toString() || listing.asking_price.toString());
      setIsEditingPrice(false);
    }
  };

  return (
    <tr className={isSelected ? 'bg-gray-50' : undefined}>
      <td className="w-8 px-2 py-4">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
        />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
        {isEditingName ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
            <button onClick={handleSaveName} className="text-green-600 hover:text-green-700">
              <CheckIcon className="h-5 w-5" />
            </button>
            <button onClick={() => handleCancelEdit('name')} className="text-red-600 hover:text-red-700">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>{dealTracker?.custom_business_name || listing.title}</span>
            <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-gray-500">
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
        {isEditingPrice ? (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
            <button onClick={handleSavePrice} className="text-green-600 hover:text-green-700">
              <CheckIcon className="h-5 w-5" />
            </button>
            <button onClick={() => handleCancelEdit('price')} className="text-red-600 hover:text-red-700">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>{formatPrice(dealTracker?.custom_asking_price || listing.asking_price)}</span>
            <button onClick={() => setIsEditingPrice(true)} className="text-gray-400 hover:text-gray-500">
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColor}`}>
          {dealTracker?.status || 'Interested'}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
        {dealTracker?.next_steps || 'Review Listing'}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
        {dealTracker?.priority || 'Medium'}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
        {dealTracker?.notes || '-'}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
        {dealTracker?.last_updated ? new Date(dealTracker.last_updated).toLocaleDateString() : '-'}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
        <Link href={`/listings/${listing.id}`} className="text-blue-600 hover:text-blue-900">
          {listing.source_platform}
        </Link>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
        {dealTracker?.last_updated ? new Date(dealTracker.last_updated).toLocaleDateString() : '-'}
      </td>
    </tr>
  );
}
