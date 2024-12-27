"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';

const BUSINESS_MODELS = [
  "SaaS",
  "Marketplace",
  "Mobile App",
  "Shopify App",
  "Content",
  "Ecommerce",
  "Agency",
  "Other"
] as const;

const preferencesSchema = z.object({
  // Basic Preferences (required)
  min_price: z.number().min(0),
  max_price: z.number().min(0),
  industries: z.array(z.enum(["SaaS", "eCommerce", "Service", "Content", "Other"])).min(1),
  newsletter_frequency: z.enum(["daily", "weekly", "monthly"]),
  
  // Advanced Preferences (optional - null means "any")
  min_business_age: z.number().min(0).nullable().default(null),
  max_business_age: z.number().min(0).nullable().default(null),
  min_employees: z.number().min(0).nullable().default(null),
  max_employees: z.number().min(0).nullable().default(null),
  business_models: z.array(z.enum(BUSINESS_MODELS)).default([]), // Empty array means "all"
  min_profit_margin: z.number().min(0).max(100).nullable().default(null),
  max_profit_margin: z.number().min(0).max(100).nullable().default(null),
  min_selling_multiple: z.number().min(0).nullable().default(null),
  max_selling_multiple: z.number().min(0).nullable().default(null),
  min_annual_profit: z.number().min(0).nullable().default(null),
  max_annual_profit: z.number().min(0).nullable().default(null),
  min_annual_revenue: z.number().min(0).nullable().default(null),
  max_annual_revenue: z.number().min(0).nullable().default(null),
}).refine(
  (data) => {
    if (data.max_price && data.min_price) {
      return data.max_price > data.min_price;
    }
    return true;
  },
  {
    message: "Max price must be greater than min price",
    path: ["max_price"],
  }
).refine(
  (data) => {
    if (data.max_business_age && data.min_business_age) {
      return data.max_business_age >= data.min_business_age;
    }
    return true;
  },
  {
    message: "Max business age must be greater than or equal to min business age",
    path: ["max_business_age"],
  }
).refine(
  (data) => {
    if (data.max_employees && data.min_employees) {
      return data.max_employees >= data.min_employees;
    }
    return true;
  },
  {
    message: "Max employees must be greater than or equal to min employees",
    path: ["max_employees"],
  }
);

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const NEWSLETTER_OPTIONS = [
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      newsletter_frequency: "weekly",
      business_models: [],
      min_business_age: null,
      max_business_age: null,
      min_employees: null,
      max_employees: null,
      min_profit_margin: null,
      max_profit_margin: null,
      min_selling_multiple: null,
      max_selling_multiple: null,
      min_annual_profit: null,
      max_annual_profit: null,
      min_annual_revenue: null,
      max_annual_revenue: null,
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
            newsletter_frequency: data.newsletter_frequency || "weekly",
            business_models: data.business_models || [],
            min_business_age: data.min_business_age,
            max_business_age: data.max_business_age,
            min_employees: data.min_employees,
            max_employees: data.max_employees,
            min_profit_margin: data.min_profit_margin,
            max_profit_margin: data.max_profit_margin,
            min_selling_multiple: data.min_selling_multiple,
            max_selling_multiple: data.max_selling_multiple,
            min_annual_profit: data.min_annual_profit,
            max_annual_profit: data.max_annual_profit,
            min_annual_revenue: data.min_annual_revenue,
            max_annual_revenue: data.max_annual_revenue,
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

      const { error: upsertError } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            ...formData
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

  const RangeInput = ({ 
    label, 
    minName, 
    maxName, 
    placeholder = "Any",
    prefix = "$",
    suffix = "USD",
    step = "1"
  }: { 
    label: string;
    minName: keyof PreferencesFormData;
    maxName: keyof PreferencesFormData;
    placeholder?: string;
    prefix?: string;
    suffix?: string;
    step?: string;
  }) => (
    <div>
      <label className="text-base font-medium text-gray-900 mb-3 block">
        {label}
        <span className="text-sm font-normal text-gray-500 ml-2">(Leave empty for any)</span>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">{prefix}</span>
            </div>
            <input
              type="number"
              step={step}
              {...register(minName, { valueAsNumber: true })}
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder={placeholder}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">{suffix}</span>
            </div>
          </div>
          {errors[minName] && (
            <p className="mt-2 text-sm text-red-600">{errors[minName]?.message}</p>
          )}
        </div>
        <div>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">{prefix}</span>
            </div>
            <input
              type="number"
              step={step}
              {...register(maxName, { valueAsNumber: true })}
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder={placeholder}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">{suffix}</span>
            </div>
          </div>
          {errors[maxName] && (
            <p className="mt-2 text-sm text-red-600">{errors[maxName]?.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {isNewUser && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg">
          <h3 className="font-semibold">Welcome to DealSight!</h3>
          <p className="mt-1 text-sm">
            Set your preferences below to start receiving personalized deal alerts.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Preferences</h2>
          
          <div className="space-y-6">
            <RangeInput 
              label="Investment Range" 
              minName="min_price" 
              maxName="max_price"
              placeholder="1000000"
            />

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
              <div className="mt-2 grid grid-cols-3 gap-3">
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <button
            type="button"
            className="w-full px-6 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 focus:outline-none"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="flex items-center justify-between">
              <span>Advanced Filters</span>
              <svg
                className={`h-5 w-5 transform ${showAdvanced ? 'rotate-180' : ''} transition-transform`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {showAdvanced && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              <div className="text-sm text-gray-500 mb-4">
                Note: Empty fields will match all values. Adjust only the filters you want to specifically target.
              </div>
              
              <RangeInput 
                label="Business Age (Years)" 
                minName="min_business_age" 
                maxName="max_business_age"
                prefix=""
                suffix="Years"
              />

              <RangeInput 
                label="Number of Employees" 
                minName="min_employees" 
                maxName="max_employees"
                prefix=""
                suffix="People"
              />

              <RangeInput 
                label="Annual Revenue" 
                minName="min_annual_revenue" 
                maxName="max_annual_revenue"
              />

              <RangeInput 
                label="Annual Profit" 
                minName="min_annual_profit" 
                maxName="max_annual_profit"
              />

              <RangeInput 
                label="Profit Margin (%)" 
                minName="min_profit_margin" 
                maxName="max_profit_margin"
                prefix=""
                suffix="%"
                step="0.1"
              />

              <RangeInput 
                label="Selling Multiple" 
                minName="min_selling_multiple" 
                maxName="max_selling_multiple"
                prefix=""
                suffix="x"
                step="0.1"
              />

              <div>
                <label className="text-base font-medium text-gray-900 mb-3 block">
                  Business Models
                  <span className="text-sm font-normal text-gray-500 ml-2">(None selected means all)</span>
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {BUSINESS_MODELS.map((model) => (
                    <div key={model} className="relative flex items-center">
                      <div className="flex h-6 items-center">
                        <input
                          type="checkbox"
                          {...register('business_models')}
                          value={model}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label className="font-medium text-gray-900">{model}</label>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.business_models && (
                  <p className="mt-2 text-sm text-red-600">{errors.business_models.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving Changes...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
}

export default PreferencesForm; 