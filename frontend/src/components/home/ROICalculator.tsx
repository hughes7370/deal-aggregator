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
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-blue-600">
            ROI Calculator
          </h2>
          <p className="mt-4 text-xl text-gray-600">
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
            className="bg-white rounded-2xl shadow-sm p-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-8">Customize Your Calculation</h3>

            <div className="space-y-8">
              {[
                {
                  label: "Average Deal Size",
                  value: dealSize,
                  setValue: setDealSize,
                  min: 100000,
                  max: 5000000,
                  step: 100000,
                  format: (v: number) => `$${v.toLocaleString()}`,
                  icon: CurrencyDollarIcon
                },
                {
                  label: "Current Multiple Paid",
                  value: currentMultiple,
                  setValue: setCurrentMultiple,
                  min: 2,
                  max: 6,
                  step: 0.1,
                  format: (v: number) => `${v}x multiple`,
                  icon: ChartBarIcon
                },
                {
                  label: "Deals Per Year",
                  value: dealsPerYear,
                  setValue: setDealsPerYear,
                  min: 1,
                  max: 10,
                  step: 1,
                  format: (v: number) => `${v} deals`,
                  icon: ScaleIcon
                },
                {
                  label: "Current Search Hours Per Deal",
                  value: searchHoursPerDeal,
                  setValue: setSearchHoursPerDeal,
                  min: 10,
                  max: 100,
                  step: 5,
                  format: (v: number) => `${v} hours`,
                  icon: ClockIcon
                },
                {
                  label: "Analysis Hours Per Deal",
                  value: analysisHours,
                  setValue: setAnalysisHours,
                  min: 5,
                  max: 50,
                  step: 5,
                  format: (v: number) => `${v} hours`,
                  icon: ClockIcon
                },
                {
                  label: "Competition Level in Target Market",
                  value: competitionLevel,
                  setValue: setCompetitionLevel,
                  min: 1,
                  max: 5,
                  step: 1,
                  format: (v: number) => ['Very Low', 'Low', 'Medium', 'High', 'Very High'][v - 1],
                  icon: ChartBarIcon
                },
                {
                  label: "Missed Deals Last Year",
                  value: missedDeals,
                  setValue: setMissedDeals,
                  min: 0,
                  max: 5,
                  step: 1,
                  format: (v: number) => `${v} deals`,
                  icon: ScaleIcon
                }
              ].map((input, index) => (
                <div key={input.label} className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <input.icon className="w-5 h-5 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">
                      {input.label}
                    </label>
                  </div>
                  <input
                    type="range"
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    value={input.value}
                    onChange={(e) => input.setValue(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="mt-2 text-sm font-medium text-blue-600">
                    {input.format(input.value)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-8 lg:sticky lg:top-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-8">Your Potential Returns</h3>

            <div className="space-y-6">
              {[
                {
                  icon: ClockIcon,
                  title: "Time Savings",
                  description: `${Math.round(annualTimeSaved)} hours saved annually`,
                  value: timeSavingsValue,
                  color: "blue"
                },
                {
                  icon: CurrencyDollarIcon,
                  title: "Deal Savings",
                  description: "Through early access and multiple improvement",
                  value: dealSavings + multiplesSavings,
                  color: "green"
                },
                {
                  icon: ScaleIcon,
                  title: "Competition & Opportunity",
                  description: "Value from reduced competition and missed deals",
                  value: competitionImpact + missedDealCost,
                  color: "purple"
                }
              ].map((result) => (
                <div
                  key={result.title}
                  className={`bg-${result.color}-50 rounded-xl p-6 transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <result.icon className={`h-6 w-6 text-${result.color}-600`} />
                    <h4 className="text-lg font-medium text-gray-900">{result.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {result.description}
                  </p>
                  <p className={`text-2xl font-bold text-${result.color}-600`}>
                    ${Math.round(result.value).toLocaleString()}
                  </p>
                </div>
              ))}

              {/* Total ROI */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                    <h4 className="text-lg font-medium text-gray-900">Annual ROI</h4>
                  </div>
                  <span className="text-sm text-gray-500">
                    Based on ${annualCost.toLocaleString()} annual investment
                  </span>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
                  <p className="text-sm text-blue-100 mb-1">Net Return</p>
                  <p className="text-3xl font-bold">${Math.round(netReturn).toLocaleString()}</p>
                  <p className="text-sm text-blue-100 mt-2">
                    {Math.round(roi)}% Return on Investment
                  </p>
                </div>
              </div>

              <motion.a
                href="/sign-up"
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free Trial
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 