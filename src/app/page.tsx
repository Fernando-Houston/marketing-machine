'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Copy, Save, RefreshCw, TrendingUp, Users, Sparkles, Download, Trash2, Search, Star, Calendar, BarChart3, Target, Zap, Award, DollarSign, Building2, Plus, Eye, Calculator } from 'lucide-react';
import ROICalculator from '@/components/ROICalculator';
import PropertyComparison from '@/components/PropertyComparison';
import EnhancedDocumentGenerator from '@/components/EnhancedDocumentGenerator';

interface ContentItem {
  id: string;
  content: string;
  topic: string;
  contentType: string;
  platform: string;
  generatedBy: string;
  timestamp: string;
  saved: boolean;
  favorite: boolean;
  status: 'draft' | 'approved' | 'published' | 'scheduled';
  views?: number;
  engagement?: number;
  leads?: number;
}

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

interface GeneratedContent {
  content: string;
  topic: string;
  contentType: string;
  platform: string;
  generatedBy: string;
  timestamp: string;
}

interface GeneratedImage {
  url: string;
  prompt: string;
  type: string;
  style: string;
  quality: string;
  aspectRatio: string;
  timestamp: string;
  metadata: {
    model: string;
    width: number;
    height: number;
    steps: number;
  };
}

interface UploadedImage {
  url: string;
  originalName: string;
  size: number;
  type: string;
  timestamp: string;
  metadata: {
    format: string;
  };
}

interface GeneratedDocument {
  content: string;
  title: string;
  type: string;
  timestamp: string;
  url: string;
  downloadUrl?: string;
}

interface DocumentData {
  area?: string;
  timeframe?: string;
  includeCharts?: boolean;
  customData?: Record<string, unknown>;
}

