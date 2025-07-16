'use client';

import { useState } from 'react';
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  BarChart3, 
  Download, 
  Sparkles,
  Target,
  Search,
  Database,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface CSVData {
  id: string;
  fileName: string;
  rowCount: number;
  columns: string[];
  suggestions: {
    documentType: string;
    recommendedCharts: string[];
    keyMetrics: string[];
  };
}

interface SEOTrends {
  keywords: {
    primary: string[];
    secondary: string[];
    trending: string[];
  };
  marketInsights: {
    hotTopics: string[];
    emergingNeighborhoods: string[];
    investmentOpportunities: string[];
  };
  contentSuggestions: {
    documentTitles: string[];
    metaDescriptions: string[];
  };
}

interface GeneratedDocument {
  id: string;
  url: string;
  title: string;
  type: string;
  metadata: {
    fileSize: string;
    includesCharts: boolean;
  };
}

export default function EnhancedDocumentGenerator() {
  // States
  const [activeStep, setActiveStep] = useState<'input' | 'csv' | 'seo' | 'generate' | 'complete'>('input');
  const [documentType, setDocumentType] = useState('market_analysis_report');
  const [documentTitle, setDocumentTitle] = useState('');
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [seoTrends, setSeoTrends] = useState<SEOTrends | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Real estate document types
  const documentTypes = [
    {
      id: 'market_analysis_report',
      name: 'Market Analysis Report',
      description: 'Comprehensive market data analysis with trends and forecasts',
      icon: '📊',
      usesCsv: true,
      usesSeo: true,
      examples: ['Q1 2025 Houston Market Report', 'Energy Corridor Investment Analysis']
    },
    {
      id: 'investment_portfolio_report',
      name: 'Investment Portfolio Report',
      description: 'ROI analysis and cash flow projections for property portfolios',
      icon: '💰',
      usesCsv: true,
      usesSeo: false,
      examples: ['Multi-Family Investment Portfolio', 'Commercial Property ROI Analysis']
    },
    {
      id: 'neighborhood_guide',
      name: 'Neighborhood Guide',
      description: 'Complete area overview with schools, amenities, and market data',
      icon: '🏘️',
      usesCsv: true,
      usesSeo: true,
      examples: ['Heights Living Guide 2025', 'Luxury Buyer Guide to River Oaks']
    },
    {
      id: 'listing_presentation',
      name: 'Listing Presentation',
      description: 'Professional property marketing materials and CMA',
      icon: '🏡',
      usesCsv: true,
      usesSeo: true,
      examples: ['Luxury Home Marketing Package', 'Commercial Property Presentation']
    },
    {
      id: 'market_forecast_report',
      name: 'Market Forecast Report',
      description: 'Predictive analysis and future market trends',
      icon: '🔮',
      usesCsv: false,
      usesSeo: true,
      examples: ['Houston 2025 Market Predictions', 'Post-Economic Recovery Analysis']
    }
  ];

  // Handle CSV file upload
  const handleCsvUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('csv', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 200);

      const response = await fetch('/api/documents/csv-import', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();
      if (result.success) {
        setCsvData(result.data);
        setActiveStep('seo');
        
        // Auto-set document type based on CSV suggestions
        if (result.data.suggestions.documentType) {
          setDocumentType(result.data.suggestions.documentType);
        }
        
        // Auto-generate title if not set
        if (!documentTitle) {
          const csvType = result.data.suggestions.documentType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          setDocumentTitle(`${csvType} - ${new Date().toLocaleDateString()}`);
        }
      } else {
        throw new Error(result.error || 'CSV upload failed');
      }
    } catch (error) {
      console.error('CSV upload failed:', error);
      alert(`CSV upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch SEO trends
  const fetchSeoTrends = async () => {
    setIsLoading(true);
    try {
      const selectedType = documentTypes.find(dt => dt.id === documentType);
      const focus = selectedType?.name.toLowerCase().includes('neighborhood') ? 'neighborhood' : 'market';
      
      const response = await fetch(`/api/seo-trends?focus=${focus}&competitor=true`);
      const result = await response.json();
      
      if (result.success) {
        setSeoTrends(result.data);
        setActiveStep('generate');
      } else {
        throw new Error(result.error || 'SEO trends fetch failed');
      }
    } catch (error) {
      console.error('SEO trends fetch failed:', error);
      alert(`SEO trends fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate document
  const generateDocument = async () => {
    if (!documentTitle) {
      alert('Please enter a document title');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare document data
      const documentData: Record<string, unknown> = {
        // Houston market defaults
        medianPrice: '$485,000',
        priceGrowth: '+12.5%',
        inventory: '2.8 months',
        salesVolume: '8,547 homes'
      };

      // Add CSV data if available
      if (csvData) {
        documentData.csvImportId = csvData.id;
        documentData.dataSource = csvData.fileName;
        documentData.recordCount = csvData.rowCount;
      }

      // Add SEO insights if available
      if (seoTrends) {
        documentData.targetKeywords = seoTrends.keywords.primary.slice(0, 3);
        documentData.marketTrends = seoTrends.marketInsights.hotTopics.slice(0, 3);
        documentData.emergingAreas = seoTrends.marketInsights.emergingNeighborhoods.slice(0, 3);
      }

      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: documentType,
          title: documentTitle,
          data: documentData,
          includeCharts: true,
          houstonArea: 'Greater Houston'
        })
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedDocument(result.data);
        setActiveStep('complete');
      } else {
        throw new Error(result.error || 'Document generation failed');
      }
    } catch (error) {
      console.error('Document generation failed:', error);
      alert(`Document generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset workflow
  const resetWorkflow = () => {
    setActiveStep('input');
    setDocumentTitle('');
    setCsvData(null);
    setSeoTrends(null);
    setGeneratedDocument(null);
    setUploadProgress(0);
  };

  const selectedDocumentType = documentTypes.find(dt => dt.id === documentType);

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Enhanced Document Generator</h2>
          <p className="text-blue-300">Professional real estate documents with data integration</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
          <Sparkles className="w-5 h-5 text-blue-300" />
          <span className="text-blue-300 font-medium">AI-Powered</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
        {[
          { id: 'input', name: 'Setup', icon: FileText },
          { id: 'csv', name: 'Data Import', icon: Database },
          { id: 'seo', name: 'SEO Analysis', icon: TrendingUp },
          { id: 'generate', name: 'Generate', icon: Zap },
          { id: 'complete', name: 'Complete', icon: CheckCircle }
        ].map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isCompleted = ['input', 'csv', 'seo', 'generate'].slice(0, ['input', 'csv', 'seo', 'generate', 'complete'].indexOf(activeStep)).includes(step.id);
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500 border-blue-400 text-white' 
                  : isCompleted 
                    ? 'bg-green-500 border-green-400 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-blue-300' : isCompleted ? 'text-green-300' : 'text-slate-400'
              }`}>
                {step.name}
              </span>
              {index < 4 && (
                <div className={`w-8 h-0.5 mx-4 transition-all duration-200 ${
                  isCompleted ? 'bg-green-400' : 'bg-slate-600'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {activeStep === 'input' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">Document Setup</h3>
          
          {/* Document Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-blue-300 mb-3">Document Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setDocumentType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    documentType === type.id
                      ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
                      : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{type.icon}</span>
                    <span className="font-semibold">{type.name}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{type.description}</p>
                  <div className="flex items-center space-x-2 text-xs">
                    {type.usesCsv && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">CSV</span>
                    )}
                    {type.usesSeo && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">SEO</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-sm font-semibold text-blue-300 mb-3">Document Title</label>
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder={selectedDocumentType?.examples[0] || 'Enter document title...'}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Next Button */}
          <button
            onClick={() => setActiveStep(selectedDocumentType?.usesCsv ? 'csv' : 'seo')}
            disabled={!documentTitle}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
          >
            <span>Continue</span>
            <Zap className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeStep === 'csv' && selectedDocumentType?.usesCsv && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">Import Market Data</h3>
          
          {!csvData ? (
            <div>
              <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCsvUpload(file);
                  }}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-300 font-medium mb-2">Upload CSV Data File</p>
                  <p className="text-slate-400 text-sm">Market data, sales records, property listings, or investment portfolios</p>
                </label>
              </div>

              {isLoading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-300">Processing CSV...</span>
                    <span className="text-blue-300">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Example CSV formats */}
              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <h4 className="font-semibold text-white mb-3">Supported CSV Formats:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-300 font-medium">Market Data:</p>
                    <p className="text-slate-400">address, price, sqft, bedrooms, bathrooms</p>
                  </div>
                  <div>
                    <p className="text-blue-300 font-medium">Sales Data:</p>
                    <p className="text-slate-400">sale_date, sale_price, address</p>
                  </div>
                  <div>
                    <p className="text-purple-300 font-medium">Rental Data:</p>
                    <p className="text-slate-400">address, monthly_rent, bedrooms</p>
                  </div>
                  <div>
                    <p className="text-orange-300 font-medium">Investment Data:</p>
                    <p className="text-slate-400">property_address, purchase_price, monthly_rent</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-green-500/20 border border-green-400/30 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-300" />
                <div>
                  <p className="text-green-300 font-semibold">CSV Imported Successfully</p>
                  <p className="text-green-300/70 text-sm">{csvData.fileName} - {csvData.rowCount} records</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <h4 className="font-semibold text-white mb-2">Data Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Records: <span className="text-blue-300">{csvData.rowCount}</span></p>
                    <p className="text-slate-300">Columns: <span className="text-blue-300">{csvData.columns.length}</span></p>
                    <p className="text-slate-300">Type: <span className="text-blue-300">{csvData.suggestions.documentType.replace(/_/g, ' ')}</span></p>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <h4 className="font-semibold text-white mb-2">Recommendations</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">Charts: <span className="text-purple-300">{csvData.suggestions.recommendedCharts.length}</span></p>
                    <p className="text-slate-300">Metrics: <span className="text-green-300">{csvData.suggestions.keyMetrics.length}</span></p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('seo')}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center space-x-2 transition-all duration-200"
              >
                <span>Continue to SEO Analysis</span>
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {activeStep === 'seo' && (selectedDocumentType?.usesSeo || !selectedDocumentType?.usesCsv) && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">SEO & Market Trends</h3>
          
          {!seoTrends ? (
            <div className="text-center">
              <div className="p-8">
                <Search className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-300 font-medium mb-2">Analyze Current Market Trends</p>
                <p className="text-slate-400 mb-6">Get latest SEO insights and Houston market intelligence</p>
                
                <button
                  onClick={fetchSeoTrends}
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center space-x-2 mx-auto transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Trends...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>Fetch Market Trends</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-green-500/20 border border-green-400/30 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-300" />
                <div>
                  <p className="text-green-300 font-semibold">Market Trends Analyzed</p>
                  <p className="text-green-300/70 text-sm">Latest Houston real estate insights captured</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <h4 className="font-semibold text-white mb-3">Top Keywords</h4>
                  <div className="space-y-2">
                    {seoTrends.keywords.primary.slice(0, 3).map((keyword, index) => (
                      <div key={index} className="px-3 py-2 bg-blue-500/20 rounded-lg">
                        <p className="text-blue-300 text-sm">{keyword}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <h4 className="font-semibold text-white mb-3">Hot Topics</h4>
                  <div className="space-y-2">
                    {seoTrends.marketInsights.hotTopics.slice(0, 3).map((topic, index) => (
                      <div key={index} className="px-3 py-2 bg-orange-500/20 rounded-lg">
                        <p className="text-orange-300 text-sm">{topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('generate')}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center space-x-2 transition-all duration-200"
              >
                <span>Continue to Generation</span>
                <Zap className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {activeStep === 'generate' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">Generate Document</h3>
          
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <h4 className="font-semibold text-white mb-4">Document Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-300 text-sm">Type:</p>
                <p className="text-blue-300 font-medium">{selectedDocumentType?.name}</p>
              </div>
              <div>
                <p className="text-slate-300 text-sm">Title:</p>
                <p className="text-blue-300 font-medium">{documentTitle}</p>
              </div>
              {csvData && (
                <div>
                  <p className="text-slate-300 text-sm">Data Source:</p>
                  <p className="text-green-300 font-medium">{csvData.fileName} ({csvData.rowCount} records)</p>
                </div>
              )}
              {seoTrends && (
                <div>
                  <p className="text-slate-300 text-sm">SEO Insights:</p>
                  <p className="text-purple-300 font-medium">{seoTrends.keywords.primary.length} keywords analyzed</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={generateDocument}
            disabled={isLoading}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 flex items-center justify-center space-x-3 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Professional Document...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Generate Document</span>
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {activeStep === 'complete' && generatedDocument && (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Document Generated Successfully!</h3>
            <p className="text-green-300">Your professional real estate document is ready</p>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">{generatedDocument.title}</h4>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                {generatedDocument.type.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm">File Size</p>
                <p className="text-white font-medium">{generatedDocument.metadata.fileSize}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Format</p>
                <p className="text-white font-medium">PDF</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Charts</p>
                <p className="text-white font-medium">{generatedDocument.metadata.includesCharts ? 'Included' : 'None'}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm">Generated</p>
                <p className="text-white font-medium">Just now</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.open(generatedDocument.url, '_blank')}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center space-x-2 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              
              <button
                onClick={resetWorkflow}
                className="px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all duration-200"
              >
                Generate Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 