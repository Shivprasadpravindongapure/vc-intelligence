import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

type Provider = 'google' | 'openai' | 'anthropic' | 'fallback';
type ProviderMode = 'google' | 'openai' | 'anthropic' | 'auto';

interface CompanyDetails {
  founded?: string;
  employees?: string;
  netWorth?: string;
  founders?: string[];
  headquarters?: string;
  revenue?: string;
  funding?: string;
}

interface SourceRef {
  url: string;
  timestamp: string;
}

interface EnrichmentResult {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  signals: string[];
  sources: SourceRef[];
  enrichedAt: string;
  companyDetails?: CompanyDetails;
  provider?: Provider;
  error?: string;
}

interface CachedEnrichment {
  data: Omit<EnrichmentResult, 'enrichedAt'>;
  timestamp: number;
}

const CACHE_DURATION_MS = 5 * 60 * 1000;
const enrichmentCache = new Map<string, CachedEnrichment>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ENRICHMENT_SCHEMA = `Return JSON only:
{
  "summary": "string",
  "whatTheyDo": ["string"],
  "keywords": ["string"],
  "signals": ["string"],
  "companyDetails": {
    "founded": "string",
    "employees": "string",
    "netWorth": "string",
    "founders": ["string"],
    "headquarters": "string",
    "revenue": "string",
    "funding": "string"
  },
  "sources": [{"url":"string","timestamp":"ISO8601"}]
}`;

function getApiKeys(prefix: 'OPENAI' | 'ANTHROPIC' | 'GOOGLE'): string[] {
  const keys = new Set<string>();
  const primary = process.env[`${prefix}_API_KEY`];
  const secondary = process.env[`${prefix}_API_KEY_2`];
  const list = process.env[`${prefix}_API_KEYS`];

  if (typeof primary === 'string' && primary.trim()) keys.add(primary.trim());
  if (typeof secondary === 'string' && secondary.trim()) keys.add(secondary.trim());
  if (typeof list === 'string' && list.trim()) {
    list
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => keys.add(item));
  }

  return Array.from(keys);
}

function getGoogleModels(): string[] {
  const configured = (process.env.GOOGLE_MODELS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const primary =
    process.env.GOOGLE_MODEL ||
    process.env.GOOGLE_GEMINI_MODEL ||
    '';

  const defaults = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash'
  ];

  return Array.from(
    new Set([primary, ...configured, ...defaults].filter(Boolean))
  );
}

function normalizeUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  const blockedHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
  if (blockedHosts.has(parsed.hostname.toLowerCase())) {
    throw new Error('Local URLs are not allowed');
  }
  return parsed.toString();
}

function companyNameFromUrl(url: string): string {
  const domain = new URL(url).hostname.replace(/^www\./, '');
  const name = domain.split('.')[0] || 'Company';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function buildPrompt(content: string, url: string): string {
  const companyName = companyNameFromUrl(url);
  return `You are a business intelligence analyst.
Analyze the website content and provide factual company enrichment.
Only use information present in the content. If unknown, use "Not specified" or "Not disclosed".

Company: ${companyName}
URL: ${url}

${ENRICHMENT_SCHEMA}

Website content:
${content.slice(0, 12000)}`;
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  retries = 2
): Promise<Response> {
  let attempt = 0;
  let waitMs = 800;

  while (true) {
    const response = await fetch(input, init);
    if (response.ok) return response;

    const retriable = response.status === 429 || response.status >= 500;
    if (!retriable || attempt >= retries) return response;

    await sleep(waitMs);
    attempt += 1;
    waitMs *= 2;
  }
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function parseJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();

  const attemptParse = (candidate: string): Record<string, unknown> | null => {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return null;
    } catch {
      return null;
    }
  };

  // 1) Direct parse.
  const direct = attemptParse(trimmed);
  if (direct) return direct;

  // 2) Extract from fenced code blocks.
  const codeBlockMatches = Array.from(trimmed.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/gi));
  for (const match of codeBlockMatches) {
    const block = match[1]?.trim();
    if (!block) continue;
    const parsed = attemptParse(block);
    if (parsed) return parsed;
  }

  // 3) Try every balanced JSON object substring.
  for (let start = 0; start < trimmed.length; start += 1) {
    if (trimmed[start] !== '{') continue;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let end = start; end < trimmed.length; end += 1) {
      const ch = trimmed[end];

      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (ch === '{') depth += 1;
      if (ch === '}') depth -= 1;

      if (depth === 0) {
        const candidate = trimmed.slice(start, end + 1);
        const parsed = attemptParse(candidate);
        if (parsed) return parsed;
        break;
      }
    }
  }

  throw new Error('Model response is not valid JSON');
}

