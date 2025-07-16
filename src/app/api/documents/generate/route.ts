import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface DocumentData {
  timeline?: string[];
  propertyValue?: number[];
  rentalIncome?: number[];
  expenses?: number[];
  netIncome?: number[];
  marketData?: number[];
  priceHistory?: number[];
  neighborhoodData?: number[];
  areas?: string[];
  prices?: number[];
  growth?: number[];
  area?: string;
  title?: string;
  [key: string]: unknown;
}

interface DocumentGenerationRequest {
  type: 'market_report' | 'property_brochure' | 'investment_analysis' | 'marketing_flyer';
  title: string;
  data: DocumentData;
  template?: string;
  includeCharts?: boolean;
  houstonArea?: string;
}

interface DocumentGenerationResponse {
  id: string;
  url: string;
  type: string;
  title: string;
  generatedBy: 'system';
  timestamp: string;
  metadata: {
    pages: number;
    fileSize: string;
    format: 'html' | 'pdf';
    includesCharts: boolean;
    houstonArea?: string;
  };
}

// Simplified chart generation using Chart.js compatible data structure
const createChartData = (data: DocumentData, type: 'roi' | 'market') => {
  if (type === 'roi') {
    return {
      labels: data.timeline || ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      datasets: [
        {
          label: 'Property Value Growth',
          data: data.propertyValue || [500000, 525000, 551250, 578813, 607653],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
        {
          label: 'Rental Income',
          data: data.rentalIncome || [36000, 37800, 39690, 41675, 43758],
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
        }
      ]
    };
  } else {
    return {
      labels: data.areas || ['Heights', 'Montrose', 'River Oaks', 'Energy Corridor', 'Sugar Land'],
      datasets: [
        {
          label: 'Median Price ($)',
          data: data.prices || [485000, 520000, 1200000, 380000, 450000],
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
        }
      ]
    };
  }
};

// Generate HTML template for different document types with embedded Chart.js
const generateHTML = async (type: string, data: DocumentData, chartData?: { roi?: object, market?: object }) => {
  const currentDate = new Date().toLocaleDateString();
  
  const chartScripts = chartData ? `
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        ${chartData.roi ? `
        const roiCtx = document.getElementById('roiChart');
        if (roiCtx) {
          new Chart(roiCtx, {
            type: 'line',
            data: ${JSON.stringify(chartData.roi)},
            options: {
              responsive: true,
              plugins: {
                title: { display: true, text: 'Houston Investment Analysis - 5 Year Projection' }
              },
              scales: {
                y: {
                  beginAtZero: false,
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              }
            }
          });
        }
        ` : ''}
        
        ${chartData.market ? `
        const marketCtx = document.getElementById('marketChart');
        if (marketCtx) {
          new Chart(marketCtx, {
            type: 'bar',
            data: ${JSON.stringify(chartData.market)},
            options: {
              responsive: true,
              plugins: {
                title: { display: true, text: 'Houston Market Analysis by Area' }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              }
            }
          });
        }
        ` : ''}
      });
    </script>
  ` : '';

  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; color: #1f2937; }
      .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
      .logo { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
      .title { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
      .subtitle { font-size: 16px; color: #6b7280; }
      .section { margin-bottom: 30px; }
      .section-title { font-size: 20px; font-weight: bold; color: #1e40af; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 15px; }
      .content { line-height: 1.6; }
      .highlight { background: linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%); padding: 20px; border-radius: 8px; margin: 15px 0; }
      .chart { text-align: center; margin: 20px 0; }
      .chart canvas { max-width: 100%; height: 400px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
      .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
      .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
      .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
      .download-actions { text-align: center; margin: 20px 0; }
      .download-btn { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; margin: 0 10px; }
      @media print { .download-actions { display: none; } }
    </style>
  `;

  switch (type) {
    case 'market_report':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.title || 'Houston Real Estate Market Report'}</title>
          ${baseStyles}
        </head>
        <body>
          <div class="header">
            <div class="logo">🏢 Houston Land Guys - Market Intelligence</div>
            <div class="title">${data.title || 'Houston Real Estate Market Report'}</div>
            <div class="subtitle">${data.area || 'Greater Houston Area'} | ${currentDate}</div>
          </div>

          <div class="download-actions">
            <button onclick="window.print()" class="download-btn">📄 Print/Save as PDF</button>
            <button onclick="window.close()" class="download-btn">✕ Close</button>
          </div>

          <div class="section">
            <div class="section-title">📊 Market Overview</div>
            <div class="content">
              <p>The Houston real estate market continues to demonstrate strong fundamentals with sustained growth across all major sectors. Our analysis covers key performance indicators, emerging trends, and investment opportunities specific to the ${data.area || 'Houston'} market.</p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${data.medianPrice || '$485,000'}</div>
                  <div class="stat-label">Median Home Price</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.priceGrowth || '+12.5%'}</div>
                  <div class="stat-label">YoY Price Growth</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.inventory || '2.8'}</div>
                  <div class="stat-label">Months of Inventory</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.salesVolume || '8,547'}</div>
                  <div class="stat-label">Units Sold (YTD)</div>
                </div>
              </div>
            </div>
          </div>

          ${chartData?.market ? `
          <div class="section">
            <div class="section-title">📈 Market Performance Analysis</div>
            <div class="chart">
              <canvas id="marketChart"></canvas>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">🎯 Investment Insights</div>
            <div class="content">
              <div class="highlight">
                <strong>Key Investment Opportunities:</strong>
                <ul>
                  <li><strong>The Woodlands:</strong> Premium development opportunities with strong rental demand</li>
                  <li><strong>Energy Corridor:</strong> Commercial expansion driving residential growth</li>
                  <li><strong>Houston Heights:</strong> Historic charm meeting modern development</li>
                  <li><strong>Sugar Land:</strong> Family-friendly communities with excellent schools</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Houston Land Guys</strong> | Professional Real Estate Investment Services</p>
            <p>This report is proprietary and confidential. Generated ${currentDate}</p>
          </div>

          ${chartScripts}
        </body>
        </html>
      `;

    case 'investment_analysis':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.title || 'Houston Investment Analysis'}</title>
          ${baseStyles}
        </head>
        <body>
          <div class="header">
            <div class="logo">💰 Houston Land Guys - Investment Analysis</div>
            <div class="title">${data.title || 'Houston Investment Opportunity'}</div>
            <div class="subtitle">ROI Analysis & Financial Projections | ${currentDate}</div>
          </div>

          <div class="download-actions">
            <button onclick="window.print()" class="download-btn">📄 Print/Save as PDF</button>
            <button onclick="window.close()" class="download-btn">✕ Close</button>
          </div>

          <div class="section">
            <div class="section-title">💵 Investment Summary</div>
            <div class="content">
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${data.purchasePrice || '$475,000'}</div>
                  <div class="stat-label">Purchase Price</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.expectedROI || '18.5%'}</div>
                  <div class="stat-label">Expected Annual ROI</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.cashFlow || '$1,250'}</div>
                  <div class="stat-label">Monthly Cash Flow</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.capRate || '8.2%'}</div>
                  <div class="stat-label">Cap Rate</div>
                </div>
              </div>

              <div class="highlight">
                <strong>Investment Highlights:</strong>
                <p>This property represents an exceptional investment opportunity in Houston's growing real estate market. Our analysis indicates strong potential for both appreciation and rental income generation.</p>
              </div>
            </div>
          </div>

          ${chartData?.roi ? `
          <div class="section">
            <div class="section-title">📈 5-Year Financial Projection</div>
            <div class="chart">
              <canvas id="roiChart"></canvas>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">🎯 Investment Strategy</div>
            <div class="content">
              <p><strong>Recommended Approach:</strong></p>
              <ul>
                <li>Acquire property at current market conditions</li>
                <li>Minor renovations to maximize rental potential</li>
                <li>Target premium tenants in growing Houston market</li>
                <li>Hold for 3-5 years to maximize appreciation</li>
                <li>Consider refinancing after 2 years for additional acquisitions</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p><strong>Houston Land Guys</strong> | Strategic Real Estate Investment Solutions</p>
            <p>Confidential Analysis - Not for Distribution | Generated ${currentDate}</p>
          </div>

          ${chartScripts}
        </body>
        </html>
      `;

    default:
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.title || 'Houston Real Estate Document'}</title>
          ${baseStyles}
        </head>
        <body>
          <div class="header">
            <div class="logo">📄 Houston Land Guys</div>
            <div class="title">${data.title || 'Houston Real Estate Document'}</div>
            <div class="subtitle">${currentDate}</div>
          </div>

          <div class="download-actions">
            <button onclick="window.print()" class="download-btn">📄 Print/Save as PDF</button>
            <button onclick="window.close()" class="download-btn">✕ Close</button>
          </div>

          <div class="section">
            <div class="content">
              <p>${data.content || 'Professional real estate document generated by Houston Land Guys.'}</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>Houston Land Guys</strong> | Professional Real Estate Services</p>
          </div>
        </body>
        </html>
      `;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: DocumentGenerationRequest = await request.json();
    const { type, title, data, includeCharts = true, houstonArea } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title' },
        { status: 400 }
      );
    }

    logger.info('Document generation request received', { type, title, includeCharts, houstonArea });

    const chartData: { roi?: object, market?: object } = {};

    // Generate chart data if requested
    if (includeCharts) {
      try {
        if (type === 'investment_analysis') {
          chartData.roi = createChartData(data, 'roi');
        }
        if (type === 'market_report') {
          chartData.market = createChartData(data, 'market');
        }
      } catch (chartError) {
        logger.warn('Chart data generation failed, continuing without charts', chartError);
      }
    }

    // Generate HTML content
    const htmlContent = await generateHTML(type, { ...data, title, area: houstonArea }, chartData);

    // Generate unique filename and create a data URL
    const timestamp = Date.now();
    const documentId = timestamp.toString();
    
    // Instead of saving to filesystem, we'll return the HTML content directly
    // Users can print/save from their browser
    const documentResponse: DocumentGenerationResponse = {
      id: documentId,
      url: `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`,
      type,
      title,
      generatedBy: 'system',
      timestamp: new Date().toISOString(),
      metadata: {
        pages: 1,
        fileSize: `${Math.round(htmlContent.length / 1024)} KB`,
        format: 'html',
        includesCharts: includeCharts && Object.keys(chartData).length > 0,
        houstonArea
      }
    };

    logger.success('Document generated successfully', {
      id: documentResponse.id,
      type,
      fileSize: documentResponse.metadata.fileSize
    });

    return NextResponse.json({
      success: true,
      data: documentResponse,
      message: 'Document generated successfully'
    });

  } catch (error) {
    logger.error('Document generation failed', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Document generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Houston Marketing Machine - Document Generation API',
    endpoints: {
      POST: 'Generate professional HTML documents with embedded charts',
      body: {
        type: 'string - Document type (market_report, property_brochure, investment_analysis, marketing_flyer)',
        title: 'string - Document title',
        data: 'object - Document data and content',
        includeCharts: 'boolean - Include interactive charts (default: true)',
        houstonArea: 'string - Specific Houston area focus'
      }
    },
    documentTypes: {
      market_report: 'Comprehensive market analysis with charts and statistics',
      property_brochure: 'Professional property showcase with details and features',
      investment_analysis: 'ROI analysis with financial projections and charts',
      marketing_flyer: 'General marketing materials and presentations'
    },
    features: [
      'Professional HTML generation with embedded Chart.js',
      'Houston-specific market data integration',
      'Print-ready designs for PDF conversion',
      'Interactive charts and visualizations',
      'Browser-based PDF generation via print dialog'
    ]
  });
} 