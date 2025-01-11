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
      className={`block w-full py-2 px-3 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm ${className}`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