function normalizeResult(parsed: Record<string, unknown>, url: string, provider: Provider): Omit<EnrichmentResult, 'enrichedAt'> {
  const detailsRaw = parsed.companyDetails as Record<string, unknown> | undefined;

  const companyDetails: CompanyDetails | undefined = detailsRaw
    ? {
        founded: typeof detailsRaw.founded === 'string' ? detailsRaw.founded : undefined,
        employees: typeof detailsRaw.employees === 'string' ? detailsRaw.employees : undefined,
        netWorth: typeof detailsRaw.netWorth === 'string' ? detailsRaw.netWorth : undefined,
        founders: sanitizeStringArray(detailsRaw.founders),
        headquarters: typeof detailsRaw.headquarters === 'string' ? detailsRaw.headquarters : undefined,
        revenue: typeof detailsRaw.revenue === 'string' ? detailsRaw.revenue : undefined,
        funding: typeof detailsRaw.funding === 'string' ? detailsRaw.funding : undefined
      }
    : undefined;

  const sourcesRaw = Array.isArray(parsed.sources) ? parsed.sources : [];
  const sources: SourceRef[] = sourcesRaw
    .map((source) => {
      if (!source || typeof source !== 'object') return null;
      const urlValue = (source as Record<string, unknown>).url;
      const timestampValue = (source as Record<string, unknown>).timestamp;
      if (typeof urlValue !== 'string') return null;
      return {
        url: urlValue,
        timestamp: typeof timestampValue === 'string' ? timestampValue : new Date().toISOString()
      };
    })
    .filter((item): item is SourceRef => item !== null);

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : 'No summary available',
    whatTheyDo: sanitizeStringArray(parsed.whatTheyDo),
    keywords: sanitizeStringArray(parsed.keywords),
    signals: sanitizeStringArray(parsed.signals),
    companyDetails,
    sources: sources.length > 0 ? sources : [{ url, timestamp: new Date().toISOString() }],
    provider
  };
}

async function extractHttpError(response: Response, provider: Provider): Promise<Error> {
  let details = '';
  try {
    const body = await response.text();
    if (body) details = body.slice(0, 600);
  } catch {
    details = '';
  }
  const suffix = details ? ` - ${details}` : '';
  return new Error(`${provider.toUpperCase()} API error ${response.status}${suffix}`);
}

async function analyzeWithOpenAI(content: string, url: string): Promise<Omit<EnrichmentResult, 'enrichedAt'>> {
  const apiKeys = getApiKeys('OPENAI');
  if (apiKeys.length === 0) throw new Error('OPENAI_API_KEY is not configured');

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const prompt = buildPrompt(content, url);
  let lastError: Error | null = null;

  for (const apiKey of apiKeys) {
    const response = await fetchWithRetry(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You extract factual company intelligence from website text. Return JSON only.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1200
        })
      },
      2
    );

    if (!response.ok) {
      lastError = await extractHttpError(response, 'openai');
      continue;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || text.trim().length === 0) {
      lastError = new Error('OPENAI returned empty content');
      continue;
    }

    return normalizeResult(parseJsonObject(text), url, 'openai');
  }

  throw lastError || new Error('OPENAI request failed');
}

