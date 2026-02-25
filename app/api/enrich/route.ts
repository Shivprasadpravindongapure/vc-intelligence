import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface EnrichmentResult {
  summary: string;
  whatTheyDo: string;
  keywords: string[];
  signals: string[];
  sources: string[];
  timestamp: string;
  error?: string;
}

// Scrape website content using scraping API
async function scrapeWebsite(url: string): Promise<string> {
  try {
    // Try direct fetch first (for sites that allow it)
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Parse and clean HTML content
        const $ = cheerio.load(html);
        
        // Remove script, style, nav, footer elements
        $('script, style, nav, footer, header, aside').remove();
        
        // Get main content
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
        
        // Combine relevant content
        const content = [
          title,
          description,
          bodyText.substring(0, 3000) // Limit to first 3000 chars
        ].filter(Boolean).join('\n\n');
        
        if (content.length > 200) {
          return content;
        }
      }
    } catch (directFetchError) {
      console.warn('Direct fetch failed, trying scraping API:', directFetchError);
    }

    // Fallback to scraping API
    const scrapingApiKey = process.env.SCRAPING_API_KEY;
    if (!scrapingApiKey) {
      throw new Error('Scraping API key not configured');
    }

    const apiUrl = `http://api.scraperapi.com?api_key=${scrapingApiKey}&url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Scraping failed: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse and clean HTML content
    const $ = cheerio.load(html);
    
    // Remove script, style, nav, footer elements
    $('script, style, nav, footer, header, aside').remove();
    
    // Get main content
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Combine relevant content
    const content = [
      title,
      description,
      bodyText.substring(0, 5000) // Limit to first 5000 chars
    ].filter(Boolean).join('\n\n');
    
    return content;
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}

// Analyze content using OpenAI
async function analyzeWithOpenAI(content: string, url: string): Promise<Omit<EnrichmentResult, 'timestamp'>> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
Analyze the following website content and extract key information about the company:

URL: ${url}

Content:
${content}

Please provide a JSON response with the following structure:
{
  "summary": "A concise 2-3 sentence summary of what this company does",
  "whatTheyDo": "Detailed description of their products, services, or business model",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "signals": ["signal1", "signal2", "signal3"],
  "sources": ["source1", "source2"]
}

Focus on:
- Business model and value proposition
- Target market and customers
- Key technologies or innovations
- Industry and competitive positioning
- Growth indicators or signals

Respond only with valid JSON, no additional text.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a business analyst expert at extracting key insights from company websites. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const contentResult = data.choices[0]?.message?.content;
  
  if (!contentResult) {
    throw new Error('No content received from OpenAI');
  }

  try {
    const parsed = JSON.parse(contentResult);
    return {
      summary: parsed.summary || 'No summary available',
      whatTheyDo: parsed.whatTheyDo || 'No description available',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      signals: Array.isArray(parsed.signals) ? parsed.signals : [],
      sources: Array.isArray(parsed.sources) ? parsed.sources : [url]
    };
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    throw new Error('Failed to parse AI response');
  }
}

// Analyze content using Anthropic Claude (fallback)
async function analyzeWithAnthropic(content: string, url: string): Promise<Omit<EnrichmentResult, 'timestamp'>> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    throw new Error('Anthropic API key not configured');
  }

  const prompt = `Analyze the following website content and extract key information about the company:

URL: ${url}

Content:
${content}

Please provide a JSON response with the following structure:
{
  "summary": "A concise 2-3 sentence summary of what this company does",
  "whatTheyDo": "Detailed description of their products, services, or business model",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "signals": ["signal1", "signal2", "signal3"],
  "sources": ["source1", "source2"]
}

Focus on business model, target market, technologies, industry positioning, and growth indicators.
Respond only with valid JSON, no additional text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const contentResult = data.content[0]?.text;
  
  if (!contentResult) {
    throw new Error('No content received from Anthropic');
  }

  try {
    const parsed = JSON.parse(contentResult);
    return {
      summary: parsed.summary || 'No summary available',
      whatTheyDo: parsed.whatTheyDo || 'No description available',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      signals: Array.isArray(parsed.signals) ? parsed.signals : [],
      sources: Array.isArray(parsed.sources) ? parsed.sources : [url]
    };
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    throw new Error('Failed to parse AI response');
  }
}

// Fallback mock enrichment when APIs fail
function getMockEnrichment(url: string, companyName: string): Omit<EnrichmentResult, 'timestamp'> {
  const domain = new URL(url).hostname.replace('www.', '');
  
  return {
    summary: `${companyName} is a technology company operating in the digital space, focused on innovation and growth.`,
    whatTheyDo: `${companyName} provides digital solutions and services through their web platform at ${domain}. The company appears to be focused on delivering value to customers through technology-driven products and services.`,
    keywords: ['technology', 'innovation', 'digital', 'platform', 'services'],
    signals: [
      'Active web presence with professional website',
      'Technology-focused business model',
      'Digital service delivery',
      'Online customer engagement'
    ],
    sources: [url]
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Scrape website content
    const content = await scrapeWebsite(url);
    
    if (!content || content.trim().length < 100) {
      return NextResponse.json(
        { error: 'Insufficient content to analyze' },
        { status: 400 }
      );
    }

    // Try OpenAI first, fallback to Anthropic, then mock data
    let analysis: Omit<EnrichmentResult, 'timestamp'>;
    
    try {
      analysis = await analyzeWithOpenAI(content, url);
    } catch (openaiError) {
      console.warn('OpenAI failed, trying Anthropic:', openaiError);
      try {
        analysis = await analyzeWithAnthropic(content, url);
      } catch (anthropicError) {
        console.warn('Both AI services failed, using mock data:', { openaiError, anthropicError });
        // Extract company name from URL for mock data
        const companyName = new URL(url).hostname.replace('www.', '').split('.')[0];
        analysis = getMockEnrichment(url, companyName.charAt(0).toUpperCase() + companyName.slice(1));
      }
    }

    const result: EnrichmentResult = {
      ...analysis,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Enrichment API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
