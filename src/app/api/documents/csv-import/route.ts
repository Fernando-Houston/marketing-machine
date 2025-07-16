import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface CSVImportResponse {
  id: string;
  fileName: string;
  rowCount: number;
  columns: string[];
  processedData: Record<string, unknown>[];
  timestamp: string;
  suggestions: {
    documentType: string;
    recommendedCharts: string[];
    keyMetrics: string[];
  };
}

// Supported CSV formats for real estate
const REAL_ESTATE_COLUMN_MAPPINGS = {
  // Market Data CSV
  market: {
    required: ['address', 'price', 'sqft', 'bedrooms', 'bathrooms'],
    optional: ['lot_size', 'year_built', 'days_on_market', 'neighborhood', 'property_type']
  },
  // Sales Data CSV  
  sales: {
    required: ['sale_date', 'sale_price', 'address'],
    optional: ['listing_price', 'price_per_sqft', 'agent', 'seller_type', 'buyer_type']
  },
  // Rental Data CSV
  rentals: {
    required: ['address', 'monthly_rent', 'bedrooms', 'bathrooms'],
    optional: ['deposit', 'lease_term', 'utilities_included', 'parking', 'pet_policy']
  },
  // Investment Analysis CSV
  investment: {
    required: ['property_address', 'purchase_price', 'monthly_rent', 'expenses'],
    optional: ['vacancy_rate', 'appreciation_rate', 'financing_terms', 'cash_flow']
  }
};