async function analyzeWithGoogle(content: string, url: string): Promise<Omit<EnrichmentResult, 'enrichedAt'>> {
  const apiKeys = getApiKeys('GOOGLE');
  if (apiKeys.length === 0) throw new Error('GOOGLE_API_KEY is not configured');

  const models = getGoogleModels();
  const prompt = buildPrompt(content, url);
  let lastError: Error | null = null;

  for (const apiKey of apiKeys) {
    for (const model of models) {
      const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1200,
              responseMimeType: 'application/json'
            }
          })
        },
        2
      );

      if (!response.ok) {
        lastError = await extractHttpError(response, 'google');
        // Try next model when current model is unavailable/deprecated.
        if (response.status === 404) {
          continue;
        }
        // For non-404 errors, still allow trying next model/key.
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== 'string' || text.trim().length === 0) {
        lastError = new Error(`GOOGLE returned empty content for model ${model}`);
        continue;
      }

      return normalizeResult(parseJsonObject(text), url, 'google');
    }
  }

  throw lastError || new Error('GOOGLE request failed');
}

async function analyzeWithAnthropic(content: string, url: string): Promise<Omit<EnrichmentResult, 'enrichedAt'>> {
  const apiKeys = getApiKeys('ANTHROPIC');
  if (apiKeys.length === 0) throw new Error('ANTHROPIC_API_KEY is not configured');

  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';
  const prompt = buildPrompt(content, url);
  let lastError: Error | null = null;

  for (const apiKey of apiKeys) {
    const response = await fetchWithRetry(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          max_tokens: 1200,
          temperature: 0.2,
          messages: [
            {
              role: 'user',
              content: [{ type: 'text', text: prompt }]
            }
          ]
        })
      },
      2
    );

    if (!response.ok) {
      lastError = await extractHttpError(response, 'anthropic');
      continue;
    }

    const data = await response.json();
    const text = data?.content?.find((item: { type?: string }) => item.type === 'text')?.text;
    if (typeof text !== 'string' || text.trim().length === 0) {
      lastError = new Error('ANTHROPIC returned empty content');
      continue;
    }

    return normalizeResult(parseJsonObject(text), url, 'anthropic');
  }

  throw lastError || new Error('ANTHROPIC request failed');
}

async function scrapeWebsite(url: string): Promise<string> {
  const readContent = async (html: string): Promise<string> => {
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header, aside').remove();
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const body = $('body').text().replace(/\s+/g, ' ').trim();
    return [title, description, body.slice(0, 12000)].filter(Boolean).join('\n\n');
  };

  try {
    const direct = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    if (direct.ok) {
      const directHtml = await direct.text();
      const directContent = await readContent(directHtml);
      if (directContent.length >= 200) return directContent;
    }
  } catch {
    // Continue to scraper fallback.
  }

  const scrapingApiKey = process.env.SCRAPING_API_KEY;
  if (!scrapingApiKey) {
    throw new Error('SCRAPING_API_KEY is not configured and direct fetch failed');
  }

  const scrapeApi = `http://api.scraperapi.com?api_key=${scrapingApiKey}&url=${encodeURIComponent(url)}`;
  const scraped = await fetch(scrapeApi, {
    method: 'GET',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });

  if (!scraped.ok) {
    throw new Error(`Scraping failed with status ${scraped.status}`);
  }

  const html = await scraped.text();
  const content = await readContent(html);
  if (content.length < 120) {
    throw new Error('Insufficient scraped content');
  }
  return content;
}

