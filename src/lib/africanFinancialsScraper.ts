import axios from 'axios';
import * as cheerio from 'cheerio';

export interface FinancialReport {
  symbol: string;
  companyName: string;
  reportType: 'annual' | 'interim' | 'quarterly';
  reportTitle: string;
  reportUrl: string;
  documentUrl?: string;
  year: number;
  period?: string;
  publishedAt?: Date;
  highlights?: ReportHighlights;
}

export interface ReportHighlights {
  revenue?: number;
  profit?: number;
  totalAssets?: number;
  eps?: number;
  dividend?: number;
  dividendPerShare?: number;
}

export interface DividendInfo {
  symbol: string;
  companyName: string;
  dividendType: 'final' | 'interim' | 'special';
  amount: number;
  currency: string;
  declarationDate?: Date;
  exDividendDate?: Date;
  paymentDate?: Date;
  year: number;
}

export interface CompanyFinancialData {
  symbol: string;
  companyName: string;
  africanFinancialsUrl: string;
  reports: FinancialReport[];
  dividends: DividendInfo[];
  lastUpdated: Date;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Map NGX symbols to African Financials URL slugs
const SYMBOL_TO_SLUG_MAP: { [key: string]: string } = {
  'DANGCEM': 'dangcem',
  'GTCO': 'gtco',
  'ZENITHBANK': 'zenithbnk',
  'ACCESSCORP': 'accesscorp',
  'UBA': 'uba',
  'FBNH': 'fbnh',
  'STANBIC': 'stanbic',
  'FCMB': 'fcmb',
  'FIDELITYBK': 'fidelitybk',
  'STERLINGNG': 'sterlnbank',
  'WEMABANK': 'wemabank',
  'JAIZBANK': 'jaaborplc',
  'MTNN': 'mtnn',
  'AIRTELAFRI': 'airtelafrn',
  'NESTLE': 'nestle',
  'NB': 'nb',
  'GUINNESS': 'guinness',
  'DANGSUGAR': 'dangsugar',
  'FLOURMILL': 'flourmill',
  'NASCON': 'nascon',
  'BUACEMENT': 'buacement',
  'BUAFOODS': 'buafoods',
  'WAPCO': 'wapco',
  'SEPLAT': 'seplat',
  'OANDO': 'oando',
  'CONOIL': 'conoil',
  'ETERNA': 'eterna',
  'TOTAL': 'totalenerg',
  'TRANSCORP': 'transcorp',
  'TRANSCOHOT': 'transcohot',
  'PRESCO': 'presco',
  'OKOMUOIL': 'okomuoil',
  'UNILEVER': 'unilever',
  'CADBURY': 'cadbury',
  'INTBREW': 'intbrew',
  'CHAMPION': 'champion',
  'JBERGER': 'jberger',
  'CUSTODIAN': 'custodian',
  'AIICO': 'aiico',
  'CORNERST': 'cornerst',
  'MANSARD': 'axamansard',
  'LASACO': 'lasaco',
  'NEM': 'nem',
  'LINKASSURE': 'linkassure',
  'VERITASKAP': 'veritaskp',
  'AFRIPR': 'afripr',
  'UCAP': 'ucap',
  'FTNCOCOA': 'ftncocoa',
  'LIVESTOCK': 'livestock',
  'NGXGROUP': 'ngxgroup',
  'UPDC': 'updc',
  'UPDCREIT': 'updcreit',
  'ETRANZACT': 'etranzact',
  'CHAMS': 'chams',
  'COURTVILLE': 'courtville',
  'CWG': 'cwg',
};

function getAfricanFinancialsSlug(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  return SYMBOL_TO_SLUG_MAP[upperSymbol] || symbol.toLowerCase();
}

async function fetchWithRetry(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
        },
        timeout: 30000,
        maxRedirects: 5,
      });
      return response.data;
    } catch (error: any) {
      console.error(`Fetch attempt ${i + 1} failed for ${url}:`, error.message);
      if (i < retries - 1) {
        await delay(2000 * (i + 1));
      }
    }
  }
  return null;
}