// CSV parsing utility
function parseCSV(csvText: string): Record<string, unknown>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  const data: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      logger.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}. Skipping.`);
      continue;
    }

    const row: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      let value: unknown = values[index];
      
      // Try to parse numbers
      if (value && typeof value === 'string') {
        // Remove currency symbols and commas
        const cleaned = value.replace(/[$,]/g, '');
        if (!isNaN(Number(cleaned)) && cleaned !== '') {
          value = Number(cleaned);
        }
      }
      
      row[header] = value;
    });
    data.push(row);
  }

  return data;
}

// Detect CSV type based on columns
function detectCSVType(columns: string[]): { type: string; confidence: number } {
  const normalizedColumns = columns.map(c => c.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  
  let bestMatch = { type: 'general', confidence: 0 };
  
  for (const [type, mapping] of Object.entries(REAL_ESTATE_COLUMN_MAPPINGS)) {
    const requiredMatches = mapping.required.filter(req => 
      normalizedColumns.some(col => col.includes(req) || req.includes(col))
    ).length;
    
    const optionalMatches = mapping.optional.filter(opt => 
      normalizedColumns.some(col => col.includes(opt) || opt.includes(col))
    ).length;
    
    const confidence = (requiredMatches / mapping.required.length) * 0.7 + 
                      (optionalMatches / mapping.optional.length) * 0.3;
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { type, confidence };
    }
  }
  
  return bestMatch;
}

// Generate document suggestions based on CSV type and data
function generateSuggestions(csvType: string, data: Record<string, unknown>[]): {
  documentType: string;
  recommendedCharts: string[];
  keyMetrics: string[];
} {
  const suggestions = {
    market: {
      documentType: 'market_analysis_report',
      recommendedCharts: ['price_distribution', 'price_per_sqft_trends', 'days_on_market', 'neighborhood_comparison'],
      keyMetrics: ['median_price', 'average_sqft', 'price_per_sqft', 'inventory_levels']
    },
    sales: {
      documentType: 'sales_performance_report', 
      recommendedCharts: ['monthly_sales_volume', 'price_trends', 'average_days_on_market', 'price_vs_listing'],
      keyMetrics: ['total_sales_volume', 'average_sale_price', 'months_of_inventory', 'price_appreciation']
    },
    rentals: {
      documentType: 'rental_market_report',
      recommendedCharts: ['rent_by_bedroom_count', 'rent_per_sqft', 'occupancy_rates', 'neighborhood_rent_comparison'],
      keyMetrics: ['average_rent', 'rent_per_sqft', 'vacancy_rate', 'rental_yield']
    },
    investment: {
      documentType: 'investment_analysis_portfolio',
      recommendedCharts: ['cash_flow_analysis', 'roi_comparison', 'cap_rate_distribution', 'payback_period'],
      keyMetrics: ['total_portfolio_value', 'average_cap_rate', 'total_monthly_cash_flow', 'average_roi']
    }
  };

  return suggestions[csvType as keyof typeof suggestions] || {
    documentType: 'custom_data_report',
    recommendedCharts: ['data_overview', 'key_metrics'],
    keyMetrics: ['data_summary', 'trend_analysis']
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('csv') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No CSV file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Please upload a CSV file.' 
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit for CSV)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'CSV file too large. Maximum size: 5MB' 
        },
        { status: 400 }
      );
    }

    logger.info('CSV import request received', { 
      fileName: file.name,
      fileSize: file.size 
    });

    // Read and parse CSV
    const csvText = await file.text();
    const processedData = parseCSV(csvText);
    
    if (processedData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'CSV file contains no valid data rows' },
        { status: 400 }
      );
    }

    // Extract column names
    const columns = Object.keys(processedData[0]);
    
    // Detect CSV type and generate suggestions
    const { type: csvType, confidence } = detectCSVType(columns);
    const suggestions = generateSuggestions(csvType, processedData);

    // Save processed data for later use
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const fileName = `csv_import_${timestamp}_${uniqueId}.json`;
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'csv-data');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
    
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, JSON.stringify({
      originalFileName: file.name,
      csvType,
      confidence,
      columns,
      data: processedData,
      suggestions,
      timestamp: new Date().toISOString()
    }, null, 2));

    const response: CSVImportResponse = {
      id: uniqueId,
      fileName: file.name,
      rowCount: processedData.length,
      columns,
      processedData: processedData.slice(0, 10), // Return first 10 rows for preview
      timestamp: new Date().toISOString(),
      suggestions
    };

    logger.success('CSV imported and processed successfully', {
      id: uniqueId,
      fileName: file.name,
      rowCount: processedData.length,
      detectedType: csvType,
      confidence: Math.round(confidence * 100)
    });

    return NextResponse.json({
      success: true,
      data: response,
      message: `CSV imported successfully. Detected as ${csvType} data with ${Math.round(confidence * 100)}% confidence.`
    });

  } catch (error) {
    logger.error('CSV import failed', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'CSV import failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Houston Marketing Machine - CSV Import API',
    description: 'Import CSV files containing real estate market data to generate professional reports',
    endpoints: {
      POST: 'Import and process CSV files',
      formData: {
        csv: 'File - CSV file containing real estate data'
      }
    },
    supportedFormats: {
      market_data: {
        description: 'Property listings and market data',
        requiredColumns: ['address', 'price', 'sqft', 'bedrooms', 'bathrooms'],
        optionalColumns: ['lot_size', 'year_built', 'days_on_market', 'neighborhood', 'property_type'],
        generatedReports: ['Market Analysis Report', 'Price Trend Analysis', 'Inventory Report']
      },
      sales_data: {
        description: 'Historical sales transactions',
        requiredColumns: ['sale_date', 'sale_price', 'address'],
        optionalColumns: ['listing_price', 'price_per_sqft', 'agent', 'seller_type', 'buyer_type'],
        generatedReports: ['Sales Performance Report', 'Agent Performance Analysis', 'Market Velocity Report']
      },
      rental_data: {
        description: 'Rental market information',
        requiredColumns: ['address', 'monthly_rent', 'bedrooms', 'bathrooms'],
        optionalColumns: ['deposit', 'lease_term', 'utilities_included', 'parking', 'pet_policy'],
        generatedReports: ['Rental Market Report', 'Cash Flow Analysis', 'Rental Yield Report']
      },
      investment_data: {
        description: 'Investment property portfolio',
        requiredColumns: ['property_address', 'purchase_price', 'monthly_rent', 'expenses'],
        optionalColumns: ['vacancy_rate', 'appreciation_rate', 'financing_terms', 'cash_flow'],
        generatedReports: ['Investment Portfolio Report', 'ROI Analysis', 'Cash Flow Projections']
      }
    },
    features: [
      'Automatic CSV type detection',
      'Data validation and cleaning',
      'Smart column mapping',
      'Document type recommendations',
      'Chart and metric suggestions',
      'Professional report generation'
    ],
    limits: {
      maxFileSize: '5MB',
      maxRows: 10000,
      supportedFormats: ['.csv']
    }
  });
} 