function getFallbackEnrichment(url: string): Omit<EnrichmentResult, 'enrichedAt'> {
  const companyName = companyNameFromUrl(url);
  const timestamp = new Date().toISOString();

  return {
    summary: `${companyName} website was reachable, but live model analysis is temporarily unavailable.`,
    whatTheyDo: ['Live AI analysis unavailable for this request.'],
    keywords: [companyName.toLowerCase(), 'analysis-unavailable'],
    signals: ['Provider rate limit or credentials issue'],
    companyDetails: {
      founded: 'Not specified',
      employees: 'Not disclosed',
      netWorth: 'Not disclosed',
      founders: ['Not specified'],
      headquarters: 'Not specified',
      revenue: 'Not disclosed',
      funding: 'Not disclosed'
    },
    sources: [{ url, timestamp }],
    provider: 'fallback',
    error: 'Live AI providers unavailable'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const urlInput = body?.url;
    const forceRefresh = Boolean(body?.forceRefresh);
    const providerModeRaw = typeof body?.provider === 'string' ? body.provider.toLowerCase() : '';
    const envProviderRaw = (process.env.ENRICHMENT_PROVIDER || '').toLowerCase();
    const normalizeProviderMode = (value: string): ProviderMode | null => {
      if (value === 'google' || value === 'gemini') return 'google';
      if (value === 'openai') return 'openai';
      if (value === 'anthropic') return 'anthropic';
      return null;
    };
    const providerMode: ProviderMode =
      normalizeProviderMode(providerModeRaw) ||
      normalizeProviderMode(envProviderRaw) ||
      'google';

    if (typeof urlInput !== 'string' || !urlInput.trim()) {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    let url: string;
    try {
      url = normalizeUrl(urlInput.trim());
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid URL format' },
        { status: 400 }
      );
    }

    const cached = enrichmentCache.get(url);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json({
        ...cached.data,
        enrichedAt: new Date().toISOString()
      } as EnrichmentResult);
    }

    const content = await scrapeWebsite(url);

    let analysis: Omit<EnrichmentResult, 'enrichedAt'> | null = null;
    let openaiError: Error | null = null;
    let anthropicError: Error | null = null;
    let googleError: Error | null = null;

    if (providerMode === 'openai') {
      try {
        analysis = await analyzeWithOpenAI(content, url);
      } catch (error) {
        openaiError = error instanceof Error ? error : new Error(String(error));
      }
    } else if (providerMode === 'anthropic') {
      try {
        analysis = await analyzeWithAnthropic(content, url);
      } catch (error) {
        anthropicError = error instanceof Error ? error : new Error(String(error));
      }
    } else if (providerMode === 'google') {
      try {
        analysis = await analyzeWithGoogle(content, url);
      } catch (error) {
        googleError = error instanceof Error ? error : new Error(String(error));
      }
    } else {
      // Auto mode: Try Google, then OpenAI, then Anthropic.
      try {
        analysis = await analyzeWithGoogle(content, url);
      } catch (error) {
        googleError = error instanceof Error ? error : new Error(String(error));
      }

      if (!analysis) {
        try {
          analysis = await analyzeWithOpenAI(content, url);
        } catch (error) {
          openaiError = error instanceof Error ? error : new Error(String(error));
        }
      }

      if (!analysis) {
        try {
          analysis = await analyzeWithAnthropic(content, url);
        } catch (error) {
          anthropicError = error instanceof Error ? error : new Error(String(error));
        }
      }
    }

    if (!analysis) {
      console.warn('Live enrichment failed', {
        providerMode,
        google: googleError?.message,
        openai: openaiError?.message,
        anthropic: anthropicError?.message
      });
      const fallback = getFallbackEnrichment(url);
      const reasons = [googleError?.message, openaiError?.message, anthropicError?.message].filter(Boolean).join(' | ');
      analysis = {
        ...fallback,
        error: reasons ? `Live AI providers unavailable: ${reasons}` : fallback.error
      };
    }

    const result: EnrichmentResult = {
      ...analysis,
      enrichedAt: new Date().toISOString()
    };

    // Cache only live provider results; do not cache fallback failures.
    if (analysis.provider !== 'fallback') {
      enrichmentCache.set(url, {
        data: analysis,
        timestamp: Date.now()
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        enrichedAt: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
