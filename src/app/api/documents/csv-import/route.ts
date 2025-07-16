import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
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

// In-memory storage for demo purposes
// In production, you would use Redis, database, or other persistent storage
const csvDataCache = new Map<string, {
  originalFileName: string;
  csvType: string;
  confidence: number;
  columns: string[];
  data: Record<string, unknown>[];
  suggestions: {
    documentType: string;
    recommendedCharts: string[];
    keyMetrics: string[];
  };
  timestamp: string;
  createdAt: number;
}>();

// Automatically clear old data every hour
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [key, value] of csvDataCache.entries()) {
    if (value.createdAt < oneHourAgo) {
      csvDataCache.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Parse CSV data from text
const parseCSV = (csvText: string): Record<string, unknown>[] => {
  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(header => header.trim().replace(/['"]/g, ''));
    const data: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim().replace(/['"]/g, ''));
      if (values.length === headers.length) {
        const row: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          const value = values[index];
          // Try to parse as number
          const numValue = parseFloat(value);
          row[header] = isNaN(numValue) ? value : numValue;
        });
        data.push(row);
      }
    }

    return data;
  } catch (error) {
    logger.error('CSV parsing failed', error);
    return [];
  }
};

// Detect CSV type based on column names
const detectCSVType = (columns: string[]): { type: string; confidence: number } => {
  const marketColumns = ['price', 'area', 'neighborhood', 'zipcode', 'listing', 'sale'];
  const salesColumns = ['sold', 'date', 'buyer', 'agent', 'commission'];
  const rentalColumns = ['rent', 'lease', 'tenant', 'monthly', 'deposit'];
  const investmentColumns = ['roi', 'cap_rate', 'cash_flow', 'irr', 'noi'];

  const columnStr = columns.join(' ').toLowerCase();
  
  let maxScore = 0;
  let detectedType = 'unknown';

  const scores = {
    market_data: marketColumns.filter(col => columnStr.includes(col)).length / marketColumns.length,
    sales_data: salesColumns.filter(col => columnStr.includes(col)).length / salesColumns.length,
    rental_data: rentalColumns.filter(col => columnStr.includes(col)).length / rentalColumns.length,
    investment_data: investmentColumns.filter(col => columnStr.includes(col)).length / investmentColumns.length
  };

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  }

  return {
    type: detectedType,
    confidence: Math.max(0.3, maxScore) // Minimum 30% confidence
  };
};

// Generate suggestions based on CSV type and data
const generateSuggestions = (csvType: string, _data: Record<string, unknown>[]): {
  documentType: string;
  recommendedCharts: string[];
  keyMetrics: string[];
} => {
  const suggestions = {
    market_data: {
      documentType: 'market_analysis_report',
      recommendedCharts: ['Price Trends by Area', 'Inventory Levels', 'Market Activity'],
      keyMetrics: ['Median Price', 'Days on Market', 'Sales Volume', 'Price Per SqFt']
    },
    sales_data: {
      documentType: 'investment_portfolio_report',
      recommendedCharts: ['Sales Volume by Month', 'Commission Analysis', 'Agent Performance'],
      keyMetrics: ['Total Sales', 'Average Sale Price', 'Commission Revenue', 'Deal Count']
    },
    rental_data: {
      documentType: 'neighborhood_guide',
      recommendedCharts: ['Rent by Property Type', 'Occupancy Rates', 'Lease Trends'],
      keyMetrics: ['Average Rent', 'Vacancy Rate', 'Rent Growth', 'Tenant Retention']
    },
    investment_data: {
      documentType: 'investment_portfolio_report',
      recommendedCharts: ['ROI Distribution', 'Cash Flow Analysis', 'Cap Rate Comparison'],
      keyMetrics: ['Average ROI', 'Total Cash Flow', 'Portfolio Value', 'IRR']
    },
    unknown: {
      documentType: 'market_analysis_report',
      recommendedCharts: ['Data Distribution', 'Key Metrics Overview', 'Trend Analysis'],
      keyMetrics: ['Count', 'Average Values', 'Growth Rates', 'Performance Indicators']
    }
  };

  return suggestions[csvType as keyof typeof suggestions] || suggestions.unknown;
};

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

    // Store processed data in memory cache
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    
    const csvData = {
      originalFileName: file.name,
      csvType,
      confidence,
      columns,
      data: processedData,
      suggestions,
      timestamp: new Date().toISOString(),
      createdAt: timestamp
    };

    // Store in cache (in production, use Redis or database)
    csvDataCache.set(uniqueId, csvData);

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

// GET endpoint to retrieve stored CSV data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const csvId = searchParams.get('id');

    if (csvId) {
      // Return specific CSV data
      const csvData = csvDataCache.get(csvId);
      if (!csvData) {
        return NextResponse.json(
          { success: false, error: 'CSV data not found or expired' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: csvData,
        message: 'CSV data retrieved successfully'
      });
    }

    // Return API info
    return NextResponse.json({ 
      message: 'Houston Marketing Machine - CSV Import API',
      endpoints: {
        POST: 'Import and process CSV files',
        'GET?id=<uuid>': 'Retrieve processed CSV data by ID'
      },
      features: [
        'Automatic CSV type detection',
        'Data validation and cleaning', 
        'Business intelligence suggestions',
        'Houston real estate data processing',
        'Document generation recommendations'
      ],
      supportedTypes: {
        market_data: 'Real estate market analysis data',
        sales_data: 'Property sales and transaction data',
        rental_data: 'Rental market and lease information',
        investment_data: 'Investment performance and ROI data'
      },
      storage: {
        method: 'In-memory cache (1 hour retention)',
        note: 'For production use, implement persistent storage (Redis/Database)',
        maxFileSize: '5MB',
        retention: '1 hour'
      },
      limits: {
        maxFileSize: '5MB',
        allowedFormats: ['.csv'],
        dataRetention: '1 hour (demo mode)'
      }
    });

  } catch (error) {
    logger.error('CSV retrieval failed', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'CSV retrieval failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 