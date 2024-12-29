'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import { ClockIcon, CurrencyDollarIcon, ChartBarIcon, ScaleIcon } from "@heroicons/react/24/outline";

export default function ROICalculator() {
  const [dealSize, setDealSize] = useState(1000000);
  const [dealsPerYear, setDealsPerYear] = useState(2);
  const [searchHoursPerDeal, setSearchHoursPerDeal] = useState(40);
  const [currentMultiple, setCurrentMultiple] = useState(3.5);
  const [analysisHours, setAnalysisHours] = useState(20);
  const [competitionLevel, setCompetitionLevel] = useState(3);
  const [missedDeals, setMissedDeals] = useState(1);

  // Calculate ROI metrics
  const hourlyRate = 150; // Assumed hourly rate for time value
  const avgSavingsPercent = 0.175; // 17.5% average savings through early access
  const timeSavedPercent = 0.8; // 80% time saved vs manual searching

  // Time savings calculations
  const annualTimeSaved = (searchHoursPerDeal + analysisHours) * dealsPerYear * timeSavedPercent;
  const timeSavingsValue = annualTimeSaved * hourlyRate;

  // Deal savings calculations
  const dealSavings = dealSize * dealsPerYear * avgSavingsPercent;

  // Missed opportunity calculations
  const avgMultipleReduction = 0.3; // Average multiple reduction through platform
  const multipleImprovement = currentMultiple - avgMultipleReduction;
  const multiplesSavings = dealSize * (currentMultiple - multipleImprovement);
  
  // Competition impact
  const competitionImpact = (competitionLevel / 5) * dealSize * 0.1; // Up to 10% premium due to competition
  
  // Missed deals impact
  const missedDealCost = missedDeals * dealSize * 0.15; // Assumed 15% growth opportunity lost

  const totalSavings = timeSavingsValue + dealSavings + multiplesSavings + competitionImpact + missedDealCost;
  const annualCost = 697 * 12; // Pro plan annual cost
  const netReturn = totalSavings - annualCost;
  const roi = (netReturn / annualCost) * 100;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900">ROI Calculator</h2>
          <p className="mt-4 text-xl text-gray-500">
            Calculate your potential savings and returns with DealSight
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Customize Your Calculation</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Deal Size
                </label>
                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="100000"
                  value={dealSize}
                  onChange={(e) => setDealSize(Number(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  ${dealSize.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Multiple Paid
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  step="0.1"
                  value={currentMultiple}
                  onChange={(e) => setCurrentMultiple(Number(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {currentMultiple}x multiple
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deals Per Year
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={dealsPerYear}
                  onChange={(e) => setDealsPerYear(Number(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {dealsPerYear} deals
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Search Hours Per Deal
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={searchHoursPerDeal}
                  onChange={(e) => setSearchHoursPerDeal(Number(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {searchHoursPerDeal} hours
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Hours Per Deal
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={analysisHours}
                  onChange={(e) => setAnalysisHours(Number(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {analysisHours} hours
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Level in Target Market
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={competitionLevel}
                  onChange={(e) => setCompetitionLevel(Number(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {['Very Low', 'Low', 'Medium', 'High', 'Very High'][competitionLevel - 1]}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Missed Deals Last Year
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={missedDeals}
                  onChange={(e) => setMissedDeals(Number(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {missedDeals} deals
                </p>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Potential Returns</h3>

            <div className="space-y-8">
              <div>
                <div className="flex items-center mb-2">
                  <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="text-lg font-medium text-gray-900">Time Savings</h4>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {Math.round(annualTimeSaved)} hours saved annually
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  ${Math.round(timeSavingsValue).toLocaleString()} value
                </p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="text-lg font-medium text-gray-900">Deal Savings</h4>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Through early access and multiple improvement
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${Math.round(dealSavings + multiplesSavings).toLocaleString()}
                </p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <ScaleIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <h4 className="text-lg font-medium text-gray-900">Competition & Opportunity</h4>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Value from reduced competition and missed deals
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  ${Math.round(competitionImpact + missedDealCost).toLocaleString()}
                </p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <ChartBarIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <h4 className="text-lg font-medium text-gray-900">Net Return</h4>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  After annual subscription cost
                </p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${Math.round(netReturn).toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  ROI: {Math.round(roi)}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="/sign-up"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
          >
            Start Your Free Trial
          </a>
        </motion.div>
      </div>
    </section>
  );
} 