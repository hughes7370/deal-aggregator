'use client';

import { useState, useEffect, useRef } from 'react';

interface InlineEditProps {
  value: string | number;
  onSave: (value: string | number) => Promise<void>;
  type?: 'text' | 'number';
  className?: string;
  formatValue?: (value: any) => string;
  placeholder?: string;
}

export default function InlineEdit({
  value,
  onSave,
  type = 'text',
  className = '',
  formatValue = (v) => String(v),
  placeholder = 'Click to edit'
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving value:', error);
      setError('Failed to save. Please try again.');
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value);
      setError(null);
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className={`w-full p-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isSaving ? 'bg-gray-50 cursor-wait' : ''
          } ${error ? 'border-red-300 focus:ring-red-500' : ''} ${className}`}
        />
        {isSaving && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <span className="text-xs text-gray-500">Saving...</span>
          </div>
        )}
        {error && (
          <div className="absolute -bottom-5 left-0 right-0">
            <span className="text-xs text-red-500">{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => !isSaving && setIsEditing(true)}
      className={`cursor-text hover:bg-gray-50 rounded p-1 ${className} ${
        isSaving ? 'cursor-wait opacity-50' : ''
      }`}
    >
      {value ? formatValue(value) : <span className="text-gray-400 italic">{placeholder}</span>}
    </div>
  );
} 