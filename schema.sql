-- Houston Marketing Machine Database Schema
-- Execute this in Railway PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content Templates Table
CREATE TABLE content_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  platform VARCHAR(50) DEFAULT 'all',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated Content Table
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES content_templates(id) ON DELETE SET NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL,
  topic VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft',
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Social Media Accounts Table
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Social Media Posts Table
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  post_id VARCHAR(255),
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_at TIMESTAMP,
  posted_at TIMESTAMP,
  error_message TEXT,
  metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Houston Market Data Table
CREATE TABLE houston_market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_type VARCHAR(100) NOT NULL,
  area VARCHAR(100),
  value DECIMAL(15,2),
  period_start DATE,
  period_end DATE,
  data_source VARCHAR(100),
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_generated_content_platform ON generated_content(platform);
CREATE INDEX idx_generated_content_status ON generated_content(status);
CREATE INDEX idx_generated_content_created_at ON generated_content(created_at);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_scheduled_at ON social_posts(scheduled_at);
CREATE INDEX idx_social_posts_posted_at ON social_posts(posted_at);
CREATE INDEX idx_analytics_post_id ON analytics(post_id);
CREATE INDEX idx_analytics_platform ON analytics(platform);
CREATE INDEX idx_houston_market_data_type ON houston_market_data(data_type);
CREATE INDEX idx_houston_market_data_area ON houston_market_data(area);

-- Insert some initial templates
INSERT INTO content_templates (title, content, category, platform) VALUES
('Houston Market Update', 'The Houston real estate market continues to show strong growth with {metric} in {area}. Key highlights include: {highlights}. For investors looking at opportunities in Houston, this represents {opportunity}.', 'market_analysis', 'all'),
('Property Investment Opportunity', 'NEW INVESTMENT OPPORTUNITY: {property_type} in {neighborhood} offering {roi}% projected ROI. Property details: {details}. Contact Houston Land Guys for more information.', 'investment', 'all'),
('Houston Neighborhood Spotlight', 'SPOTLIGHT: {neighborhood} continues to be one of Houston''s most promising areas for real estate investment. Recent developments include: {developments}. Average property values: {values}.', 'neighborhood', 'all'),
('Market Trends Analysis', 'Houston Real Estate Trends: {trend_period} Analysis. Key findings: {findings}. What this means for investors: {implications}. Houston Land Guys insight: {insight}.', 'analysis', 'all'),
('Quick Market Tip', 'HOUSTON REAL ESTATE TIP: {tip}. This strategy has helped our clients achieve {result}. Want to learn more? Contact Houston Land Guys today!', 'tip', 'social');

-- Insert initial social accounts placeholders
INSERT INTO social_accounts (platform, account_name, is_active) VALUES
('instagram', 'houstonlandguys', true),
('facebook', 'Houston Land Guys', true),
('linkedin', 'Houston Land Guys', true);
