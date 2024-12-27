"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import * as Slider from '@radix-ui/react-slider';

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
  preferred_business_models: z.array(z.enum(BUSINESS_MODELS)).default([]), // Empty array means "all"
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

const RangeSlider = ({ 
  label, 
  minName, 
  maxName, 
  minValue,
  maxValue,
  step = 1,
  formatValue = (value: number) => value.toString(),
  suffix = "",
  register,
  setValue,
  watch
}: { 
  label: string;
  minName: keyof PreferencesFormData;
  maxName: keyof PreferencesFormData;
  minValue: number;
  maxValue: number;
  step?: number;
  formatValue?: (value: number) => string;
  suffix?: string;
  register: any;
  setValue: any;
  watch: any;
}) => {
  const minWatch = watch(minName) ?? minValue;
  const maxWatch = watch(maxName) ?? maxValue;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-base font-medium text-gray-900">
          {label}
          <span className="text-sm font-normal text-gray-500 ml-2">(Drag to adjust)</span>
        </label>
        <div className="text-sm text-gray-600">
          {formatValue(minWatch)}{suffix} - {formatValue(maxWatch)}{suffix}
        </div>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[minWatch, maxWatch]}
        min={minValue}
        max={maxValue}
        step={step}
        onValueChange={([min, max]) => {
          setValue(minName, min);
          setValue(maxName, max);
        }}
      >
        <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
          <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Min value"
        />
        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Max value"
        />
      </Slider.Root>
    </div>
  );
};

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
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      min_price: 0,
      max_price: 0,
      industries: [],
      newsletter_frequency: "weekly",
      preferred_business_models: [],
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
            preferred_business_models: data.preferred_business_models || [],
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
            <RangeSlider 
              label="Investment Range" 
              minName="min_price" 
              maxName="max_price"
              minValue={0}
              maxValue={1000000}
              step={1}
              formatValue={(value) => `$${value.toFixed(0)}`}
              register={register}
              setValue={setValue}
              watch={watch}
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
            <div className="p-6 border-t border-gray-200 space-y-8">
              <div className="text-sm text-gray-500 mb-4">
                Note: Drag the sliders to set your preferred ranges. Leave at default values to match all listings.
              </div>
              
              <RangeSlider 
                label="Business Age"
                minName="min_business_age"
                maxName="max_business_age"
                minValue={0}
                maxValue={20}
                step={1}
                formatValue={(value) => `${value} years`}
                register={register}
                setValue={setValue}
                watch={watch}
              />

              <RangeSlider 
                label="Number of Employees"
                minName="min_employees"
                maxName="max_employees"
                minValue={0}
                maxValue={100}
                step={1}
                formatValue={(value) => `${value}`}
                register={register}
                setValue={setValue}
                watch={watch}
              />

              <RangeSlider 
                label="Annual Revenue"
                minName="min_annual_revenue"
                maxName="max_annual_revenue"
                minValue={0}
                maxValue={10000000}
                step={100000}
                formatValue={(value) => `$${(value / 1000000).toFixed(1)}M`}
                register={register}
                setValue={setValue}
                watch={watch}
              />

              <RangeSlider 
                label="Annual Profit"
                minName="min_annual_profit"
                maxName="max_annual_profit"
                minValue={0}
                maxValue={5000000}
                step={50000}
                formatValue={(value) => `$${(value / 1000000).toFixed(1)}M`}
                register={register}
                setValue={setValue}
                watch={watch}
              />

              <RangeSlider 
                label="Profit Margin"
                minName="min_profit_margin"
                maxName="max_profit_margin"
                minValue={0}
                maxValue={100}
                step={1}
                formatValue={(value) => `${value}%`}
                suffix="%"
                register={register}
                setValue={setValue}
                watch={watch}
              />

              <RangeSlider 
                label="Selling Multiple"
                minName="min_selling_multiple"
                maxName="max_selling_multiple"
                minValue={0}
                maxValue={10}
                step={0.1}
                formatValue={(value) => `${value}x`}
                suffix="x"
                register={register}
                setValue={setValue}
                watch={watch}
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
                          {...register('preferred_business_models')}
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
                {errors.preferred_business_models && (
                  <p className="mt-2 text-sm text-red-600">{errors.preferred_business_models.message}</p>
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