'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Home, Percent, BarChart3 } from 'lucide-react';

interface ROICalculation {
  monthlyRentalIncome: number;
  annualRentalIncome: number;
  annualExpenses: number;
  netOperatingIncome: number;
  cashOnCashReturn: number;
  capRate: number;
  totalROI: number;
  breakEvenMonths: number;
  fiveYearProjection: number;
}

interface PropertyInputs {
  purchasePrice: number;
  downPayment: number;
  closingCosts: number;
  renovationCosts: number;
  monthlyRent: number;
  monthlyExpenses: number;
  propertyTaxes: number;
  insurance: number;
  managementFee: number;
  vacancy: number;
  appreciation: number;
}

const ROICalculator = () => {
  const [inputs, setInputs] = useState<PropertyInputs>({
    purchasePrice: 450000,
    downPayment: 90000, // 20%
    closingCosts: 9000, // 2%
    renovationCosts: 15000,
    monthlyRent: 3200,
    monthlyExpenses: 800,
    propertyTaxes: 9000, // 2% annually
    insurance: 2400, // $200/month
    managementFee: 320, // 10% of rent
    vacancy: 5, // 5% vacancy rate
    appreciation: 4.5 // 4.5% annual appreciation
  });

  const [calculation, setCalculation] = useState<ROICalculation | null>(null);

  const houstonMarketData = {
    averageRent: 3100,
    averagePrice: 485000,
    averageAppreciation: 4.2,
    capRateRange: '6.5% - 8.5%',
    vacancyRate: 4.8,
    propertyTaxRate: 2.0
  };

  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const calculateROI = () => {
    const {
      purchasePrice,
      downPayment,
      closingCosts,
      renovationCosts,
      monthlyRent,
      monthlyExpenses,
      propertyTaxes,
      insurance,
      managementFee,
      vacancy,
      appreciation
    } = inputs;

    // Calculate total cash invested
    const totalCashInvested = downPayment + closingCosts + renovationCosts;

    // Calculate annual income (accounting for vacancy)
    const annualRentalIncome = monthlyRent * 12 * (1 - vacancy / 100);

    // Calculate annual expenses
    const annualExpenses = 
      (monthlyExpenses * 12) + 
      propertyTaxes + 
      insurance + 
      (managementFee * 12);

    // Net Operating Income
    const netOperatingIncome = annualRentalIncome - annualExpenses;

    // Cash-on-Cash Return
    const cashOnCashReturn = (netOperatingIncome / totalCashInvested) * 100;

    // Cap Rate
    const capRate = (netOperatingIncome / purchasePrice) * 100;

    // Total ROI (including appreciation)
    const appreciationValue = purchasePrice * (appreciation / 100);
    const totalROI = ((netOperatingIncome + appreciationValue) / totalCashInvested) * 100;

    // Break-even calculation
    const breakEvenMonths = totalCashInvested / (netOperatingIncome / 12);

    // 5-year projection
    const fiveYearValue = purchasePrice * Math.pow(1 + appreciation / 100, 5);
    const fiveYearEquity = fiveYearValue - (purchasePrice - downPayment); // Assuming loan paydown
    const fiveYearCashFlow = netOperatingIncome * 5;
    const fiveYearProjection = ((fiveYearEquity + fiveYearCashFlow - totalCashInvested) / totalCashInvested) * 100;

    setCalculation({
      monthlyRentalIncome: monthlyRent * (1 - vacancy / 100),
      annualRentalIncome,
      annualExpenses,
      netOperatingIncome,
      cashOnCashReturn,
      capRate,
      totalROI,
      breakEvenMonths,
      fiveYearProjection
    });
  };

  const updateInput = (field: keyof PropertyInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getROIStatus = (roi: number) => {
    if (roi >= 15) return { color: 'text-green-400', label: 'Excellent' };
    if (roi >= 10) return { color: 'text-blue-400', label: 'Good' };
    if (roi >= 5) return { color: 'text-yellow-400', label: 'Fair' };
    return { color: 'text-red-400', label: 'Poor' };
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center space-x-3 mb-8">
        <Calculator className="w-8 h-8 text-emerald-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Houston ROI Calculator</h2>
          <p className="text-emerald-300">Calculate your real estate investment returns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-emerald-400" />
              Property Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Purchase Price
                </label>
                <input
                  type="number"
                  value={inputs.purchasePrice}
                  onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Down Payment
                </label>
                <input
                  type="number"
                  value={inputs.downPayment}
                  onChange={(e) => updateInput('downPayment', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Closing Costs
                </label>
                <input
                  type="number"
                  value={inputs.closingCosts}
                  onChange={(e) => updateInput('closingCosts', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Renovation Costs
                </label>
                <input
                  type="number"
                  value={inputs.renovationCosts}
                  onChange={(e) => updateInput('renovationCosts', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-emerald-400" />
              Income & Expenses
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Monthly Rent
                </label>
                <input
                  type="number"
                  value={inputs.monthlyRent}
                  onChange={(e) => updateInput('monthlyRent', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Monthly Expenses
                </label>
                <input
                  type="number"
                  value={inputs.monthlyExpenses}
                  onChange={(e) => updateInput('monthlyExpenses', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Annual Property Taxes
                </label>
                <input
                  type="number"
                  value={inputs.propertyTaxes}
                  onChange={(e) => updateInput('propertyTaxes', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Annual Insurance
                </label>
                <input
                  type="number"
                  value={inputs.insurance}
                  onChange={(e) => updateInput('insurance', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Vacancy Rate (%)
                </label>
                <input
                  type="number"
                  value={inputs.vacancy}
                  onChange={(e) => updateInput('vacancy', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Appreciation Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.appreciation}
                  onChange={(e) => updateInput('appreciation', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Houston Market Data */}
          <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Houston Market Benchmarks
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-300">Average Rent</p>
                <p className="text-white font-semibold">{formatCurrency(houstonMarketData.averageRent)}</p>
              </div>
              <div>
                <p className="text-blue-300">Average Price</p>
                <p className="text-white font-semibold">{formatCurrency(houstonMarketData.averagePrice)}</p>
              </div>
              <div>
                <p className="text-blue-300">Appreciation</p>
                <p className="text-white font-semibold">{houstonMarketData.averageAppreciation}%</p>
              </div>
              <div>
                <p className="text-blue-300">Cap Rate Range</p>
                <p className="text-white font-semibold">{houstonMarketData.capRateRange}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {calculation && (
            <>
              {/* Key Metrics */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-xl p-6 border border-emerald-500/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
                  Investment Returns
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-emerald-300 text-sm">Cash-on-Cash Return</p>
                    <p className={`text-2xl font-bold ${getROIStatus(calculation.cashOnCashReturn).color}`}>
                      {formatPercent(calculation.cashOnCashReturn)}
                    </p>
                    <p className={`text-xs ${getROIStatus(calculation.cashOnCashReturn).color}`}>
                      {getROIStatus(calculation.cashOnCashReturn).label}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-emerald-300 text-sm">Cap Rate</p>
                    <p className={`text-2xl font-bold ${getROIStatus(calculation.capRate).color}`}>
                      {formatPercent(calculation.capRate)}
                    </p>
                    <p className={`text-xs ${getROIStatus(calculation.capRate).color}`}>
                      {getROIStatus(calculation.capRate).label}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-emerald-300 text-sm">Total ROI</p>
                    <p className={`text-2xl font-bold ${getROIStatus(calculation.totalROI).color}`}>
                      {formatPercent(calculation.totalROI)}
                    </p>
                    <p className={`text-xs ${getROIStatus(calculation.totalROI).color}`}>
                      Including Appreciation
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-emerald-300 text-sm">5-Year Projection</p>
                    <p className={`text-2xl font-bold ${getROIStatus(calculation.fiveYearProjection).color}`}>
                      {formatPercent(calculation.fiveYearProjection)}
                    </p>
                    <p className={`text-xs ${getROIStatus(calculation.fiveYearProjection).color}`}>
                      Total Return
                    </p>
                  </div>
                </div>
              </div>

              {/* Cash Flow Analysis */}
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Cash Flow Analysis</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Monthly Rental Income</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(calculation.monthlyRentalIncome)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-300">Annual Rental Income</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(calculation.annualRentalIncome)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-300">Annual Expenses</span>
                    <span className="text-red-400 font-semibold">
                      -{formatCurrency(calculation.annualExpenses)}
                    </span>
                  </div>
                  
                  <div className="border-t border-slate-600 pt-3">
                    <div className="flex justify-between">
                      <span className="text-emerald-300 font-semibold">Net Operating Income</span>
                      <span className="text-emerald-400 font-bold text-lg">
                        {formatCurrency(calculation.netOperatingIncome)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Break-even Timeline</span>
                    <span className="text-white">
                      {calculation.breakEvenMonths.toFixed(1)} months
                    </span>
                  </div>
                </div>
              </div>

              {/* Investment Summary */}
              <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Investment Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <p className="text-purple-300">
                    Total Cash Invested: <span className="text-white font-semibold">
                      {formatCurrency(inputs.downPayment + inputs.closingCosts + inputs.renovationCosts)}
                    </span>
                  </p>
                  
                  <p className="text-purple-300">
                    Monthly Cash Flow: <span className="text-emerald-400 font-semibold">
                      {formatCurrency(calculation.netOperatingIncome / 12)}
                    </span>
                  </p>
                  
                  <p className="text-purple-300">
                    Loan Amount: <span className="text-white font-semibold">
                      {formatCurrency(inputs.purchasePrice - inputs.downPayment)}
                    </span>
                  </p>
                  
                  <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
                    <p className="text-purple-200 text-xs">
                      💡 <strong>Houston Insight:</strong> Properties with {formatPercent(calculation.capRate)} cap rate 
                      are {calculation.capRate > 7 ? 'above' : 'below'} Houston's average market performance. 
                      Consider Houston's {houstonMarketData.averageAppreciation}% historical appreciation rate.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ROICalculator; 