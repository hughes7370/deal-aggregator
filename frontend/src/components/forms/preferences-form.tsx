"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { RangeSlider } from './range-slider';
import { ChevronDownIcon, ExclamationTriangleIcon, AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Define the schema for the form
const preferencesSchema = z.object({
  name: z.string().min(1, 'Alert name is required'),
  search_keywords: z.array(z.string()).default([]),
  search_match_type: z.enum(['any', 'all', 'exact']).default('any'),
  search_in: z.array(z.string()).default(['title', 'description']),
  exclude_keywords: z.array(z.string()).default([]),
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

const INDUSTRIES = [
  'SaaS',
  'E-commerce',
  'Digital Products',
  'Services',
  'Content',
  'Advertising',
  'Mobile Apps',
  'Other'
];

const BUSINESS_MODELS = [
  'Subscription',
  'Marketplace',
  'Agency',
  'E-commerce',
  'Advertising',
  'Consulting',
  'Software Licensing'
];

export default function PreferencesForm() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const alertId = searchParams.get('id');
  const isCreating = searchParams.get('action') === 'create';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedBusinessModels, setSelectedBusinessModels] = useState<string[]>([]);
  const [showKeywordSearch, setShowKeywordSearch] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [excludeKeywordsInput, setExcludeKeywordsInput] = useState('');

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
      search_keywords: [],
      search_match_type: 'any',
      search_in: ['title', 'description'],
      exclude_keywords: [],
      min_price: null,
      max_price: null,
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

  // Fetch alert data if editing
  useEffect(() => {
    const fetchAlert = async () => {
      if (!user || !alertId) return;

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', alertId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching alert:', error);
        return;
      }

      if (data) {
        reset(data);
        // Set the keywords input values
        setKeywordsInput(data.search_keywords?.join(', ') || '');
        setExcludeKeywordsInput(data.exclude_keywords?.join(', ') || '');
        
        // Show advanced section if any advanced fields are set
        if (
          data.min_business_age !== null ||
          data.max_business_age !== null ||
          data.min_employees !== null ||
          data.max_employees !== null ||
          data.min_profit_margin !== null ||
          data.max_profit_margin !== null ||
          data.min_selling_multiple !== null ||
          data.max_selling_multiple !== null ||
          data.min_ebitda !== null ||
          data.max_ebitda !== null ||
          data.min_annual_revenue !== null ||
          data.max_annual_revenue !== null ||
          (data.preferred_business_models && data.preferred_business_models.length > 0)
        ) {
          setShowAdvanced(true);
        }
        // Show keyword search section if any search fields are set
        if (
          (data.search_keywords && data.search_keywords.length > 0) ||
          (data.exclude_keywords && data.exclude_keywords.length > 0) ||
          data.search_match_type !== 'any' ||
          (data.search_in && data.search_in.length > 0 && 
           JSON.stringify(data.search_in) !== JSON.stringify(['title', 'description']))
        ) {
          setShowKeywordSearch(true);
        }
      }
    };

    fetchAlert();
  }, [user, alertId, reset]);

  const onSubmit = async (data: PreferencesFormData) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      let result;
      
      if (alertId) {
        // Update existing alert
        result = await supabase
          .from('alerts')
          .update(data)
          .eq('id', alertId)
          .eq('user_id', user.id);
      } else {
        // Create new alert
        result = await supabase
          .from('alerts')
          .insert([{ ...data, user_id: user.id }]);
      }

      if (result.error) throw result.error;
      
      // Only redirect after successful operation
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
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
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
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

      {/* Newsletter Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Alert Frequency
        </label>
        <select
          {...register('newsletter_frequency')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="instantly">Instantly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Primary Filters Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center">
          <AdjustmentsHorizontalIcon className="h-6 w-6 mr-2" />
          Primary Filters
        </h2>
        <p className="text-sm text-gray-600">
          Listings that match your basic criteria will appear here.
        </p>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price Range (USD)
          </label>
          <RangeSlider
            min={0}
            max={10000000}
            step={10000}
            value={[watch('min_price') || 0, watch('max_price') || 10000000]}
            onValueChange={([min, max]) => {
              setValue('min_price', min);
              setValue('max_price', max);
            }}
            formatValue={(value) => `$${value.toLocaleString()}`}
          />
        </div>

        {/* Industries */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Target Industries
          </label>
          <div className="mb-2">
            <button
              type="button"
              onClick={() => {
                setSelectedIndustries(INDUSTRIES);
                setValue('industries', INDUSTRIES);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Select All Industries
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {INDUSTRIES.map((industry) => (
              <label key={industry} className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={industry}
                  checked={selectedIndustries.includes(industry)}
                  onChange={(e) => {
                    const updatedIndustries = e.target.checked
                      ? [...selectedIndustries, industry]
                      : selectedIndustries.filter(i => i !== industry);
                    setSelectedIndustries(updatedIndustries);
                    setValue('industries', updatedIndustries);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{industry}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Exact Filters Section */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center">
            <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
            Exact Filters
          </h2>
          <div className="group relative">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 cursor-help" />
            <div className="hidden group-hover:block absolute left-0 top-6 w-72 p-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <p className="text-sm text-gray-600">
                We strongly recommend using Exact Filters selectively because not all listings contain complete information and vary based on the broker site.
              </p>
            </div>
          </div>
        </div>

        {/* Keyword Search Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowKeywordSearch(!showKeywordSearch)}
            className="inline-flex items-center text-sm font-medium text-gray-700"
          >
            <ChevronDownIcon
              className={`h-5 w-5 mr-1 transform transition-transform ${showKeywordSearch ? 'rotate-180' : ''}`}
            />
            Keyword Search
          </button>
        </div>

        {/* Keyword Search Section */}
        {showKeywordSearch && (
          <div className="space-y-6 border-l-2 border-blue-100 pl-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Keywords
              </label>
              <input
                type="text"
                placeholder="e.g., SaaS, subscription, B2B"
                className="mt-1 block w-full h-10 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={keywordsInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setKeywordsInput(value);
                  const keywords = value
                    .split(',')
                    .map(k => k.trim())
                    .filter(k => k.length > 0);
                  setValue('search_keywords', keywords);
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter multiple keywords separated by commas. Use quotes for exact phrases.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Type
                </label>
                <div className="space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="any"
                      {...register('search_match_type')}
                      className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Any of these words</span>
                  </label>
                  <br />
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="all"
                      {...register('search_match_type')}
                      className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All of these words</span>
                  </label>
                  <br />
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="exact"
                      {...register('search_match_type')}
                      className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Exact phrase only</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search In
                </label>
                <div className="space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value="title"
                      defaultChecked
                      onChange={(e) => {
                        const currentFields = watch('search_in');
                        const newFields = e.target.checked
                          ? [...currentFields, 'title']
                          : currentFields.filter(f => f !== 'title');
                        setValue('search_in', newFields);
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Title</span>
                  </label>
                  <br />
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value="description"
                      defaultChecked
                      onChange={(e) => {
                        const currentFields = watch('search_in');
                        const newFields = e.target.checked
                          ? [...currentFields, 'description']
                          : currentFields.filter(f => f !== 'description');
                        setValue('search_in', newFields);
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Description</span>
                  </label>
                  <br />
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value="location"
                      onChange={(e) => {
                        const currentFields = watch('search_in');
                        const newFields = e.target.checked
                          ? [...currentFields, 'location']
                          : currentFields.filter(f => f !== 'location');
                        setValue('search_in', newFields);
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Location</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Exclude Keywords
              </label>
              <input
                type="text"
                placeholder="e.g., agency, consulting"
                className="mt-1 block w-full h-10 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={excludeKeywordsInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setExcludeKeywordsInput(value);
                  const keywords = value
                    .split(',')
                    .map(k => k.trim())
                    .filter(k => k.length > 0);
                  setValue('exclude_keywords', keywords);
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter keywords to exclude, separated by commas
              </p>
            </div>
          </div>
        )}

        {/* Advanced Filters Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center text-sm font-medium text-gray-700"
          >
            <ChevronDownIcon
              className={`h-5 w-5 mr-1 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            />
            Advanced Filters
          </button>
        </div>

        {/* Advanced Filters Section */}
        {showAdvanced && (
          <div className="space-y-8 border-l-2 border-blue-100 pl-4">
            {/* Business Models */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Business Models
              </label>
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBusinessModels(BUSINESS_MODELS);
                    setValue('preferred_business_models', BUSINESS_MODELS);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All Business Models
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {BUSINESS_MODELS.map((model) => (
                  <label key={model} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={model}
                      checked={selectedBusinessModels.includes(model)}
                      onChange={(e) => {
                        const updatedModels = e.target.checked
                          ? [...selectedBusinessModels, model]
                          : selectedBusinessModels.filter(m => m !== model);
                        setSelectedBusinessModels(updatedModels);
                        setValue('preferred_business_models', updatedModels);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{model}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Business Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Age (Years)
              </label>
              <RangeSlider
                min={0}
                max={50}
                step={1}
                value={[watch('min_business_age') || 0, watch('max_business_age') || 50]}
                onValueChange={([min, max]) => {
                  setValue('min_business_age', min);
                  setValue('max_business_age', max === 50 ? null : max);
                }}
                formatValue={(value) => value === 50 ? `${value}+ years` : `${value} years`}
              />
            </div>

            {/* Number of Employees */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Employees
              </label>
              <RangeSlider
                min={0}
                max={1000}
                step={5}
                value={[watch('min_employees') || 0, watch('max_employees') || 1000]}
                onValueChange={([min, max]) => {
                  setValue('min_employees', min);
                  setValue('max_employees', max === 1000 ? null : max);
                }}
                formatValue={(value) => value === 1000 ? `${value}+ employees` : `${value} employees`}
              />
            </div>

            {/* Annual Revenue */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Annual Revenue (USD)
              </label>
              <RangeSlider
                min={0}
                max={10000000}
                step={100000}
                value={[watch('min_annual_revenue') || 0, watch('max_annual_revenue') || 10000000]}
                onValueChange={([min, max]) => {
                  setValue('min_annual_revenue', min);
                  setValue('max_annual_revenue', max === 10000000 ? null : max);
                }}
                formatValue={(value) => value === 10000000 ? `$${(value/1000000).toFixed(0)}M+` : `$${value.toLocaleString()}`}
              />
            </div>

            {/* Annual EBITDA */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Annual EBITDA (USD)
              </label>
              <RangeSlider
                min={0}
                max={5000000}
                step={50000}
                value={[watch('min_ebitda') || 0, watch('max_ebitda') || 5000000]}
                onValueChange={([min, max]) => {
                  setValue('min_ebitda', min);
                  setValue('max_ebitda', max === 5000000 ? null : max);
                }}
                formatValue={(value) => value === 5000000 ? `$${(value/1000000).toFixed(0)}M+` : `$${value.toLocaleString()}`}
              />
            </div>

            {/* Profit Margin */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profit Margin (%)
              </label>
              <RangeSlider
                min={0}
                max={100}
                step={1}
                value={[watch('min_profit_margin') || 0, watch('max_profit_margin') || 100]}
                onValueChange={([min, max]) => {
                  setValue('min_profit_margin', min);
                  setValue('max_profit_margin', max === 100 ? null : max);
                }}
                formatValue={(value) => value === 100 ? `${value}%+` : `${value}%`}
              />
            </div>

            {/* Selling Multiple */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Selling Multiple
              </label>
              <RangeSlider
                min={0}
                max={20}
                step={0.1}
                value={[watch('min_selling_multiple') || 0, watch('max_selling_multiple') || 20]}
                onValueChange={([min, max]) => {
                  setValue('min_selling_multiple', min);
                  setValue('max_selling_multiple', max === 20 ? null : max);
                }}
                formatValue={(value) => value === 20 ? `${value}x+` : `${value}x`}
              />
            </div>
          </div>
        )}
      </div>

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