function parseAmount(text: string): number | undefined {
  if (!text) return undefined;

  // Remove currency symbols and whitespace
  const cleaned = text.replace(/[₦NGN$USD€£,\s]/gi, '').trim();

  // Handle billions/millions/thousands
  const multipliers: { [key: string]: number } = {
    'trillion': 1e12,
    'billion': 1e9,
    'million': 1e6,
    'thousand': 1e3,
    'bn': 1e9,
    'mn': 1e6,
    'm': 1e6,
    'k': 1e3,
    't': 1e12,
    'b': 1e9,
  };

  const lowerText = text.toLowerCase();
  for (const [suffix, multiplier] of Object.entries(multipliers)) {
    if (lowerText.includes(suffix)) {
      const numPart = parseFloat(cleaned);
      if (!isNaN(numPart)) {
        return numPart * multiplier;
      }
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

function parseDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;

  const cleaned = dateStr.trim();
  const date = new Date(cleaned);

  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try common date formats
  const formats = [
    /(\w+)\s+(\d{1,2}),?\s+(\d{4})/i, // "March 26, 2025"
    /(\d{1,2})\s+(\w+)\s+(\d{4})/i,   // "26 March 2025"
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // "26/03/2025"
  ];

  for (const format of formats) {
    const match = cleaned.match(format);
    if (match) {
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  return undefined;
}

export async function scrapeCompanyData(symbol: string): Promise<CompanyFinancialData | null> {
  const slug = getAfricanFinancialsSlug(symbol);
  const companyUrl = `https://africanfinancials.com/company/ng-${slug}/`;

  console.log(`Scraping African Financials for ${symbol} at ${companyUrl}`);

  const html = await fetchWithRetry(companyUrl);
  if (!html) {
    console.log(`Failed to fetch data for ${symbol}`);
    return null;
  }

  const $ = cheerio.load(html);

  // Extract company name
  const companyName = $('h1.entry-title, h1.company-name, .company-header h1').first().text().trim() ||
                      $('title').text().split('|')[0].trim() ||
                      symbol;

  const reports: FinancialReport[] = [];
  const dividends: DividendInfo[] = [];

  // Scrape financial reports/documents
  $('.document-item, .report-item, article.document, .financial-document, tr.document-row').each((_, el) => {
    const $el = $(el);

    const titleEl = $el.find('h2 a, h3 a, .document-title a, .title a, td a').first();
    const reportTitle = titleEl.text().trim();
    const reportUrl = titleEl.attr('href') || '';

    if (!reportTitle || !reportUrl) return;

    // Determine report type from title
    let reportType: 'annual' | 'interim' | 'quarterly' = 'annual';
    const lowerTitle = reportTitle.toLowerCase();
    if (lowerTitle.includes('interim') || lowerTitle.includes('half year') || lowerTitle.includes('hy')) {
      reportType = 'interim';
    } else if (lowerTitle.includes('q1') || lowerTitle.includes('q2') || lowerTitle.includes('q3') || lowerTitle.includes('q4') || lowerTitle.includes('quarterly')) {
      reportType = 'quarterly';
    }

    // Extract year from title or URL
    const yearMatch = reportTitle.match(/20\d{2}/) || reportUrl.match(/20\d{2}/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

    // Extract period (e.g., "Q1", "HY", "FY")
    const periodMatch = reportTitle.match(/(Q[1-4]|HY|H1|H2|FY)/i);
    const period = periodMatch ? periodMatch[1].toUpperCase() : undefined;

    // Extract published date
    const dateText = $el.find('.date, .published-date, time, .document-date').first().text().trim() ||
                     $el.find('td:contains("Published")').next().text().trim();
    const publishedAt = parseDate(dateText);

    // Extract highlights if available
    const highlights: ReportHighlights = {};

    const summaryText = $el.find('.summary, .excerpt, .highlights').text();

    // Try to extract financial highlights from summary
    const revenueMatch = summaryText.match(/revenue[:\s]+([₦\d.,]+\s*(?:billion|million|bn|mn)?)/i);
    if (revenueMatch) {
      highlights.revenue = parseAmount(revenueMatch[1]);
    }

    const profitMatch = summaryText.match(/profit[:\s]+([₦\d.,]+\s*(?:billion|million|bn|mn)?)/i);
    if (profitMatch) {
      highlights.profit = parseAmount(profitMatch[1]);
    }

    const dividendMatch = summaryText.match(/dividend[:\s]+([₦\d.,]+)/i);
    if (dividendMatch) {
      highlights.dividendPerShare = parseAmount(dividendMatch[1]);
    }

    reports.push({
      symbol: symbol.toUpperCase(),
      companyName,
      reportType,
      reportTitle,
      reportUrl: reportUrl.startsWith('http') ? reportUrl : `https://africanfinancials.com${reportUrl}`,
      year,
      period,
      publishedAt,
      highlights: Object.keys(highlights).length > 0 ? highlights : undefined,
    });
  });

  // Scrape dividend information
  $('.dividend-item, .dividend-notice, .dividend-declaration, tr:contains("dividend")').each((_, el) => {
    const $el = $(el);
    const text = $el.text();

    // Extract dividend amount
    const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:NGN|₦|kobo|per share)/i);
    if (!amountMatch) return;

    const amount = parseFloat(amountMatch[1]);
    const currency = text.toLowerCase().includes('kobo') ? 'kobo' : 'NGN';

    // Determine dividend type
    let dividendType: 'final' | 'interim' | 'special' = 'final';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('interim')) {
      dividendType = 'interim';
    } else if (lowerText.includes('special')) {
      dividendType = 'special';
    }

    // Extract dates
    const dateMatches = text.match(/(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+\w+\s+\d{4})/g);
    const dates = dateMatches ? dateMatches.map(d => parseDate(d)).filter(Boolean) : [];

    // Extract year
    const yearMatch = text.match(/20\d{2}/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

    dividends.push({
      symbol: symbol.toUpperCase(),
      companyName,
      dividendType,
      amount: currency === 'kobo' ? amount / 100 : amount, // Convert kobo to Naira
      currency: 'NGN',
      declarationDate: dates[0],
      year,
    });
  });

  // Also check for dividend info in the sidebar or dedicated section
  $('.dividend-history li, .recent-dividends li, .company-dividends .item').each((_, el) => {
    const $el = $(el);
    const text = $el.text();

    const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:NGN|₦|per share)/i);
    if (!amountMatch) return;

    const amount = parseFloat(amountMatch[1]);

    let dividendType: 'final' | 'interim' | 'special' = 'final';
    if (text.toLowerCase().includes('interim')) dividendType = 'interim';
    else if (text.toLowerCase().includes('special')) dividendType = 'special';

    const yearMatch = text.match(/20\d{2}/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

    const dateText = $el.find('.date, time').text().trim();
    const declarationDate = parseDate(dateText) || parseDate(text);

    // Avoid duplicates
    const exists = dividends.some(d =>
      d.year === year &&
      d.dividendType === dividendType &&
      Math.abs(d.amount - amount) < 0.01
    );

    if (!exists) {
      dividends.push({
        symbol: symbol.toUpperCase(),
        companyName,
        dividendType,
        amount,
        currency: 'NGN',
        declarationDate,
        year,
      });
    }
  });

  // Sort reports by year (newest first)
  reports.sort((a, b) => b.year - a.year);

  // Sort dividends by year (newest first)
  dividends.sort((a, b) => b.year - a.year);

  return {
    symbol: symbol.toUpperCase(),
    companyName,
    africanFinancialsUrl: companyUrl,
    reports,
    dividends,
    lastUpdated: new Date(),
  };
}

export async function scrapeNigerianDocuments(): Promise<FinancialReport[]> {
  const url = 'https://africanfinancials.com/nigeria-listed-company-documents/';
  console.log('Scraping Nigerian company documents from:', url);

  const html = await fetchWithRetry(url);
  if (!html) {
    console.log('Failed to fetch Nigerian documents page');
    return [];
  }

  const $ = cheerio.load(html);
  const reports: FinancialReport[] = [];

  // Scrape document listings
  $('article, .document-item, tr.document').each((_, el) => {
    const $el = $(el);

    const titleEl = $el.find('h2 a, h3 a, .title a, td a').first();
    const reportTitle = titleEl.text().trim();
    const reportUrl = titleEl.attr('href') || '';

    if (!reportTitle || !reportUrl) return;

    // Extract company symbol from URL or title
    const symbolMatch = reportUrl.match(/ng-([a-z]+)/i) || reportTitle.match(/\(([A-Z]+)\.ng\)/i);
    const symbol = symbolMatch ? symbolMatch[1].toUpperCase() : '';

    if (!symbol) return;

    // Determine report type
    let reportType: 'annual' | 'interim' | 'quarterly' = 'annual';
    const lowerTitle = reportTitle.toLowerCase();
    if (lowerTitle.includes('interim') || lowerTitle.includes('half') || lowerTitle.includes('hy')) {
      reportType = 'interim';
    } else if (lowerTitle.includes('q1') || lowerTitle.includes('q2') || lowerTitle.includes('q3') || lowerTitle.includes('q4')) {
      reportType = 'quarterly';
    }

    // Extract year
    const yearMatch = reportTitle.match(/20\d{2}/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

    // Extract company name
    const companyName = reportTitle.split('(')[0].trim();

    // Extract date
    const dateText = $el.find('.date, time, .published').first().text().trim();
    const publishedAt = parseDate(dateText);

    reports.push({
      symbol,
      companyName,
      reportType,
      reportTitle,
      reportUrl: reportUrl.startsWith('http') ? reportUrl : `https://africanfinancials.com${reportUrl}`,
      year,
      publishedAt,
    });
  });

  return reports;
}

export async function getReportDetails(reportUrl: string): Promise<Partial<FinancialReport> | null> {
  console.log('Fetching report details from:', reportUrl);

  const html = await fetchWithRetry(reportUrl);
  if (!html) return null;

  const $ = cheerio.load(html);

  const details: Partial<FinancialReport> = {};

  // Try to find document download link
  const downloadLink = $('a[href*=".pdf"], a:contains("Download"), .download-link').first().attr('href');
  if (downloadLink) {
    details.documentUrl = downloadLink.startsWith('http') ? downloadLink : `https://africanfinancials.com${downloadLink}`;
  }

  // Extract highlights from the page content
  const content = $('.entry-content, .document-content, .report-summary').text();
  const highlights: ReportHighlights = {};

  // Revenue
  const revenueMatch = content.match(/(?:total\s+)?revenue[:\s]+(?:NGN\s*)?([₦\d.,]+\s*(?:billion|million|bn|mn|b|m)?)/i);
  if (revenueMatch) {
    highlights.revenue = parseAmount(revenueMatch[1]);
  }

  // Profit
  const profitPatterns = [
    /profit\s+(?:after|before)\s+tax[:\s]+(?:NGN\s*)?([₦\d.,]+\s*(?:billion|million|bn|mn|b|m)?)/i,
    /net\s+(?:profit|income)[:\s]+(?:NGN\s*)?([₦\d.,]+\s*(?:billion|million|bn|mn|b|m)?)/i,
    /PAT[:\s]+(?:NGN\s*)?([₦\d.,]+\s*(?:billion|million|bn|mn|b|m)?)/i,
  ];
  for (const pattern of profitPatterns) {
    const match = content.match(pattern);
    if (match) {
      highlights.profit = parseAmount(match[1]);
      break;
    }
  }

  // Total Assets
  const assetsMatch = content.match(/total\s+assets[:\s]+(?:NGN\s*)?([₦\d.,]+\s*(?:billion|trillion|million|bn|tn|mn|b|t|m)?)/i);
  if (assetsMatch) {
    highlights.totalAssets = parseAmount(assetsMatch[1]);
  }

  // EPS
  const epsMatch = content.match(/(?:earnings|EPS)[:\s]+(?:NGN\s*)?([₦\d.,]+)\s*(?:per\s+share)?/i);
  if (epsMatch) {
    highlights.eps = parseAmount(epsMatch[1]);
  }

  // Dividend
  const dividendMatch = content.match(/(?:final\s+)?dividend[:\s]+(?:NGN\s*)?([₦\d.,]+)\s*(?:per\s+share|kobo)?/i);
  if (dividendMatch) {
    highlights.dividendPerShare = parseAmount(dividendMatch[1]);
  }

  if (Object.keys(highlights).length > 0) {
    details.highlights = highlights;
  }

  return details;
}

// Utility to check if African Financials has data for a symbol
export function hasAfricanFinancialsData(symbol: string): boolean {
  return symbol.toUpperCase() in SYMBOL_TO_SLUG_MAP;
}

// Get the list of supported symbols
export function getSupportedSymbols(): string[] {
  return Object.keys(SYMBOL_TO_SLUG_MAP);
}
