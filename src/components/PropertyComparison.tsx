'use client';

import { useState } from 'react';
import { Plus, X, TrendingUp, Home, DollarSign, MapPin, BarChart3, Calculator } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  price: number;
  monthlyRent: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  propertyType: 'single-family' | 'townhome' | 'condo' | 'duplex' | 'commercial';
  neighborhood: string;
  capRate: number;
  cashFlow: number;
  appreciation: number;
  walkScore: number;
  schoolRating: number;
  crimeRating: 'A' | 'B' | 'C' | 'D' | 'F';
  notes: string;
}

const PropertyComparison = () => {
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      name: 'Houston Heights Bungalow',
      address: '1234 Heights Blvd, Houston, TX 77008',
      price: 485000,
      monthlyRent: 3200,
      sqft: 1850,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 1925,
      propertyType: 'single-family',
      neighborhood: 'Houston Heights',
      capRate: 7.2,
      cashFlow: 450,
      appreciation: 5.2,
      walkScore: 85,
      schoolRating: 8,
      crimeRating: 'B',
      notes: 'Historic charm, walkable area, near White Oak Bayou trail'
    },
    {
      id: '2',
      name: 'Energy Corridor Townhome',
      address: '5678 Energy Pkwy, Houston, TX 77077',
      price: 425000,
      monthlyRent: 2950,
      sqft: 2100,
      bedrooms: 3,
      bathrooms: 2.5,
      yearBuilt: 2018,
      propertyType: 'townhome',
      neighborhood: 'Energy Corridor',
      capRate: 6.8,
      cashFlow: 380,
      appreciation: 4.8,
      walkScore: 65,
      schoolRating: 9,
      crimeRating: 'A',
      notes: 'Modern construction, excellent schools, corporate area'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    name: '',
    address: '',
    price: 0,
    monthlyRent: 0,
    sqft: 0,
    bedrooms: 0,
    bathrooms: 0,
    yearBuilt: 2020,
    propertyType: 'single-family',
    neighborhood: '',
    capRate: 0,
    cashFlow: 0,
    appreciation: 4.2,
    walkScore: 70,
    schoolRating: 7,
    crimeRating: 'B',
    notes: ''
  });

  const houstonNeighborhoods = [
    'Houston Heights', 'Energy Corridor', 'Montrose', 'River Oaks', 'Memorial',
    'Galleria', 'Midtown', 'Downtown', 'The Woodlands', 'Sugar Land',
    'Katy', 'Pearland', 'Spring', 'Cypress', 'Bellaire'
  ];

  const addProperty = () => {
    if (!newProperty.name || !newProperty.address || !newProperty.price) {
      alert('Please fill in required fields: Name, Address, and Price');
      return;
    }

    const property: Property = {
      id: Date.now().toString(),
      name: newProperty.name!,
      address: newProperty.address!,
      price: newProperty.price!,
      monthlyRent: newProperty.monthlyRent!,
      sqft: newProperty.sqft!,
      bedrooms: newProperty.bedrooms!,
      bathrooms: newProperty.bathrooms!,
      yearBuilt: newProperty.yearBuilt!,
      propertyType: newProperty.propertyType!,
      neighborhood: newProperty.neighborhood!,
      capRate: newProperty.capRate!,
      cashFlow: newProperty.cashFlow!,
      appreciation: newProperty.appreciation!,
      walkScore: newProperty.walkScore!,
      schoolRating: newProperty.schoolRating!,
      crimeRating: newProperty.crimeRating!,
      notes: newProperty.notes!
    };

    setProperties([...properties, property]);
    setNewProperty({
      name: '', address: '', price: 0, monthlyRent: 0, sqft: 0, bedrooms: 0,
      bathrooms: 0, yearBuilt: 2020, propertyType: 'single-family',
      neighborhood: '', capRate: 0, cashFlow: 0, appreciation: 4.2,
      walkScore: 70, schoolRating: 7, crimeRating: 'B', notes: ''
    });
    setShowAddForm(false);
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPerformanceColor = (value: number, type: 'capRate' | 'cashFlow' | 'appreciation') => {
    const thresholds = {
      capRate: { excellent: 8, good: 6, fair: 4 },
      cashFlow: { excellent: 500, good: 200, fair: 0 },
      appreciation: { excellent: 6, good: 4, fair: 2 }
    };

    const threshold = thresholds[type];
    if (value >= threshold.excellent) return 'text-green-400';
    if (value >= threshold.good) return 'text-blue-400';
    if (value >= threshold.fair) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCrimeColor = (rating: string) => {
    const colors = {
      'A': 'text-green-400',
      'B': 'text-blue-400',
      'C': 'text-yellow-400',
      'D': 'text-orange-400',
      'F': 'text-red-400'
    };
    return colors[rating as keyof typeof colors] || 'text-gray-400';
  };

  const calculateROIScore = (property: Property) => {
    // Weighted scoring system
    const capRateScore = Math.min(property.capRate * 10, 100);
    const cashFlowScore = Math.min(property.cashFlow / 10, 100);
    const appreciationScore = Math.min(property.appreciation * 15, 100);
    const walkabilityScore = property.walkScore;
    const schoolScore = property.schoolRating * 10;
    const crimeScore = { 'A': 100, 'B': 80, 'C': 60, 'D': 40, 'F': 20 }[property.crimeRating];

    return Math.round(
      (capRateScore * 0.25) + 
      (cashFlowScore * 0.2) + 
      (appreciationScore * 0.2) + 
      (walkabilityScore * 0.15) + 
      (schoolScore * 0.1) + 
      (crimeScore * 0.1)
    );
  };

  const getBestProperty = () => {
    if (properties.length === 0) return null;
    return properties.reduce((best, current) => 
      calculateROIScore(current) > calculateROIScore(best) ? current : best
    );
  };

  const bestProperty = getBestProperty();

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Property Comparison Tool</h2>
            <p className="text-cyan-300">Compare Houston real estate investments side by side</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-cyan-500/20 text-cyan-300 rounded-xl hover:bg-cyan-500/30 border border-cyan-400/30 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Add Property Form */}
      {showAddForm && (
        <div className="mb-8 bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Add New Property</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">Property Name *</label>
              <input
                type="text"
                value={newProperty.name}
                onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-400"
                placeholder="e.g., Heights Victorian"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">Address *</label>
              <input
                type="text"
                value={newProperty.address}
                onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-400"
                placeholder="Full address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">Neighborhood</label>
              <select
                value={newProperty.neighborhood}
                onChange={(e) => setNewProperty({...newProperty, neighborhood: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">Select neighborhood</option>
                {houstonNeighborhoods.map(neighborhood => (
                  <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">Price *</label>
              <input
                type="number"
                value={newProperty.price}
                onChange={(e) => setNewProperty({...newProperty, price: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">Monthly Rent</label>
              <input
                type="number"
                value={newProperty.monthlyRent}
                onChange={(e) => setNewProperty({...newProperty, monthlyRent: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">Cap Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={newProperty.capRate}
                onChange={(e) => setNewProperty({...newProperty, capRate: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addProperty}
              className="px-6 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 border border-cyan-400/30"
            >
              Add Property
            </button>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-4 px-3 text-cyan-300 font-semibold">Metrics</th>
              {properties.map((property) => (
                <th key={property.id} className="text-left py-4 px-3 min-w-[250px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">{property.name}</div>
                      <div className="text-slate-400 text-sm">{property.neighborhood}</div>
                      {bestProperty?.id === property.id && (
                        <div className="text-green-400 text-xs flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Best Overall
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeProperty(property.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Basic Info */}
            <tr className="border-b border-slate-800/50">
              <td className="py-3 px-3 text-slate-300 font-medium">Address</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3 text-white text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-cyan-400" />
                    {property.address}
                  </div>
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-slate-800/50">
              <td className="py-3 px-3 text-slate-300 font-medium">Price</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                    <span className="text-white font-semibold">{formatCurrency(property.price)}</span>
                  </div>
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-slate-800/50">
              <td className="py-3 px-3 text-slate-300 font-medium">Monthly Rent</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3 text-white">
                  {formatCurrency(property.monthlyRent)}
                </td>
              ))}
            </tr>
            
            {/* Property Details */}
            <tr className="border-b border-slate-800/50">
              <td className="py-3 px-3 text-slate-300 font-medium">Size</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3 text-white">
                  <div className="flex items-center">
                    <Home className="w-4 h-4 mr-2 text-blue-400" />
                    {property.sqft.toLocaleString()} sqft
                  </div>
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-slate-800/50">
              <td className="py-3 px-3 text-slate-300 font-medium">Bed/Bath</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3 text-white">
                  {property.bedrooms} bed / {property.bathrooms} bath
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-slate-800/50">
              <td className="py-3 px-3 text-slate-300 font-medium">Year Built</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3 text-white">
                  {property.yearBuilt}
                </td>
              ))}
            </tr>
            
            {/* Investment Metrics */}
            <tr className="border-b border-slate-800/50 bg-emerald-900/10">
              <td className="py-3 px-3 text-emerald-300 font-semibold">Cap Rate</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3">
                  <div className="flex items-center">
                    <Calculator className="w-4 h-4 mr-2 text-emerald-400" />
                    <span className={`font-semibold ${getPerformanceColor(property.capRate, 'capRate')}`}>
                      {property.capRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-slate-800/50 bg-emerald-900/10">
              <td className="py-3 px-3 text-emerald-300 font-semibold">Monthly Cash Flow</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3">
                  <span className={`font-semibold ${getPerformanceColor(property.cashFlow, 'cashFlow')}`}>
                    {formatCurrency(property.cashFlow)}
                  </span>
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-slate-800/50 bg-emerald-900/10">
              <td className="py-3 px-3 text-emerald-300 font-semibold">Appreciation Rate</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3">
                  <span className={`font-semibold ${getPerformanceColor(property.appreciation, 'appreciation')}`}>
                    {property.appreciation.toFixed(1)}%
                  </span>
                </td>
              ))}
            </tr>
            
            {/* Neighborhood Scores */}
            <tr className="border-b border-slate-800/50">
              <td className="py-3 px-3 text-slate-300 font-medium">Walk Score</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3 text-white">
                  {property.walkScore}/100
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-slate-800/50">
              <td className="py-3 px-3 text-slate-300 font-medium">School Rating</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3 text-white">
                  {property.schoolRating}/10
                </td>
              ))}
            </tr>
            
            <tr className="border-b border-slate-800/50">
              <td className="py-3 px-3 text-slate-300 font-medium">Crime Rating</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3">
                  <span className={`font-semibold ${getCrimeColor(property.crimeRating)}`}>
                    {property.crimeRating}
                  </span>
                </td>
              ))}
            </tr>
            
            {/* Overall Score */}
            <tr className="border-b border-slate-800/50 bg-purple-900/10">
              <td className="py-3 px-3 text-purple-300 font-semibold">Overall Score</td>
              {properties.map((property) => {
                const score = calculateROIScore(property);
                return (
                  <td key={property.id} className="py-3 px-3">
                    <div className="flex items-center">
                      <div className={`text-2xl font-bold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-blue-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {score}
                      </div>
                      <div className="ml-2 text-xs text-slate-400">/100</div>
                    </div>
                  </td>
                );
              })}
            </tr>
            
            {/* Notes */}
            <tr>
              <td className="py-3 px-3 text-slate-300 font-medium">Notes</td>
              {properties.map((property) => (
                <td key={property.id} className="py-3 px-3 text-slate-400 text-sm">
                  {property.notes || 'No notes'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {properties.length > 1 && bestProperty && (
        <div className="mt-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Investment Recommendation
          </h3>
          <p className="text-green-300 mb-2">
            <strong>{bestProperty.name}</strong> scores highest with {calculateROIScore(bestProperty)}/100 points
          </p>
          <p className="text-slate-300 text-sm">
            Best combination of cap rate ({bestProperty.capRate.toFixed(1)}%), cash flow 
            ({formatCurrency(bestProperty.cashFlow)}), and neighborhood quality in {bestProperty.neighborhood}.
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertyComparison; 