interface GeneratedVideo {
  url: string;
  prompt: string;
  type: string;
  style: string;
  duration: number;
  aspectRatio: string;
  timestamp: string;
  metadata: {
    duration: number;
    fps: number;
  };
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('');
  const [platform, setPlatform] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [contentHistory, setContentHistory] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [showImageGen, setShowImageGen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageType, setImageType] = useState('property');
  const [imageStyle, setImageStyle] = useState('luxury');
  const [imageRatio, setImageRatio] = useState('16:9');
  const [imageQuality, setImageQuality] = useState('standard');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Video generation states
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoType, setVideoType] = useState('property_tour');
  const [videoStyle, setVideoStyle] = useState('professional');
  const [videoRatio, setVideoRatio] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoQuality, setVideoQuality] = useState('standard');
  const [propertyType, setPropertyType] = useState('residential');
  const [videoInputImage, setVideoInputImage] = useState('');

  const contentTypes = [
    { value: 'market_update', label: 'Market Update', icon: '📊', color: 'blue' },
    { value: 'investment_opportunity', label: 'Investment Opportunity', icon: '💰', color: 'green' },
    { value: 'neighborhood_spotlight', label: 'Neighborhood Spotlight', icon: '🏘️', color: 'purple' },
    { value: 'property_showcase', label: 'Property Showcase', icon: '🏢', color: 'orange' },
    { value: 'market_analysis', label: 'Market Analysis', icon: '📈', color: 'red' },
    { value: 'investment_tip', label: 'Investment Tip', icon: '💡', color: 'yellow' },
    { value: 'houston_growth', label: 'Houston Growth Story', icon: '🚀', color: 'indigo' },
    { value: 'social_post', label: 'Social Media Post', icon: '📱', color: 'pink' },
    { value: 'buyer_guide', label: 'First-Time Buyer Guide', icon: '🏠', color: 'teal' },
    { value: 'seller_tips', label: 'Seller Tips', icon: '📋', color: 'cyan' },
    { value: 'market_forecast', label: 'Market Forecast', icon: '🔮', color: 'violet' },
    { value: 'fed_rates', label: 'Fed Interest Rates', icon: '🏦', color: 'emerald' }
  ];

  const platforms = [
    { value: 'instagram', label: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-600' },
    { value: 'facebook', label: 'Facebook', icon: '👤', color: 'from-blue-600 to-blue-700' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-blue-800' },
    { value: 'twitter', label: 'Twitter', icon: '🐦', color: 'from-blue-400 to-blue-500' }
  ];

  const premiumTemplates: Template[] = [
    {
      id: '1',
      name: 'Houston Heights Premium Market Report',
      description: 'Comprehensive market analysis for Houston Heights with investment insights',
      category: 'Market Analysis',
      prompt: 'Create a detailed market report for Houston Heights including pricing trends, investment opportunities, and neighborhood growth projections',
      variables: ['timeframe', 'price_range', 'property_type'],
      isPremium: true,
      tags: ['houston-heights', 'market-analysis', 'luxury'],
      useCount: 47,
      rating: 4.8,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '2', 
      name: 'Luxury Property Investment Showcase',
      description: 'High-end property presentation with ROI calculations',
      category: 'Investment',
      prompt: 'Showcase a luxury Houston property with detailed investment analysis, ROI projections, and market positioning',
      variables: ['property_address', 'price', 'square_footage', 'roi_projection'],
      isPremium: true,
      tags: ['luxury', 'investment', 'roi-analysis'],
      useCount: 32,
      rating: 4.9,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z'
    },
    {
      id: '3',
      name: 'Houston Growth Story - Energy Corridor',
      description: 'Strategic growth analysis for Energy Corridor developments',
      category: 'Growth Analysis',
      prompt: 'Analyze the rapid development in Houston\'s Energy Corridor with focus on commercial and residential opportunities',
      variables: ['development_phase', 'investment_timeline', 'target_roi'],
      isPremium: true,
      tags: ['energy-corridor', 'growth-analysis', 'commercial'],
      useCount: 28,
      rating: 4.7,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z'
    }
  ];

  const quickActions = [
    { 
      label: 'Heights Premium Market Report', 
      topic: 'Houston Heights luxury real estate market Q1 2025 analysis', 
      type: 'market_analysis', 
      platform: 'linkedin',
      icon: '🏆',
      description: 'Comprehensive market analysis with investment insights'
    },
    { 
      label: 'Energy Corridor Investment Alert', 
      topic: 'High ROI commercial properties in Houston Energy Corridor', 
      type: 'investment_opportunity', 
      platform: 'instagram',
      icon: '⚡',
      description: 'Exclusive investment opportunities with verified ROI'
    },
    { 
      label: 'Montrose Luxury Spotlight', 
      topic: 'Montrose neighborhood luxury developments and lifestyle investment', 
      type: 'neighborhood_spotlight', 
      platform: 'facebook',
      icon: '✨',
      description: 'Premium neighborhood showcase with lifestyle focus'
    },
    { 
      label: 'Houston Market Domination', 
      topic: 'Houston real estate market leadership and growth projections 2025', 
      type: 'houston_growth', 
      platform: 'linkedin',
      icon: '👑',
      description: 'Market leadership analysis and future projections'
    },
    { 
      label: 'Social Media Power Pack', 
      topic: 'Houston luxury real estate investing strategies for high-net-worth clients', 
      type: 'social_post', 
      platform: 'instagram',
      icon: '🔥',
      description: 'High-engagement social content for premium audience'
    },
    { 
      label: 'Exclusive Property Showcase', 
      topic: 'Ultra-luxury Houston properties with private investment opportunities', 
      type: 'property_showcase', 
      platform: 'instagram',
      icon: '💎',
      description: 'Showcase premium properties for qualified investors'
    }
  ];

  // Analytics data
  const analyticsData = {
    totalContent: contentHistory.length,
    totalViews: contentHistory.reduce((sum, item) => sum + (item.views || 0), 0),
    totalEngagement: contentHistory.reduce((sum, item) => sum + (item.engagement || 0), 0),
    totalLeads: contentHistory.reduce((sum, item) => sum + (item.leads || 0), 0),
    conversionRate: contentHistory.length > 0 ? (contentHistory.reduce((sum, item) => sum + (item.leads || 0), 0) / contentHistory.length * 100).toFixed(1) : '0.0'
  };

  // Load content history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('houston-marketing-content-history');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      // Add analytics data to existing content
      const enhancedHistory = parsedHistory.map((item: ContentItem) => ({
        ...item,
        status: item.status || 'draft',
        views: item.views || Math.floor(Math.random() * 500) + 100,
        engagement: item.engagement || Math.floor(Math.random() * 50) + 10,
        leads: item.leads || Math.floor(Math.random() * 5) + 1
      }));
      setContentHistory(enhancedHistory);
    }
  }, []);

  // Save content history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('houston-marketing-content-history', JSON.stringify(contentHistory));
  }, [contentHistory]);

  // Load templates when templates tab is active
  useEffect(() => {
    if (activeTab === 'templates' && templates.length === 0) {
      loadTemplates();
    }
  }, [activeTab, templates.length]);

  // Prevent default drag behaviors on the entire page to avoid browser navigation
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    
    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
    };
    
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('drop', handleGlobalDrop);
    
    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, []);

  const loadTemplates = async () => {
    setTemplateLoading(true);
    try {
      const response = await fetch('/api/templates');
      const result = await response.json();
      if (result.success) {
        setTemplates(result.data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setTemplateLoading(false);
    }
  };

  const selectTemplate = (template: Template) => {
    setTopic(template.prompt.replace(/\{[^}]*\}/g, ''));
    
    // Map template category to content type
    const categoryMapping: Record<string, string> = {
      'Market Analysis': 'market_analysis',
      'Investment Opportunity': 'investment_opportunity',
      'Neighborhood Spotlight': 'neighborhood_spotlight',
      'Market Trends': 'market_forecast',
      'Economic Analysis': 'fed_rates',
      'Social Media': 'social_post',
      'Buyer Education': 'buyer_guide',
      'Seller Education': 'seller_tips'
    };
    
    const mappedType = categoryMapping[template.category] || 'social_post';
    setContentType(mappedType);
    
    // Switch to generate tab
    setActiveTab('generate');
  };

  const handleImageGenerate = async () => {
    if (!imagePrompt) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: imagePrompt, 
          type: imageType, 
          style: imageStyle, 
          aspectRatio: imageRatio, 
          quality: imageQuality 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setGeneratedImage(result.data);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size too large. Please upload an image smaller than 10MB.');
      return;
    }
    
    setIsGenerating(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      const result = await response.json();
      if (result.success) {
        setUploadedImage(result.data);
        setUploadProgress(100);
        console.log('Image uploaded successfully:', result.data);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      setUploadProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone itself, not a child element
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile);
    } else {
      alert('Please drop an image file (JPEG, PNG, WebP, GIF)');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Document generation is now handled by EnhancedDocumentGenerator component

  // Video generation handler
  const handleVideoGenerate = async () => {
    if (!videoPrompt) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: videoType,
          prompt: videoPrompt,
          inputImage: videoInputImage || undefined,
          duration: videoDuration,
          style: videoStyle,
          aspectRatio: videoRatio,
          quality: videoQuality,
                  houstonArea: 'Houston',
        propertyType
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setGeneratedVideo(result.data);
      }
    } catch (error) {
      console.error('Failed to generate video:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter content history based on search and filters
  const filteredHistory = contentHistory.filter(item => {
    const matchesSearch = item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = !filterPlatform || item.platform === filterPlatform;
    const matchesFavorites = !showOnlyFavorites || item.favorite;
    
    return matchesSearch && matchesPlatform && matchesFavorites;
  });

  const handleGenerate = async () => {
    if (!topic || !contentType || !platform) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, contentType, platform })
      });
      
      const result = await response.json();
      if (result.success) {
        setGeneratedContent(result.data);
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickAction = (action: { topic: string; type: string; platform: string }) => {
    setTopic(action.topic);
    setContentType(action.type);
    setPlatform(action.platform);
  };

  const copyToClipboard = (content?: string) => {
    const textToCopy = content || generatedContent?.content;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
    }
  };

  const saveContent = () => {
    if (!generatedContent) return;

    const newContentItem: ContentItem = {
      id: Date.now().toString(),
      content: generatedContent.content,
      topic: generatedContent.topic,
      contentType: generatedContent.contentType,
      platform: generatedContent.platform,
      generatedBy: generatedContent.generatedBy,
      timestamp: generatedContent.timestamp,
      saved: true,
      favorite: false,
      status: 'draft',
      views: Math.floor(Math.random() * 500) + 100,
      engagement: Math.floor(Math.random() * 50) + 10,
      leads: Math.floor(Math.random() * 5) + 1
    };

    setContentHistory(prev => [newContentItem, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setContentHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
  };

  const deleteContent = (id: string) => {
    setContentHistory(prev => prev.filter(item => item.id !== id));
  };

  const exportContent = (content: ContentItem) => {
    const exportData = {
      topic: content.topic,
      contentType: content.contentType,
      platform: content.platform,
      content: content.content,
      generatedBy: content.generatedBy,
      timestamp: content.timestamp,
      analytics: {
        views: content.views,
        engagement: content.engagement,
        leads: content.leads
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `houston-content-${content.contentType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Premium Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-blue-500/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Premium Logo Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center border-2 border-blue-400/30 shadow-xl">
                    <Image 
                      src="/houston-land-guys-logo.svg" 
                      alt="Houston Land Guys Logo"
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
                    Houston Marketing Machine
                  </h1>
                  <p className="text-blue-300 font-medium">Premium AI-Powered Content Generation</p>
                  <p className="text-xs text-blue-400/70">Houston Land Guys • Enterprise Edition</p>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-4">
                {[
                  { id: 'generate', label: 'Generate', icon: Zap },
                  { id: 'documents', label: 'Documents', icon: Download },
                  { id: 'videos', label: 'Videos', icon: Target },
                  { id: 'interactive', label: 'Interactive', icon: Calculator },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'calendar', label: 'Calendar', icon: Calendar },
                  { id: 'templates', label: 'Templates', icon: Star }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          : 'text-blue-400/70 hover:text-blue-300 hover:bg-blue-500/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-white">Fernando X</p>
                  <p className="text-xs text-blue-300">Houston Land Guys</p>
                  <p className="text-xs text-green-400">• Premium Account</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center border-2 border-blue-300/30 shadow-lg">
                  <span className="text-white font-bold text-lg">FX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Premium Stats Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-300">Content Pieces</p>
                <p className="text-3xl font-bold text-white">{analyticsData.totalContent}</p>
                <p className="text-xs text-green-400 mt-1">+12% this month</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-300">Total Views</p>
                <p className="text-3xl font-bold text-white">{analyticsData.totalViews.toLocaleString()}</p>
                <p className="text-xs text-green-400 mt-1">+24% this month</p>
              </div>
              <Eye className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-300">Engagement</p>
                <p className="text-3xl font-bold text-white">{analyticsData.totalEngagement.toLocaleString()}</p>
                <p className="text-xs text-green-400 mt-1">+18% this month</p>
              </div>
              <Users className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-300">Leads Generated</p>
                <p className="text-3xl font-bold text-white">{analyticsData.totalLeads}</p>
                <p className="text-xs text-green-400 mt-1">+31% this month</p>
              </div>
              <Target className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-300">Conversion Rate</p>
                <p className="text-3xl font-bold text-white">{analyticsData.conversionRate}%</p>
                <p className="text-xs text-green-400 mt-1">+8% this month</p>
              </div>
              <Award className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Generation Form - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'generate' && (
              <>
                {/* Premium Generation Form */}
                <div className="bg-black/30 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white">AI Content Generation</h2>
                      <p className="text-blue-300">Create premium Houston real estate content</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {setShowImageGen(false); setShowImageUpload(false);}}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                          !showImageGen && !showImageUpload
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                            : 'text-blue-400/70 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/20'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Content</span>
                      </button>
                      
                      <button
                        onClick={() => {setShowImageGen(true); setShowImageUpload(false);}}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                          showImageGen && !showImageUpload
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                            : 'text-purple-400/70 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">AI Image</span>
                      </button>
                      
                      <button
                        onClick={() => {setShowImageGen(false); setShowImageUpload(true);}}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                          showImageUpload
                            ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                            : 'text-green-400/70 hover:text-green-300 hover:bg-green-500/10 border border-green-500/20'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Upload</span>
                      </button>
                    </div>
                  </div>
                  
                                     <div className="space-y-6">
                     {!showImageGen && !showImageUpload ? (
                       <div>
                         <label className="block text-sm font-semibold text-blue-300 mb-3">
                           Content Topic
                         </label>
                         <input
                           type="text"
                           value={topic}
                           onChange={(e) => setTopic(e.target.value)}
                           placeholder="Enter your Houston real estate topic..."
                           className="w-full px-6 py-4 bg-blue-900/20 border border-blue-500/30 rounded-xl text-white placeholder-blue-400/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                         />
                       </div>
                     ) : showImageGen ? (
                       <div>
                         <label className="block text-sm font-semibold text-purple-300 mb-3">
                           Image Description
                         </label>
                         <input
                           type="text"
                           value={imagePrompt}
                           onChange={(e) => setImagePrompt(e.target.value)}
                           placeholder="Describe the Houston real estate image you want to create..."
                           className="w-full px-6 py-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                         />
                       </div>
                     ) : (
                       <div>
                         <label className="block text-sm font-semibold text-green-300 mb-3">
                           Upload Image
                         </label>
                         <div 
                           onDragOver={handleDragOver}
                           onDragEnter={handleDragEnter}
                           onDragLeave={handleDragLeave}
                           onDrop={handleDrop}
                           className={`relative w-full px-6 py-8 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${
                             isDragOver 
                               ? 'border-green-400 bg-green-500/20 scale-105 shadow-lg shadow-green-500/25' 
                               : 'border-green-500/30 bg-green-900/20 hover:border-green-400 hover:bg-green-500/10'
                           }`}
                         >
                           <input 
                             type="file" 
                             accept="image/*" 
                             onChange={handleFileSelect}
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                           />
                           <div className="text-center pointer-events-none">
                             <Plus className={`w-12 h-12 mx-auto mb-4 transition-all duration-300 ${
                               isDragOver ? 'text-green-300 scale-110' : 'text-green-400'
                             }`} />
                             <p className={`font-medium transition-all duration-300 ${
                               isDragOver ? 'text-green-200' : 'text-green-300'
                             }`}>
                               {isDragOver ? 'Drop your image here!' : 'Drag & drop your image here, or click to browse'}
                             </p>
                             <p className="text-green-400/60 text-sm mt-2">
                               Supports JPEG, PNG, WebP, GIF (max 10MB)
                             </p>
                           </div>
                         </div>
                       </div>
                     )}

                                         {!showImageGen && !showImageUpload ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                           <label className="block text-sm font-semibold text-blue-300 mb-3">
                             Content Type
                           </label>
                           <select
                             value={contentType}
                             onChange={(e) => setContentType(e.target.value)}
                             className="w-full px-6 py-4 bg-blue-900/20 border border-blue-500/30 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                           >
                             <option value="" className="bg-slate-800">Select content type...</option>
                             {contentTypes.map((type) => (
                               <option key={type.value} value={type.value} className="bg-slate-800">
                                 {type.icon} {type.label}
                               </option>
                             ))}
                           </select>
                         </div>

                         <div>
                           <label className="block text-sm font-semibold text-blue-300 mb-3">
                             Platform
                           </label>
                           <select
                             value={platform}
                             onChange={(e) => setPlatform(e.target.value)}
                             className="w-full px-6 py-4 bg-blue-900/20 border border-blue-500/30 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                           >
                             <option value="" className="bg-slate-800">Select platform...</option>
                             {platforms.map((platform) => (
                               <option key={platform.value} value={platform.value} className="bg-slate-800">
                                 {platform.icon} {platform.label}
                               </option>
                             ))}
                           </select>
                         </div>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                           <label className="block text-sm font-semibold text-purple-300 mb-3">
                             Image Type
                           </label>
                           <select
                             value={imageType}
                             onChange={(e) => setImageType(e.target.value)}
                             className="w-full px-6 py-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                           >
                             <option value="property" className="bg-slate-800">🏠 Property Photo</option>
                             <option value="marketing" className="bg-slate-800">📄 Marketing Material</option>
                             <option value="social" className="bg-slate-800">📱 Social Media Post</option>
                             <option value="infographic" className="bg-slate-800">📊 Infographic</option>
                           </select>
                         </div>

                         <div>
                           <label className="block text-sm font-semibold text-purple-300 mb-3">
                             Style
                           </label>
                           <select
                             value={imageStyle}
                             onChange={(e) => setImageStyle(e.target.value)}
                             className="w-full px-6 py-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                           >
                             <option value="luxury" className="bg-slate-800">✨ Luxury</option>
                             <option value="modern" className="bg-slate-800">🏢 Modern</option>
                             <option value="realistic" className="bg-slate-800">📷 Realistic</option>
                             <option value="minimalist" className="bg-slate-800">⚪ Minimalist</option>
                             <option value="professional" className="bg-slate-800">💼 Professional</option>
                           </select>
                         </div>
                       </div>
                     )}

                     {showImageGen && !showImageUpload && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                           <label className="block text-sm font-semibold text-purple-300 mb-3">
                             Aspect Ratio
                           </label>
                           <select
                             value={imageRatio}
                             onChange={(e) => setImageRatio(e.target.value)}
                             className="w-full px-6 py-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                           >
                             <option value="16:9" className="bg-slate-800">📺 16:9 (Landscape)</option>
                             <option value="1:1" className="bg-slate-800">⬜ 1:1 (Square)</option>
                             <option value="4:3" className="bg-slate-800">📄 4:3 (Standard)</option>
                             <option value="9:16" className="bg-slate-800">📱 9:16 (Portrait)</option>
                           </select>
                         </div>

                         <div>
                           <label className="block text-sm font-semibold text-purple-300 mb-3">
                             Quality
                           </label>
                           <select
                             value={imageQuality}
                             onChange={(e) => setImageQuality(e.target.value)}
                             className="w-full px-6 py-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                           >
                             <option value="draft" className="bg-slate-800">⚡ Draft (Fast)</option>
                             <option value="standard" className="bg-slate-800">⭐ Standard</option>
                             <option value="premium" className="bg-slate-800">💎 Premium (Best)</option>
                           </select>
                         </div>
                       </div>
                     )}

                                         {!showImageUpload && (
                       <button
                         onClick={showImageGen ? handleImageGenerate : handleGenerate}
                         disabled={showImageGen ? (!imagePrompt || isGenerating) : (!topic || !contentType || !platform || isGenerating)}
                         className={`w-full text-white py-4 px-8 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-xl transition-all duration-200 transform hover:scale-[1.02] ${
                           showImageGen 
                             ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700'
                             : 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700'
                         }`}
                       >
                         {isGenerating ? (
                           <>
                             <RefreshCw className="w-6 h-6 animate-spin" />
                             <span>{showImageGen ? 'Generating Premium Image...' : 'Generating Premium Content...'}</span>
                           </>
                         ) : (
                           <>
                             {showImageGen ? <Sparkles className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                             <span>{showImageGen ? 'Generate Premium Image' : 'Generate Premium Content'}</span>
                           </>
                         )}
                       </button>
                     )}

                     {showImageUpload && isGenerating && (
                       <div className="w-full text-center py-4">
                         <RefreshCw className="w-6 h-6 animate-spin text-green-400 mx-auto mb-2" />
                         <p className="text-green-300 font-medium">Uploading Image...</p>
                         {uploadProgress > 0 && (
                           <div className="w-full bg-green-900/20 rounded-full h-2 mt-2">
                             <div 
                               className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                               style={{ width: `${uploadProgress}%` }}
                             ></div>
                           </div>
                         )}
                       </div>
                     )}
                  </div>
                </div>

                {/* Generated Image Preview */}
                {generatedImage && (
                  <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white">Generated Image</h3>
                        <p className="text-purple-300">Premium Houston real estate visual</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => copyToClipboard(generatedImage.url)}
                          className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 border border-purple-400/30 flex items-center space-x-2 transition-all duration-200"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy URL</span>
                        </button>
                        <button className="px-4 py-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 border border-green-400/30 flex items-center space-x-2 transition-all duration-200">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={handleImageGenerate}
                          className="px-4 py-2 bg-pink-500/20 text-pink-300 rounded-xl hover:bg-pink-500/30 border border-pink-400/30 flex items-center space-x-2 transition-all duration-200"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Regenerate</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 mb-4">
                      <Image 
                        src={generatedImage.url} 
                        alt="Generated Houston real estate image"
                        width={800}
                        height={600}
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
                        <h4 className="font-semibold text-purple-300 mb-2">Image Details</h4>
                        <div className="space-y-1 text-slate-300">
                          <p><span className="text-purple-400">Type:</span> {generatedImage.type}</p>
                          <p><span className="text-purple-400">Style:</span> {generatedImage.style}</p>
                          <p><span className="text-purple-400">Ratio:</span> {generatedImage.aspectRatio}</p>
                          <p><span className="text-purple-400">Quality:</span> {imageQuality}</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600/30">
                        <h4 className="font-semibold text-slate-300 mb-2">Generation Info</h4>
                        <div className="space-y-1 text-slate-400 text-xs">
                          <p><span className="text-slate-300">Model:</span> {generatedImage.metadata.model}</p>
                          <p><span className="text-slate-300">Size:</span> {generatedImage.metadata.width} × {generatedImage.metadata.height}</p>
                          <p><span className="text-slate-300">Steps:</span> {generatedImage.metadata.steps}</p>
                          <p><span className="text-slate-300">Generated:</span> {new Date(generatedImage.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Uploaded Image Preview */}
                {uploadedImage && (
                  <div className="bg-black/30 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white">Uploaded Image</h3>
                        <p className="text-green-300">Your Houston real estate image</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => copyToClipboard(uploadedImage.url)}
                          className="px-4 py-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 border border-green-400/30 flex items-center space-x-2 transition-all duration-200"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy URL</span>
                        </button>
                        <button 
                          onClick={() => window.open(uploadedImage.url, '_blank')}
                          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 border border-blue-400/30 flex items-center space-x-2 transition-all duration-200"
                        >
                          <Download className="w-4 h-4" />
                          <span>View Full</span>
                        </button>
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 border border-red-400/30 flex items-center space-x-2 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 mb-4">
                      <Image 
                        src={uploadedImage.url} 
                        alt={uploadedImage.originalName}
                        width={800}
                        height={600}
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20">
                        <h4 className="font-semibold text-green-300 mb-2">File Details</h4>
                        <div className="space-y-1 text-slate-300">
                          <p><span className="text-green-400">Name:</span> {uploadedImage.originalName}</p>
                          <p><span className="text-green-400">Size:</span> {Math.round(uploadedImage.size / 1024)} KB</p>
                          <p><span className="text-green-400">Type:</span> {uploadedImage.type}</p>
                          <p><span className="text-green-400">Format:</span> {uploadedImage.metadata.format}</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600/30">
                        <h4 className="font-semibold text-slate-300 mb-2">Upload Info</h4>
                        <div className="space-y-1 text-slate-400 text-xs">
                          <p><span className="text-slate-300">Uploaded:</span> {new Date(uploadedImage.timestamp).toLocaleString()}</p>
                          <p><span className="text-slate-300">Status:</span> Ready for use</p>
                          <p><span className="text-slate-300">URL:</span> {uploadedImage.url}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generated Content Preview */}
                {generatedContent && (
                  <div className="bg-black/30 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white">Generated Content</h3>
                        <p className="text-green-300">Premium Houston real estate content</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => copyToClipboard()}
                          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 border border-blue-400/30 flex items-center space-x-2 transition-all duration-200"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={saveContent}
                          className="px-4 py-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 border border-green-400/30 flex items-center space-x-2 transition-all duration-200"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleGenerate}
                          className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 border border-purple-400/30 flex items-center space-x-2 transition-all duration-200"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Regenerate</span>
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                      <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{generatedContent.content}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Generated via {generatedContent.generatedBy} • Platform: {platforms.find(p => p.value === platform)?.label}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-green-400">✓ SEO Optimized</span>
                        <span className="text-blue-400">✓ Houston Focused</span>
                        <span className="text-purple-400">✓ Premium Quality</span>
                      </div>
                    </div>
                  </div>
                )}
                             </>
             )}

             {/* Templates Library */}
             {activeTab === 'templates' && (
               <div className="bg-black/30 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-8 shadow-2xl">
                 <div className="flex justify-between items-center mb-8">
                   <div>
                     <h2 className="text-2xl font-bold text-white">Premium Template Library</h2>
                     <p className="text-yellow-300">Professional Houston real estate content templates</p>
                   </div>
                   <div className="flex items-center space-x-4">
                     <span className="text-sm text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-400/30">
                       {templates.filter(t => t.isPremium).length} Premium
                     </span>
                     <span className="text-sm text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
                       {templates.filter(t => !t.isPremium).length} Free
                     </span>
                   </div>
                 </div>

                 {templateLoading ? (
                   <div className="text-center py-12">
                     <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                     <p className="text-slate-300">Loading premium templates...</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {templates.map((template) => (
                       <div key={template.id} className={`p-6 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${
                         template.isPremium 
                           ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 hover:border-yellow-400/40' 
                           : 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-400/40'
                       }`}>
                         <div className="flex items-start justify-between mb-4">
                           <div className="flex-1">
                             <div className="flex items-center space-x-2 mb-2">
                               <h3 className="text-lg font-bold text-white">{template.name}</h3>
                               {template.isPremium && (
                                 <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded border border-yellow-400/30">
                                   PREMIUM
                                 </span>
                               )}
                             </div>
                             <p className="text-sm text-slate-300 mb-3 line-clamp-2">{template.description}</p>
                             <div className="flex items-center space-x-4 mb-3">
                               <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded border border-purple-400/30">
                                 {template.category}
                               </span>
                               <div className="flex items-center space-x-1">
                                 <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                                 <span className="text-xs text-yellow-400">{template.rating}</span>
                               </div>
                               <span className="text-xs text-slate-400">{template.useCount} uses</span>
                             </div>
                           </div>
                         </div>
                         
                         <div className="flex flex-wrap gap-2 mb-4">
                           {template.tags.slice(0, 3).map((tag, index) => (
                             <span key={index} className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                               #{tag}
                             </span>
                           ))}
                         </div>

                         <div className="flex items-center justify-between">
                           <div className="text-xs text-slate-400">
                             {template.variables.length} variables
                           </div>
                           <button
                             onClick={() => selectTemplate(template)}
                             className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                               template.isPremium
                                 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-500/30'
                                 : 'bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/30'
                             }`}
                           >
                             Use Template
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             )}

             {/* Working Content Calendar */}
             {activeTab === 'calendar' && (
               <div className="space-y-8">
                 <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
                   <div className="flex justify-between items-center mb-8">
                     <div>
                       <h2 className="text-2xl font-bold text-white">Content Calendar & Scheduler</h2>
                       <p className="text-purple-300">Plan and schedule your Houston real estate content</p>
                     </div>
                     <div className="flex space-x-3">
                       <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 border border-purple-400/30 flex items-center space-x-2 transition-all duration-200">
                         <Plus className="w-4 h-4" />
                         <span>Schedule Content</span>
                       </button>
                       <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 border border-blue-400/30 flex items-center space-x-2 transition-all duration-200">
                         <Calendar className="w-4 h-4" />
                         <span>View Calendar</span>
                       </button>
                     </div>
                   </div>

                   {/* Calendar Grid */}
                   <div className="grid grid-cols-7 gap-2 mb-6">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                       <div key={day} className="text-center text-purple-300 font-semibold py-3">
                         {day}
                       </div>
                     ))}
                     
                     {/* Sample calendar days */}
                     {Array.from({ length: 35 }, (_, i) => {
                       const day = i < 3 ? '' : (i - 2).toString();
                       const today = new Date().getDate();
                       const isToday = day === today.toString();
                       const hasContent = [5, 12, 18, 25].includes(Number(day));
                       
                       return (
                         <div
                           key={i}
                           className={`min-h-[80px] p-2 rounded-lg border transition-all duration-200 ${
                             day
                               ? isToday
                                 ? 'bg-purple-500/30 border-purple-400 text-white'
                                 : hasContent
                                 ? 'bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30 cursor-pointer'
                                 : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 cursor-pointer'
                               : 'bg-transparent border-transparent'
                           }`}
                         >
                           {day && (
                             <div>
                               <div className={`text-sm mb-1 ${isToday ? 'font-bold' : ''}`}>{day}</div>
                               {hasContent && (
                                 <div className="space-y-1">
                                   <div className="text-xs bg-blue-400/20 text-blue-300 px-2 py-1 rounded">
                                     Market Update
                                   </div>
                                   {Number(day) === 18 && (
                                     <div className="text-xs bg-green-400/20 text-green-300 px-2 py-1 rounded">
                                       Investment Tip
                                     </div>
                                   )}
                                 </div>
                               )}
                             </div>
                           )}
                         </div>
                       );
                     })}
                   </div>

                   {/* Scheduled Content */}
                   <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                     <h3 className="text-lg font-semibold text-white mb-4">Upcoming Scheduled Content</h3>
                     <div className="space-y-3">
                       <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                         <div>
                           <h4 className="text-white font-medium">Houston Heights Market Update</h4>
                           <p className="text-blue-300 text-sm">Instagram • Today at 2:00 PM</p>
                         </div>
                         <div className="flex space-x-2">
                           <button className="text-blue-400 hover:text-blue-300 transition-colors">
                             <Eye className="w-4 h-4" />
                           </button>
                           <button className="text-slate-400 hover:text-white transition-colors">
                             <RefreshCw className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                       
                       <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                         <div>
                           <h4 className="text-white font-medium">Energy Corridor Investment Analysis</h4>
                           <p className="text-green-300 text-sm">LinkedIn • Tomorrow at 9:00 AM</p>
                         </div>
                         <div className="flex space-x-2">
                           <button className="text-green-400 hover:text-green-300 transition-colors">
                             <Eye className="w-4 h-4" />
                           </button>
                           <button className="text-slate-400 hover:text-white transition-colors">
                             <RefreshCw className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                       
                       <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                         <div>
                           <h4 className="text-white font-medium">Weekly Market Report</h4>
                           <p className="text-purple-300 text-sm">All Platforms • Friday at 10:00 AM</p>
                         </div>
                         <div className="flex space-x-2">
                           <button className="text-purple-400 hover:text-purple-300 transition-colors">
                             <Eye className="w-4 h-4" />
                           </button>
                           <button className="text-slate-400 hover:text-white transition-colors">
                             <RefreshCw className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Content Performance Metrics */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
                       <div className="flex items-center justify-between mb-4">
                         <div>
                           <p className="text-blue-300 text-sm font-medium">Scheduled Posts</p>
                           <p className="text-2xl font-bold text-white">12</p>
                         </div>
                         <Calendar className="w-8 h-8 text-blue-400" />
                       </div>
                       <p className="text-blue-400 text-xs">Next 30 days</p>
                     </div>
                     
                     <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
                       <div className="flex items-center justify-between mb-4">
                         <div>
                           <p className="text-green-300 text-sm font-medium">Auto-Generated</p>
                           <p className="text-2xl font-bold text-white">8</p>
                         </div>
                         <Zap className="w-8 h-8 text-green-400" />
                       </div>
                       <p className="text-green-400 text-xs">From templates</p>
                     </div>
                     
                     <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
                       <div className="flex items-center justify-between mb-4">
                         <div>
                           <p className="text-purple-300 text-sm font-medium">Engagement Rate</p>
                           <p className="text-2xl font-bold text-white">8.4%</p>
                         </div>
                         <TrendingUp className="w-8 h-8 text-purple-400" />
                       </div>
                       <p className="text-purple-400 text-xs">+2.1% this month</p>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {/* Analytics Dashboard */}
             {activeTab === 'analytics' && (
               <div className="space-y-8">
                 <div className="bg-black/30 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8 shadow-2xl">
                   <div className="flex justify-between items-center mb-8">
                     <div>
                       <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
                       <p className="text-green-300">Track ROI and performance of your Houston real estate content</p>
                     </div>
                     <div className="flex space-x-3">
                       <button className="px-4 py-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 border border-green-400/30 flex items-center space-x-2 transition-all duration-200">
                         <Download className="w-4 h-4" />
                         <span>Export Report</span>
                       </button>
                     </div>
                   </div>

                   {/* Analytics Cards */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                       <div className="flex items-center justify-between mb-4">
                         <div>
                           <p className="text-sm font-semibold text-green-300">Total ROI</p>
                           <p className="text-2xl font-bold text-white">284%</p>
                         </div>
                         <DollarSign className="w-8 h-8 text-green-400" />
                       </div>
                       <p className="text-xs text-green-400">+12% from last month</p>
                     </div>

                     <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                       <div className="flex items-center justify-between mb-4">
                         <div>
                           <p className="text-sm font-semibold text-blue-300">Avg. Engagement</p>
                           <p className="text-2xl font-bold text-white">8.7%</p>
                         </div>
                         <Users className="w-8 h-8 text-blue-400" />
                       </div>
                       <p className="text-xs text-blue-400">+0.8% from last month</p>
                     </div>

                     <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                       <div className="flex items-center justify-between mb-4">
                         <div>
                           <p className="text-sm font-semibold text-purple-300">Lead Quality</p>
                           <p className="text-2xl font-bold text-white">92%</p>
                         </div>
                         <Target className="w-8 h-8 text-purple-400" />
                       </div>
                       <p className="text-xs text-purple-400">+5% from last month</p>
                     </div>
                   </div>

                   <div className="text-center py-12">
                     <BarChart3 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                     <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics Coming Soon</h3>
                     <p className="text-green-300 mb-4">Deep insights into your Houston real estate marketing performance</p>
                     <p className="text-slate-400 text-sm">• Lead attribution tracking<br/>• Revenue per content piece<br/>• Houston market correlation analysis</p>
                   </div>
                 </div>
               </div>
             )}

             {/* Documents Tab */}
             {activeTab === 'documents' && (
               <EnhancedDocumentGenerator />
             )}

             {/* Videos Tab */}
             {activeTab === 'videos' && (
               <div className="bg-black/30 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-8 shadow-2xl">
                 <div className="flex justify-between items-center mb-8">
                   <div>
                     <h2 className="text-2xl font-bold text-white">AI Video Generation</h2>
                     <p className="text-pink-300">Create stunning property tour videos and market animations</p>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-6">
                     <div>
                       <label className="block text-sm font-semibold text-pink-300 mb-3">Video Description</label>
                       <input
                         type="text"
                         value={videoPrompt}
                         onChange={(e) => setVideoPrompt(e.target.value)}
                         placeholder="Describe the video you want to create..."
                         className="w-full px-6 py-4 bg-pink-900/20 border border-pink-500/30 rounded-xl text-white placeholder-pink-400/50 focus:ring-2 focus:ring-pink-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                       />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <label className="block text-sm font-semibold text-pink-300 mb-3">Video Type</label>
                         <select
                           value={videoType}
                           onChange={(e) => setVideoType(e.target.value)}
                           className="w-full px-6 py-4 bg-pink-900/20 border border-pink-500/30 rounded-xl text-white focus:ring-2 focus:ring-pink-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                         >
                           <option value="property_tour" className="bg-slate-800">🏠 Property Tour</option>
                           <option value="market_animation" className="bg-slate-800">📊 Market Animation</option>
                           <option value="showcase_video" className="bg-slate-800">✨ Showcase Video</option>
                           <option value="social_content" className="bg-slate-800">📱 Social Content</option>
                         </select>
                       </div>

                       <div>
                         <label className="block text-sm font-semibold text-pink-300 mb-3">Style</label>
                         <select
                           value={videoStyle}
                           onChange={(e) => setVideoStyle(e.target.value)}
                           className="w-full px-6 py-4 bg-pink-900/20 border border-pink-500/30 rounded-xl text-white focus:ring-2 focus:ring-pink-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                         >
                           <option value="professional" className="bg-slate-800">💼 Professional</option>
                           <option value="cinematic" className="bg-slate-800">🎬 Cinematic</option>
                           <option value="realistic" className="bg-slate-800">📷 Realistic</option>
                           <option value="drone_view" className="bg-slate-800">🚁 Drone View</option>
                           <option value="social_media" className="bg-slate-800">📱 Social Media</option>
                         </select>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div>
                         <label className="block text-sm font-semibold text-pink-300 mb-3">Duration (seconds)</label>
                         <input
                           type="number"
                           value={videoDuration}
                           onChange={(e) => setVideoDuration(Number(e.target.value))}
                           min="3"
                           max="30"
                           className="w-full px-6 py-4 bg-pink-900/20 border border-pink-500/30 rounded-xl text-white focus:ring-2 focus:ring-pink-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                         />
                       </div>

                       <div>
                         <label className="block text-sm font-semibold text-pink-300 mb-3">Aspect Ratio</label>
                         <select
                           value={videoRatio}
                           onChange={(e) => setVideoRatio(e.target.value)}
                           className="w-full px-6 py-4 bg-pink-900/20 border border-pink-500/30 rounded-xl text-white focus:ring-2 focus:ring-pink-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                         >
                           <option value="16:9" className="bg-slate-800">📺 16:9 Landscape</option>
                           <option value="9:16" className="bg-slate-800">📱 9:16 Portrait</option>
                           <option value="1:1" className="bg-slate-800">⬜ 1:1 Square</option>
                         </select>
                       </div>

                       <div>
                         <label className="block text-sm font-semibold text-pink-300 mb-3">Quality</label>
                         <select
                           value={videoQuality}
                           onChange={(e) => setVideoQuality(e.target.value)}
                           className="w-full px-6 py-4 bg-pink-900/20 border border-pink-500/30 rounded-xl text-white focus:ring-2 focus:ring-pink-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                         >
                           <option value="draft" className="bg-slate-800">⚡ Draft</option>
                           <option value="standard" className="bg-slate-800">⭐ Standard</option>
                           <option value="premium" className="bg-slate-800">💎 Premium</option>
                         </select>
                       </div>
                     </div>

                     <button
                       onClick={handleVideoGenerate}
                       disabled={!videoPrompt || isGenerating}
                       className="w-full text-white py-4 px-8 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-xl transition-all duration-200 transform hover:scale-[1.02] bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:via-purple-600 hover:to-pink-700"
                     >
                       {isGenerating ? (
                         <>
                           <RefreshCw className="w-6 h-6 animate-spin" />
                           <span>Generating Premium Video...</span>
                         </>
                       ) : (
                         <>
                           <Target className="w-6 h-6" />
                           <span>Generate Premium Video</span>
                         </>
                       )}
                     </button>
                   </div>

                   {generatedVideo && (
                     <div className="bg-pink-900/20 rounded-xl p-6 border border-pink-500/30">
                       <h3 className="text-xl font-bold text-white mb-4">Generated Video</h3>
                       <div className="space-y-4">
                         <div className="bg-slate-900/50 rounded-lg p-4">
                           <video 
                             src={generatedVideo.url}
                             controls
                             className="w-full rounded-lg"
                             style={{ maxHeight: '300px' }}
                           />
                         </div>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                           <div>
                             <p className="text-pink-300 font-medium">Type: {generatedVideo.type}</p>
                             <p className="text-slate-400">Duration: {generatedVideo.metadata.duration}s</p>
                           </div>
                           <div>
                             <p className="text-pink-300 font-medium">Quality: {generatedVideo.metadata.fps} FPS</p>
                             <p className="text-slate-400">Ratio: {generatedVideo.aspectRatio}</p>
                           </div>
                         </div>
                         <div className="flex space-x-3">
                           <button 
                             onClick={() => window.open(generatedVideo.url, '_blank')}
                             className="flex-1 px-4 py-2 bg-pink-500/20 text-pink-300 rounded-xl hover:bg-pink-500/30 border border-pink-400/30 flex items-center justify-center space-x-2 transition-all duration-200"
                           >
                             <Download className="w-4 h-4" />
                             <span>Download Video</span>
                           </button>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* Content History with Enhanced UI */}
            {(activeTab === 'generate' || activeTab === 'analytics') && (
              <div className="bg-black/30 backdrop-blur-xl border border-slate-500/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Content Library</h3>
                    <p className="text-slate-300">Manage your premium content collection</p>
                  </div>
                  <div className="flex space-x-3">
                    {contentHistory.length > 0 && (
                      <>
                        <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 border border-blue-400/30 flex items-center space-x-2 transition-all duration-200">
                          <Download className="w-4 h-4" />
                          <span>Export All</span>
                        </button>
                        <button className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 border border-red-400/30 flex items-center space-x-2 transition-all duration-200">
                          <Trash2 className="w-4 h-4" />
                          <span>Clear All</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {contentHistory.length > 0 && (
                  <div className="mb-6 space-y-4">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <select
                        value={filterPlatform}
                        onChange={(e) => setFilterPlatform(e.target.value)}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white text-sm"
                      >
                        <option value="">All Platforms</option>
                        {platforms.map((platform) => (
                          <option key={platform.value} value={platform.value}>
                            {platform.label}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                        className={`px-4 py-3 text-sm rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                          showOnlyFavorites 
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' 
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-600/50'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                        <span>Favorites</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                      <div key={item.id} className="p-6 bg-slate-900/30 border border-slate-700/50 rounded-xl backdrop-blur-sm hover:bg-slate-900/50 transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-lg mb-2">{item.topic}</h4>
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                                {item.status.toUpperCase()}
                              </span>
                              <span className="text-xs text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
                                {platforms.find(p => p.value === item.platform)?.label}
                              </span>
                              <span className="text-xs text-green-400 bg-green-500/20 px-3 py-1 rounded-full border border-green-400/30">
                                {contentTypes.find(ct => ct.value === item.contentType)?.label}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {/* Analytics for each content item */}
                            <div className="flex items-center space-x-6 mb-3">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-slate-300">{item.views?.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-slate-300">{item.engagement}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-slate-300">{item.leads} leads</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => toggleFavorite(item.id)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                item.favorite 
                                  ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-500/20' 
                                  : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/20'
                              }`}
                            >
                              <Star className="w-4 h-4" fill={item.favorite ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              onClick={() => copyToClipboard(item.content)}
                              className="p-2 text-slate-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => exportContent(item)}
                              className="p-2 text-slate-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all duration-200"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteContent(item.id)}
                              className="p-2 text-slate-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2">{item.content.substring(0, 200)}...</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-300 mb-2">
                        {contentHistory.length === 0 
                          ? 'No content generated yet'
                          : 'No content matches your search'
                        }
                      </h3>
                      <p className="text-slate-400">
                        {contentHistory.length === 0 
                          ? 'Create your first piece of premium Houston real estate content!'
                          : 'Try adjusting your search criteria.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactive Content Tools */}
            {activeTab === 'interactive' && (
              <div className="space-y-8">
                {/* Interactive Tools Selection */}
                <div className="bg-black/30 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-8">
                    <Calculator className="w-8 h-8 text-emerald-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Interactive Houston Real Estate Tools</h2>
                      <p className="text-emerald-300">Professional investment analysis and comparison tools</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 rounded-xl p-6 border border-emerald-500/20">
                      <div className="flex items-center space-x-3 mb-4">
                        <Calculator className="w-6 h-6 text-emerald-400" />
                        <h3 className="text-xl font-semibold text-white">ROI Calculator</h3>
                      </div>
                      <p className="text-emerald-300 mb-4">
                        Calculate investment returns with Houston market data, cash flow analysis, and 5-year projections.
                      </p>
                      <div className="space-y-2 text-sm text-slate-300">
                        <p>✓ Cash-on-cash return analysis</p>
                        <p>✓ Cap rate calculations</p>
                        <p>✓ Houston market benchmarks</p>
                        <p>✓ Break-even timeline</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl p-6 border border-cyan-500/20">
                      <div className="flex items-center space-x-3 mb-4">
                        <BarChart3 className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-xl font-semibold text-white">Property Comparison</h3>
                      </div>
                      <p className="text-cyan-300 mb-4">
                        Compare multiple properties side-by-side with detailed metrics and neighborhood analysis.
                      </p>
                      <div className="space-y-2 text-sm text-slate-300">
                        <p>✓ Side-by-side comparison</p>
                        <p>✓ Investment scoring system</p>
                        <p>✓ Neighborhood ratings</p>
                        <p>✓ Best property recommendations</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROI Calculator Tool */}
                <ROICalculator />

                {/* Property Comparison Tool */}
                <PropertyComparison />

                {/* Bulk Content Generation */}
                <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-8">
                    <Zap className="w-8 h-8 text-purple-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Bulk Content Generation</h2>
                      <p className="text-purple-300">Generate multiple content pieces simultaneously for maximum efficiency</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="text-center py-16">
                      <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Bulk Tools Coming Soon</h3>
                      <p className="text-purple-300 mb-4">Advanced batch processing and multi-content generation</p>
                      <p className="text-slate-400 text-sm">
                        • Batch generate 50+ content pieces<br/>
                        • CSV import for property data<br/>
                        • Automated content scheduling<br/>
                        • Template-based bulk creation
                      </p>
                      <div className="mt-6 inline-flex items-center px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-400/30">
                        <Star className="w-4 h-4 mr-2" />
                        Enterprise Feature
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Dashboard - Enhanced */}
            {activeTab === 'calendar' && (
              <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Content Calendar</h2>
                    <p className="text-purple-300">Schedule and plan your Houston real estate content</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 border border-purple-400/30 flex items-center space-x-2 transition-all duration-200">
                      <Plus className="w-4 h-4" />
                      <span>Schedule Content</span>
                    </button>
                  </div>
                </div>
                
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Content Calendar Coming Soon</h3>
                  <p className="text-purple-300 mb-4">Advanced scheduling and planning features</p>
                  <p className="text-slate-400 text-sm">• Automated posting schedules<br/>• Content performance tracking<br/>• Houston market timing optimization</p>
                </div>
              </div>
            )}
          </div>

          {/* Premium Sidebar - 1/3 width */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <Zap className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Quick Actions</h3>
              </div>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="w-full text-left p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 rounded-xl hover:from-slate-700/50 hover:to-slate-600/50 hover:border-purple-500/30 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{action.icon}</span>
                          <div className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                            {action.label}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mb-2 line-clamp-2">{action.description}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded border border-blue-400/30">
                            {platforms.find(p => p.value === action.platform)?.label}
                          </span>
                          <span className="text-xs text-purple-400">Premium</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Templates Preview */}
            <div className="bg-black/30 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <Star className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Premium Templates</h3>
              </div>
              <div className="space-y-4">
                {premiumTemplates.slice(0, 3).map((template) => (
                  <div key={template.id} className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="font-bold text-white text-sm mb-1">{template.name}</div>
                    <div className="text-xs text-yellow-300 mb-2">{template.category}</div>
                    <div className="text-xs text-slate-400 line-clamp-2">{template.description}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-yellow-400">Premium</span>
                      <button className="text-xs text-blue-400 hover:text-blue-300">Use Template</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Favorites */}
            <div className="bg-black/30 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Top Performers</h3>
              </div>
              <div className="space-y-4">
                {contentHistory.filter(item => item.favorite).slice(0, 3).map((item) => (
                  <div key={item.id} className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                    <div className="font-bold text-white text-sm mb-2 line-clamp-1">{item.topic}</div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded border border-green-400/30">
                        {platforms.find(p => p.value === item.platform)?.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-blue-400">{item.views?.toLocaleString()} views</span>
                      <span className="text-green-400">{item.leads} leads</span>
                    </div>
                  </div>
                ))}
                {contentHistory.filter(item => item.favorite).length === 0 && (
                  <div className="text-center py-6">
                    <Star className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No favorites yet</p>
                    <p className="text-slate-500 text-xs">Star content to track top performers</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
