import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

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
    format: 'pdf';
    includesCharts: boolean;
    houstonArea?: string;
  };
}

// Chart configuration for ROI analysis
const createROIChart = async (data: DocumentData) => {
  const width = 800;
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const configuration = {
    type: 'line' as const,
    data: {
      labels: data.timeline || ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      datasets: [{
        label: 'Property Value Growth',
        data: data.propertyValue || [500000, 525000, 551250, 578813, 607653],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }, {
        label: 'Rental Income',
        data: data.rentalIncome || [36000, 37800, 39690, 41675, 43758],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Houston Investment Analysis - 5 Year Projection',
          font: { size: 18, weight: 'bold' as const }
        },
        legend: { position: 'top' as const }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value: string | number) {
              return '$' + Number(value).toLocaleString();
            }
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
};

// Generate market comparison chart
const createMarketChart = async (data: DocumentData) => {
  const width = 800;
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const configuration = {
    type: 'bar' as const,
    data: {
      labels: data.areas || ['Houston Heights', 'The Woodlands', 'Energy Corridor', 'Sugar Land', 'Katy'],
      datasets: [{
        label: 'Median Home Price',
        data: data.prices || [425000, 650000, 580000, 475000, 520000],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 1
      }, {
        label: 'Price Growth (YoY)',
        data: data.growth || [12.5, 8.2, 15.3, 9.8, 11.2],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Houston Area Market Comparison',
          font: { size: 18, weight: 'bold' as const }
        }
      },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          ticks: {
            callback: function(value: string | number) {
              return '$' + Number(value).toLocaleString();
            }
          }
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          ticks: {
            callback: function(value: string | number) {
              return Number(value) + '%';
            }
          },
          grid: { drawOnChartArea: false }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
};

// Generate HTML template for different document types
const generateHTML = async (type: string, data: DocumentData, charts?: { roi?: Buffer, market?: Buffer }) => {
  const currentDate = new Date().toLocaleDateString();
  const chartROI = charts?.roi ? `data:image/png;base64,${charts.roi.toString('base64')}` : null;
  const chartMarket = charts?.market ? `data:image/png;base64,${charts.market.toString('base64')}` : null;

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
      .chart img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
      .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
      .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
      .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    </style>
  `;

  switch (type) {
    case 'market_report':
      return `
        ${baseStyles}
        <div class="header">
          <div class="logo">🏢 Houston Land Guys - Market Intelligence</div>
          <div class="title">${data.title || 'Houston Real Estate Market Report'}</div>
          <div class="subtitle">${data.area || 'Greater Houston Area'} | ${currentDate}</div>
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

        ${chartMarket ? `
        <div class="section">
          <div class="section-title">📈 Market Performance Analysis</div>
          <div class="chart">
            <img src="${chartMarket}" alt="Houston Market Analysis Chart" />
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
      `;

    case 'property_brochure':
      return `
        ${baseStyles}
        <div class="header">
          <div class="logo">🏠 Houston Land Guys - Property Showcase</div>
          <div class="title">${data.propertyName || 'Premium Houston Property'}</div>
          <div class="subtitle">${data.address || 'Houston, TX'} | ${data.listingPrice || 'Contact for Price'}</div>
        </div>

        <div class="section">
          <div class="section-title">🏡 Property Overview</div>
          <div class="content">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${data.bedrooms || '4'}</div>
                <div class="stat-label">Bedrooms</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.bathrooms || '3.5'}</div>
                <div class="stat-label">Bathrooms</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.sqft || '3,250'}</div>
                <div class="stat-label">Square Feet</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${data.lotSize || '0.25'}</div>
                <div class="stat-label">Acres</div>
              </div>
            </div>

            <p>${data.description || 'Exceptional property located in one of Houston\'s most desirable neighborhoods. This home features modern amenities, premium finishes, and an ideal location for both families and investors.'}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">✨ Key Features</div>
          <div class="content">
            <div class="highlight">
              <ul>
                <li>Premium location in ${data.neighborhood || 'established Houston neighborhood'}</li>
                <li>Modern kitchen with stainless steel appliances</li>
                <li>Master suite with walk-in closets</li>
                <li>Private backyard with mature landscaping</li>
                <li>Two-car garage with additional storage</li>
                <li>Energy-efficient systems throughout</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Houston Land Guys</strong> | Your Trusted Real Estate Partner</p>
          <p>Contact us today to schedule a private showing | Generated ${currentDate}</p>
        </div>
      `;

    case 'investment_analysis':
      return `
        ${baseStyles}
        <div class="header">
          <div class="logo">💰 Houston Land Guys - Investment Analysis</div>
          <div class="title">${data.propertyName || 'Houston Investment Opportunity'}</div>
          <div class="subtitle">ROI Analysis & Financial Projections | ${currentDate}</div>
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

        ${chartROI ? `
        <div class="section">
          <div class="section-title">📈 5-Year Financial Projection</div>
          <div class="chart">
            <img src="${chartROI}" alt="ROI Analysis Chart" />
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
      `;

    default:
      return `
        ${baseStyles}
        <div class="header">
          <div class="logo">📄 Houston Land Guys</div>
          <div class="title">${data.title || 'Houston Real Estate Document'}</div>
          <div class="subtitle">${currentDate}</div>
        </div>
        <div class="section">
          <div class="content">
            <p>${data.content || 'Professional real estate document generated by Houston Land Guys.'}</p>
          </div>
        </div>
        <div class="footer">
          <p><strong>Houston Land Guys</strong> | Professional Real Estate Services</p>
        </div>
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

    const charts: { roi?: Buffer, market?: Buffer } = {};

    // Generate charts if requested
    if (includeCharts) {
      try {
        if (type === 'investment_analysis') {
          charts.roi = await createROIChart(data);
        }
        if (type === 'market_report') {
          charts.market = await createMarketChart(data);
        }
      } catch (chartError) {
        logger.warn('Chart generation failed, continuing without charts', chartError);
      }
    }

    // Generate HTML content
    const htmlContent = await generateHTML(type, { ...data, title, area: houstonArea }, charts);

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    await browser.close();

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const fileName = `${type}_${sanitizedTitle}_${timestamp}.pdf`;
    
    // Save PDF to public directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
    
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, pdfBuffer);

    const documentResponse: DocumentGenerationResponse = {
      id: timestamp.toString(),
      url: `/uploads/documents/${fileName}`,
      type,
      title,
      generatedBy: 'system',
      timestamp: new Date().toISOString(),
      metadata: {
        pages: 1, // Could be calculated from PDF
        fileSize: `${Math.round(pdfBuffer.length / 1024)} KB`,
        format: 'pdf',
        includesCharts: includeCharts && Object.keys(charts).length > 0,
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
      POST: 'Generate professional PDF documents',
      body: {
        type: 'string - Document type (market_report, property_brochure, investment_analysis, marketing_flyer)',
        title: 'string - Document title',
        data: 'object - Document data and content',
        includeCharts: 'boolean - Include financial charts (default: true)',
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
      'Professional PDF generation with charts',
      'Houston-specific market data integration',
      'Customizable templates and branding',
      'Financial analysis with ROI projections',
      'High-quality chart generation'
    ]
  });
} 