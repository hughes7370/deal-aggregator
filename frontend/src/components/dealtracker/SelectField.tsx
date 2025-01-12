'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
}

export default function SelectField({ value, onChange, options, className = '' }: SelectFieldProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full py-1.5 px-3 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${className}`}
      style={{ minWidth: '100px' }}
    >
      {options.map((option) => (
        <option 
          key={option} 
          value={option} 
          className="py-1 px-2 text-xs"
        >
          {option}
        </option>
      ))}
    </select>
  );
}
