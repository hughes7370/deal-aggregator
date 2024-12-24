"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';

const preferencesSchema = z.object({
  min_price: z.number().min(0),
  max_price: z.number().min(0),
  industries: z.array(z.enum(["SaaS", "eCommerce", "Service", "Content", "Other"])).min(1),
  newsletter_frequency: z.enum(["instant", "daily", "weekly", "monthly"]),
}).refine((data) => data.max_price > data.min_price, {
  message: "Max price must be greater than min price",
  path: ["max_price"],
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const NEWSLETTER_OPTIONS = [
  { value: "instant", label: "Instant" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

export function PreferencesForm() {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      min_price: 0,
      max_price: 0,
      industries: [],
      newsletter_frequency: "weekly"
    }
  });

  useEffect(() => {
    async function fetchPreferences() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setIsNewUser(true);
          } else {
            console.error('Fetch error:', fetchError);
            setError('An error occurred while loading your preferences');
          }
          return;
        }

        if (data) {
          reset({
            min_price: data.min_price,
            max_price: data.max_price,
            industries: data.industries,
            newsletter_frequency: data.newsletter_frequency || "weekly"
          });
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('An error occurred while loading your preferences');
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [userId, reset]);

  const onSubmit = async (formData: PreferencesFormData) => {
    if (!userId) {
      setError('You must be logged in to save preferences');
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      console.log('Submitting preferences:', { userId, ...formData });

      const { error: upsertError } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            min_price: formData.min_price,
            max_price: formData.max_price,
            industries: formData.industries,
            newsletter_frequency: formData.newsletter_frequency
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        );

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        setError(upsertError.message);
        return;
      }

      setSuccessMessage('Preferences saved successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      console.log('Preferences saved successfully');
      router.refresh();
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {isNewUser && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg">
          <div className="flex items-start">
            <svg className="h-6 w-6 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold">Welcome to DealSight!</h3>
              <p className="mt-1 text-sm">
                Set your preferences below to start receiving personalized deal alerts. We'll notify you when we find matches that meet your criteria.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="text-base font-medium text-gray-900 mb-3 block">Investment Range</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  {...register('min_price', { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="0"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              {errors.min_price && (
                <p className="mt-2 text-sm text-red-600">{errors.min_price.message}</p>
              )}
            </div>
            <div>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  {...register('max_price', { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="1000000"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              {errors.max_price && (
                <p className="mt-2 text-sm text-red-600">{errors.max_price.message}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="text-base font-medium text-gray-900 mb-3 block">Industries</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["SaaS", "eCommerce", "Service", "Content", "Other"].map((industry) => (
              <div key={industry} className="relative flex items-center">
                <div className="flex h-6 items-center">
                  <input
                    type="checkbox"
                    {...register('industries')}
                    value={industry}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label className="font-medium text-gray-900">{industry}</label>
                </div>
              </div>
            ))}
          </div>
          {errors.industries && (
            <p className="mt-2 text-sm text-red-600">{errors.industries.message}</p>
          )}
        </div>

        <div>
          <label className="text-base font-medium text-gray-900 mb-3 block">Alert Frequency</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NEWSLETTER_OPTIONS.map(option => (
              <div key={option.value} className="flex">
                <input
                  type="radio"
                  {...register('newsletter_frequency')}
                  value={option.value}
                  id={option.value}
                  className="peer hidden"
                />
                <label
                  htmlFor={option.value}
                  className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white p-3 text-gray-600 hover:bg-gray-50 peer-checked:border-blue-600 peer-checked:text-blue-600 cursor-pointer"
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              </div>
            ))}
          </div>
          {errors.newsletter_frequency && (
            <p className="mt-2 text-sm text-red-600">{errors.newsletter_frequency.message}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Choose how often you want to receive deal notifications
          </p>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-150"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Changes...
            </span>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </form>
  );
}

export default PreferencesForm; 