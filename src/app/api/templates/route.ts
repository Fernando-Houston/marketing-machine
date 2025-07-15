import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  variables: string[];
  isPremium: boolean;
  tags: string[];
  useCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

// In-memory template storage (in production, this would be in PostgreSQL)
const templates: Template[] = [
  {
    id: '1',
    name: 'Houston Heights Premium Market Report',
    description: 'Comprehensive market analysis for Houston Heights with investment insights and neighborhood trends',
    category: 'Market Analysis',
    prompt: 'Create a detailed market report for Houston Heights including pricing trends, investment opportunities, neighborhood growth projections, and demographic analysis. Focus on luxury properties and investment potential.',
    variables: ['timeframe', 'price_range', 'property_type', 'target_audience'],
    isPremium: true,
    tags: ['houston-heights', 'market-analysis', 'luxury', 'investment'],
    useCount: 47,
    rating: 4.8,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Energy Corridor Investment Showcase',
    description: 'High-ROI commercial property presentation with detailed financial analysis',
    category: 'Investment Opportunity',
    prompt: 'Showcase commercial properties in Houston Energy Corridor with detailed investment analysis, ROI projections, market positioning, and growth potential. Include corporate tenant analysis.',
    variables: ['property_address', 'price', 'square_footage', 'roi_projection', 'tenant_profile'],
    isPremium: true,
    tags: ['energy-corridor', 'commercial', 'roi-analysis', 'corporate'],
    useCount: 32,
    rating: 4.9,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Montrose Luxury Lifestyle Content',
    description: 'Premium neighborhood showcase with lifestyle focus and cultural highlights',
    category: 'Neighborhood Spotlight',
    prompt: 'Create engaging content about Montrose neighborhood highlighting luxury developments, cultural attractions, dining scene, and lifestyle benefits for high-net-worth residents.',
    variables: ['development_name', 'lifestyle_features', 'cultural_highlights', 'price_point'],
    isPremium: true,
    tags: ['montrose', 'luxury', 'lifestyle', 'culture'],
    useCount: 28,
    rating: 4.7,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '4',
    name: 'First-Time Buyer Houston Guide',
    description: 'Comprehensive guide for first-time homebuyers in Houston metro area',
    category: 'Buyer Education',
    prompt: 'Create an educational guide for first-time homebuyers in Houston, covering market conditions, financing options, neighborhood selection, and step-by-step buying process.',
    variables: ['budget_range', 'preferred_areas', 'family_size', 'timeline'],
    isPremium: false,
    tags: ['first-time-buyers', 'education', 'houston-metro', 'financing'],
    useCount: 89,
    rating: 4.6,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '5',
    name: 'Houston Growth Story Analysis',
    description: 'Strategic analysis of Houston real estate market growth and future projections',
    category: 'Market Trends',
    prompt: 'Analyze Houston real estate market growth trends, population demographics, economic indicators, and future development projections. Focus on investment implications.',
    variables: ['analysis_period', 'growth_sectors', 'demographic_focus', 'investment_horizon'],
    isPremium: true,
    tags: ['growth-analysis', 'demographics', 'economic-trends', 'projections'],
    useCount: 41,
    rating: 4.8,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '6',
    name: 'Social Media Engagement Pack',
    description: 'High-engagement social media content for luxury real estate marketing',
    category: 'Social Media',
    prompt: 'Create engaging social media content for luxury Houston real estate, including property highlights, market insights, and client success stories optimized for maximum engagement.',
    variables: ['platform', 'property_type', 'engagement_goal', 'target_demographic'],
    isPremium: true,
    tags: ['social-media', 'engagement', 'luxury', 'success-stories'],
    useCount: 156,
    rating: 4.9,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '7',
    name: 'Property Investment Calculator Content',
    description: 'Educational content about property investment calculations and ROI analysis',
    category: 'Investment Education',
    prompt: 'Create educational content explaining property investment calculations, ROI analysis, cash flow projections, and risk assessment for Houston real estate investments.',
    variables: ['investment_type', 'calculation_method', 'risk_level', 'time_horizon'],
    isPremium: false,
    tags: ['investment-education', 'calculations', 'roi', 'cash-flow'],
    useCount: 67,
    rating: 4.5,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: '8',
    name: 'Seller Strategy Content',
    description: 'Strategic content for property sellers in competitive Houston market',
    category: 'Seller Education',
    prompt: 'Create strategic content for property sellers covering market timing, pricing strategies, home staging, and marketing approaches specific to Houston real estate market.',
    variables: ['property_type', 'market_conditions', 'timeline', 'price_range'],
    isPremium: false,
    tags: ['seller-education', 'pricing-strategy', 'staging', 'marketing'],
    useCount: 73,
    rating: 4.4,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const premium = searchParams.get('premium');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'rating';

    let filteredTemplates = [...templates];

    // Filter by category
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => 
        t.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by premium status
    if (premium === 'true') {
      filteredTemplates = filteredTemplates.filter(t => t.isPremium);
    } else if (premium === 'false') {
      filteredTemplates = filteredTemplates.filter(t => !t.isPremium);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort templates
    filteredTemplates.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'useCount':
          return b.useCount - a.useCount;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return b.rating - a.rating;
      }
    });

    logger.info('Templates retrieved successfully', { 
      count: filteredTemplates.length,
      category,
      premium,
      search
    });

    return NextResponse.json({
      success: true,
      data: {
        templates: filteredTemplates,
        total: filteredTemplates.length,
        categories: [...new Set(templates.map(t => t.category))],
        totalPremium: templates.filter(t => t.isPremium).length,
        totalFree: templates.filter(t => !t.isPremium).length
      }
    });

  } catch (error) {
    logger.error('Failed to retrieve templates', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve templates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, prompt, variables, isPremium, tags } = body;

    // Validation
    if (!name || !description || !category || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category, prompt' },
        { status: 400 }
      );
    }

    const newTemplate: Template = {
      id: (templates.length + 1).toString(),
      name,
      description,
      category,
      prompt,
      variables: variables || [],
      isPremium: isPremium || false,
      tags: tags || [],
      useCount: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    templates.push(newTemplate);

    logger.info('Template created successfully', { 
      templateId: newTemplate.id,
      name: newTemplate.name,
      category: newTemplate.category
    });

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Template created successfully'
    });

  } catch (error) {
    logger.error('Failed to create template', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create template',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templateIndex = templates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    templates[templateIndex] = {
      ...templates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    logger.info('Template updated successfully', { 
      templateId: id,
      updates: Object.keys(updates)
    });

    return NextResponse.json({
      success: true,
      data: templates[templateIndex],
      message: 'Template updated successfully'
    });

  } catch (error) {
    logger.error('Failed to update template', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update template',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templateIndex = templates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const deletedTemplate = templates.splice(templateIndex, 1)[0];

    logger.info('Template deleted successfully', { 
      templateId: id,
      name: deletedTemplate.name
    });

    return NextResponse.json({
      success: true,
      data: deletedTemplate,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete template', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete template',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 