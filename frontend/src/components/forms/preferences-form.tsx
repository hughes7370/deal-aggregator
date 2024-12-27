"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { RangeSlider } from './range-slider';

// Define the schema for the form
const preferencesSchema = z.object({
  name: z.string().min(1, 'Alert name is required'),
  min_price: z.number().min(0).nullable(),
  max_price: z.number().min(0).nullable(),
  industries: z.array(z.string()),
  newsletter_frequency: z.enum(['instantly', 'daily', 'weekly', 'monthly']),
  preferred_business_models: z.array(z.string()),
  min_business_age: z.number().min(0).nullable(),
  max_business_age: z.number().nullable(),
  min_employees: z.number().min(0).nullable(),
  max_employees: z.number().nullable(),
  min_profit_margin: z.number().min(0).nullable(),
  max_profit_margin: z.number().nullable(),
  min_selling_multiple: z.number().min(0).nullable(),
  max_selling_multiple: z.number().nullable(),
  min_ebitda: z.number().min(0).nullable(),
  max_ebitda: z.number().nullable(),
  min_annual_revenue: z.number().min(0).nullable(),
  max_annual_revenue: z.number().nullable(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

export default function PreferencesForm() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const alertId = searchParams.get('id');
  const isCreating = searchParams.get('action') === 'create';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAlerts, setExistingAlerts] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      name: '',
      min_price: 0,
      max_price: 0,
      industries: [],
      newsletter_frequency: 'weekly',
      preferred_business_models: [],
      min_business_age: null,
      max_business_age: null,
      min_employees: null,
      max_employees: null,
      min_profit_margin: null,
      max_profit_margin: null,
      min_selling_multiple: null,
      max_selling_multiple: null,
      min_ebitda: null,
      max_ebitda: null,
      min_annual_revenue: null,
      max_annual_revenue: null,
    }
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch existing alerts for the dropdown
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }

      setExistingAlerts(data || []);

      // If editing an existing alert, load its data
      if (alertId) {
        const alert = data?.find(a => a.id === alertId);
        if (alert) {
          reset(alert);
        }
      }
    };

    fetchAlerts();
  }, [user, alertId]);

  const onSubmit = async (data: PreferencesFormData) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      if (alertId) {
        // Update existing alert
        const { error } = await supabase
          .from('alerts')
          .update(data)
          .eq('id', alertId);

        if (error) throw error;
      } else {
        // Create new alert
        const { error } = await supabase
          .from('alerts')
          .insert([{ ...data, user_id: user.id }]);

        if (error) throw error;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!alertId || !confirm('Are you sure you want to delete this alert?')) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Alert Selection */}
      {!isCreating && existingAlerts.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Alert to Edit
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => {
              if (e.target.value) {
                router.push(`/dashboard/preferences?id=${e.target.value}`);
              }
            }}
            value={alertId || ''}
          >
            <option value="">Select an alert</option>
            {existingAlerts.map((alert) => (
              <option key={alert.id} value={alert.id}>
                {alert.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Alert Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Alert Name
        </label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., High Margin SaaS"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Rest of the existing form fields... */}

      <div className="flex justify-between pt-8">
        <div>
          {alertId && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Alert
            </button>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : alertId ? 'Update Alert' : 'Create Alert'}
          </button>
        </div>
      </div>
    </form>
  );
} 