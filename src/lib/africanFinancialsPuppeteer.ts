import puppeteer, { Browser, Page } from 'puppeteer-core';
import * as cheerio from 'cheerio';

// Types
export interface ScrapedReport {
  symbol: string;
  companyName: string;
  reportType: 'annual' | 'interim' | 'quarterly' | 'abridged';
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
  profitBeforeTax?: number;
  totalAssets?: number;
  eps?: number;
  dividendPerShare?: number;
  grossEarnings?: number;
  operatingProfit?: number;
}

export interface SyncResult {
  symbol: string;
  success: boolean;
  reportsFound: number;
  error?: string;
  duration: number;
}

export interface BatchSyncResult {
  batchId: string;
  startedAt: Date;
  completedAt: Date;
  totalSymbols: number;
  successCount: number;
  failureCount: number;
  results: SyncResult[];
}

// Company mappings (NGX Symbol -> African Financials slug)
export const COMPANY_MAPPINGS: Record<string, { slug: string; name: string }> = {
  // Banks
  'ZENITHBANK': { slug: 'zenith', name: 'Zenith Bank PLC' },
  'GTCO': { slug: 'gtco', name: 'Guaranty Trust Holding Company Plc' },
  'UBA': { slug: 'uba', name: 'United Bank for Africa PLC' },
  'ACCESSCORP': { slug: 'access', name: 'Access Holdings Plc' },
  'FBNH': { slug: 'fbnh', name: 'FBN Holdings Plc' },
  'STANBIC': { slug: 'ibtc', name: 'Stanbic IBTC Holdings Plc' },
  'FCMB': { slug: 'fcmb', name: 'FCMB Group Plc' },
  'FIDELITYBK': { slug: 'fidelity', name: 'Fidelity Bank Plc' },
  'STERLINGNG': { slug: 'sterlng', name: 'Sterling Financial Holdings Company Plc' },
  'WEMABANK': { slug: 'wema', name: 'Wema Bank Plc' },
  'JAIZBANK': { slug: 'jaiz', name: 'Jaiz Bank Plc' },
  'UNITYBNK': { slug: 'unity', name: 'Unity Bank Plc' },

  // Telecoms
  'MTNN': { slug: 'mtn', name: 'MTN Nigeria Communications Plc' },
  'AIRTELAFRI': { slug: 'airtel', name: 'Airtel Africa Plc' },

  // Consumer Goods
  'NESTLE': { slug: 'nestle', name: 'Nestle Nigeria Plc' },
  'NB': { slug: 'nb', name: 'Nigerian Breweries Plc' },
  'GUINNESS': { slug: 'guinness', name: 'Guinness Nigeria Plc' },
  'UNILEVER': { slug: 'unilever', name: 'Unilever Nigeria Plc' },
  'CADBURY': { slug: 'cadbury', name: 'Cadbury Nigeria Plc' },
  'INTBREW': { slug: 'intbrew', name: 'International Breweries Plc' },
  'CHAMPION': { slug: 'champion', name: 'Champion Breweries Plc' },
  'FLOURMILL': { slug: 'flourm', name: 'Flour Mills Nigeria PLC' },
  'NASCON': { slug: 'nascon', name: 'NASCON Allied Industries Plc' },
  'DANGSUGAR': { slug: 'dangsu', name: 'Dangote Sugar Refinery Plc' },
  'BUAFOODS': { slug: 'buafoods', name: 'BUA Foods Plc' },
  'HONEYFLOUR': { slug: 'honeyfl', name: 'Honeywell Flour Mills Plc' },
  'VITAFOAM': { slug: 'vitafoam', name: 'Vitafoam Nigeria Plc' },

  // Cement & Building Materials
  'DANGCEM': { slug: 'dangce', name: 'Dangote Cement Plc' },
  'BUACEMENT': { slug: 'buace', name: 'BUA Cement Plc' },
  'WAPCO': { slug: 'wapco', name: 'Lafarge Africa Plc' },
  'JBERGER': { slug: 'jberger', name: 'Julius Berger Nigeria Plc' },

  // Oil & Gas
  'SEPLAT': { slug: 'seplat', name: 'Seplat Energy Plc' },
  'OANDO': { slug: 'oando', name: 'Oando Plc' },
  'CONOIL': { slug: 'conoil', name: 'Conoil Plc' },
  'ETERNA': { slug: 'eterna', name: 'Eterna Plc' },
  'TOTAL': { slug: 'total', name: 'TotalEnergies Marketing Nigeria Plc' },
  'ARDOVA': { slug: 'ardova', name: 'Ardova Plc' },
  'MRS': { slug: 'mrs', name: 'MRS Oil Nigeria Plc' },

  // Agriculture
  'PRESCO': { slug: 'presco', name: 'Presco Plc' },
  'OKOMUOIL': { slug: 'okomu', name: 'Okomu Oil Palm Company Plc' },
  'LIVESTOCK': { slug: 'livest', name: 'Livestock Feeds Plc' },
  'FTNCOCOA': { slug: 'ftncocoa', name: 'FTN Cocoa Processors Plc' },
  'ELLAHLAKES': { slug: 'ellah', name: 'Ellah Lakes Plc' },

  // Insurance
  'CUSTODIAN': { slug: 'custod', name: 'Custodian Investment Plc' },
  'AIICO': { slug: 'aiico', name: 'AIICO Insurance Plc' },
  'CORNERST': { slug: 'corners', name: 'Cornerstone Insurance Plc' },
  'MANSARD': { slug: 'axamans', name: 'AXA Mansard Insurance Plc' },
  'LASACO': { slug: 'lasaco', name: 'LASACO Assurance Plc' },
  'NEM': { slug: 'nem', name: 'NEM Insurance Plc' },
  'LINKASSURE': { slug: 'linkas', name: 'Linkage Assurance Plc' },
  'VERITASKAP': { slug: 'veritas', name: 'Veritas Kapital Assurance Plc' },
  'CHIPLC': { slug: 'chi', name: 'Consolidated Hallmark Insurance Plc' },
  'WAPIC': { slug: 'wapic', name: 'Wapic Insurance Plc' },

  // Conglomerates
  'TRANSCORP': { slug: 'transc', name: 'Transnational Corporation Plc' },
  'UACN': { slug: 'uacn', name: 'UAC of Nigeria Plc' },
  'JOHNHOLT': { slug: 'johnholt', name: 'John Holt Plc' },
  'PZ': { slug: 'pz', name: 'PZ Cussons Nigeria Plc' },

  // Financial Services
  'AFRIPR': { slug: 'afripr', name: 'Africa Prudential Plc' },
  'UCAP': { slug: 'ucap', name: 'United Capital Plc' },
  'NGXGROUP': { slug: 'ngxgr', name: 'NGX Group Plc' },
  'GEREGU': { slug: 'geregu', name: 'Geregu Power Plc' },

  // Real Estate
  'UPDC': { slug: 'updc', name: 'UPDC Plc' },
  'UPDCREIT': { slug: 'updcre', name: 'UPDC Real Estate Investment Trust' },

  // Technology
  'ETRANZACT': { slug: 'etrans', name: 'eTranzact International Plc' },
  'CHAMS': { slug: 'chams', name: 'Chams Holding Company Plc' },
  'COURTVILLE': { slug: 'court', name: 'Courteville Business Solutions Plc' },
  'CWG': { slug: 'cwg', name: 'CWG Plc' },

  // Healthcare
  'FIDSON': { slug: 'fidson', name: 'Fidson Healthcare Plc' },
  'NEIMETH': { slug: 'neimeth', name: 'Neimeth International Pharmaceuticals Plc' },
  'GLAXOSMITH': { slug: 'glaxo', name: 'GlaxoSmithKline Consumer Nigeria Plc' },
  'MAYBAKER': { slug: 'maybak', name: 'May & Baker Nigeria Plc' },

  // Industrial
  'BERGER': { slug: 'berger', name: 'Berger Paints Nigeria Plc' },
  'CUTIX': { slug: 'cutix', name: 'Cutix Plc' },
  'BETAGLAS': { slug: 'betag', name: 'Beta Glass Plc' },
  'CAP': { slug: 'cap', name: 'Chemical and Allied Products Plc' },

  // Hospitality
  'TRANSCOHOT': { slug: 'transh', name: 'Transcorp Hotels Plc' },

  // Services
  'REDSTAREX': { slug: 'redstar', name: 'Red Star Express Plc' },
  'LEARNAFRCA': { slug: 'learn', name: 'Learn Africa Plc' },
};

// Browser configuration
interface BrowserConfig {
  headless: boolean;
  executablePath?: string;
  args: string[];
}

function getBrowserConfig(): BrowserConfig {
  // Check for Chromium in common locations
  const chromiumPaths = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    process.env.PUPPETEER_EXECUTABLE_PATH,
  ].filter(Boolean);

  return {
    headless: true,
    executablePath: chromiumPaths.find(p => p) || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080',
    ],
  };
}

// Browser pool for managing connections
class BrowserPool {
  private browser: Browser | null = null;
  private isInitializing = false;
  private initPromise: Promise<Browser> | null = null;

  async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = this.initBrowser();

    try {
      this.browser = await this.initPromise;
      return this.browser;
    } finally {
      this.isInitializing = false;
    }
  }

  private async initBrowser(): Promise<Browser> {
    const config = getBrowserConfig();
    console.log('Initializing Puppeteer browser...');

    try {
      const browser = await puppeteer.launch({
        headless: config.headless,
        executablePath: config.executablePath,
        args: config.args,
      });

      console.log('Browser initialized successfully');
      return browser;
    } catch (error: any) {
      console.error('Failed to initialize browser:', error.message);
      throw error;
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Singleton browser pool
const browserPool = new BrowserPool();

// Helper functions
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseAmount(text: string): number | undefined {
  if (!text) return undefined;

  const cleaned = text.replace(/[₦NGN$USD€£,\s]/gi, '').trim();

  const multipliers: Record<string, number> = {
    'trillion': 1e12, 'tn': 1e12, 't': 1e12,
    'billion': 1e9, 'bn': 1e9, 'b': 1e9,
    'million': 1e6, 'mn': 1e6, 'm': 1e6,
    'thousand': 1e3, 'k': 1e3,
  };

  const lowerText = text.toLowerCase();
  for (const [suffix, multiplier] of Object.entries(multipliers)) {
    if (lowerText.includes(suffix)) {
      const numMatch = cleaned.match(/[\d.]+/);
      if (numMatch) {
        const num = parseFloat(numMatch[0]);
        if (!isNaN(num)) return num * multiplier;
      }
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

function parseDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;

  const date = new Date(dateStr.trim());
  if (!isNaN(date.getTime())) return date;

  const monthMap: Record<string, number> = {
    'jan': 0, 'january': 0, 'feb': 1, 'february': 1,
    'mar': 2, 'march': 2, 'apr': 3, 'april': 3,
    'may': 4, 'jun': 5, 'june': 5, 'jul': 6, 'july': 6,
    'aug': 7, 'august': 7, 'sep': 8, 'september': 8,
    'oct': 9, 'october': 9, 'nov': 10, 'november': 10,
    'dec': 11, 'december': 11,
  };

  // Try "March 26, 2025" format
  const match1 = dateStr.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (match1) {
    const month = monthMap[match1[1].toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(match1[3]), month, parseInt(match1[2]));
    }
  }

  // Try "26 March 2025" format
  const match2 = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
  if (match2) {
    const month = monthMap[match2[2].toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(match2[3]), month, parseInt(match2[1]));
    }
  }

  return undefined;
}

function extractHighlights(content: string): ReportHighlights {
  const highlights: ReportHighlights = {};

  // Gross earnings
  const grossMatch = content.match(/gross\s+earnings[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn)?)/i);
  if (grossMatch) highlights.grossEarnings = parseAmount(grossMatch[1]);

  // Revenue
  const revenueMatch = content.match(/(?:total\s+)?revenue[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn)?)/i);
  if (revenueMatch) highlights.revenue = parseAmount(revenueMatch[1]);

  // Profit after tax
  const patMatch = content.match(/profit\s+after\s+tax[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn)?)/i);
  if (patMatch) highlights.profit = parseAmount(patMatch[1]);

  // Profit before tax
  const pbtMatch = content.match(/profit\s+before\s+tax[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn)?)/i);
  if (pbtMatch) highlights.profitBeforeTax = parseAmount(pbtMatch[1]);

  // Operating profit
  const opMatch = content.match(/operating\s+(?:profit|income)[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn)?)/i);
  if (opMatch) highlights.operatingProfit = parseAmount(opMatch[1]);

  // Total assets
  const assetsMatch = content.match(/total\s+assets[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn)?)/i);
  if (assetsMatch) highlights.totalAssets = parseAmount(assetsMatch[1]);

  // EPS
  const epsMatch = content.match(/(?:earnings|EPS|basic\s+earnings)\s*(?:per\s+share)?[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+)/i);
  if (epsMatch) {
    const val = parseAmount(epsMatch[1]);
    highlights.eps = content.toLowerCase().includes('kobo') && val ? val / 100 : val;
  }

  // Dividend
  const divMatch = content.match(/(?:final\s+)?dividend[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+)\s*(?:per\s+share|kobo)?/i);
  if (divMatch) {
    const val = parseAmount(divMatch[1]);
    highlights.dividendPerShare = content.toLowerCase().includes('kobo') && val ? val / 100 : val;
  }

  return highlights;
}

// Generate report URL
function generateReportUrl(slug: string, year: number, type: string, period: string): string {
  return `https://africanfinancials.com/document/ng-${slug}-${year}-${type}-${period}/`;
}

// Scrape a single report page
async function scrapeReportPage(
  page: Page,
  url: string,
  symbol: string,
  companyName: string,
  year: number,
  reportType: 'annual' | 'interim' | 'quarterly' | 'abridged',
  period?: string
): Promise<ScrapedReport | null> {
  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    if (!response || response.status() === 404) {
      return null;
    }

    if (response.status() === 403) {
      console.log(`Access forbidden for ${url}, will retry later`);
      return null;
    }

    // Wait for content to load
    await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});

    const content = await page.content();
    const $ = cheerio.load(content);

    // Get title
    const title = $('h1.entry-title, h1').first().text().trim() ||
                  $('title').text().split('|')[0].trim() ||
                  `${companyName} ${year} ${reportType} Report`;

    // Get published date
    const dateText = $('.published, .entry-date, time, .date').first().text().trim() ||
                     $('meta[property="article:published_time"]').attr('content') || '';
    const publishedAt = parseDate(dateText);

    // Get PDF link
    let documentUrl: string | undefined;
    const pdfLink = $('a[href*=".pdf"]').first().attr('href');
    if (pdfLink) {
      documentUrl = pdfLink.startsWith('http') ? pdfLink : `https://africanfinancials.com${pdfLink}`;
    }

    // Extract highlights
    const pageText = $('.entry-content, .document-content, article').text();
    const highlights = extractHighlights(pageText);

    return {
      symbol,
      companyName,
      reportType,
      reportTitle: title,
      reportUrl: url,
      documentUrl,
      year,
      period,
      publishedAt,
      highlights: Object.keys(highlights).length > 0 ? highlights : undefined,
    };
  } catch (error: any) {
    console.error(`Error scraping ${url}:`, error.message);
    return null;
  }
}

// Scrape all reports for a single company
export async function scrapeCompanyReports(symbol: string): Promise<SyncResult> {
  const startTime = Date.now();
  const mapping = COMPANY_MAPPINGS[symbol.toUpperCase()];

  if (!mapping) {
    return {
      symbol,
      success: false,
      reportsFound: 0,
      error: 'No mapping found for symbol',
      duration: Date.now() - startTime,
    };
  }

  const { slug, name: companyName } = mapping;
  const reports: ScrapedReport[] = [];
  const currentYear = new Date().getFullYear();
  const yearsToScrape = [currentYear, currentYear - 1, currentYear - 2];

  // Report configurations to try
  const reportConfigs = [
    { type: 'ar', period: '00', reportType: 'annual' as const },
    { type: 'ab', period: '00', reportType: 'abridged' as const },
    { type: 'ir', period: 'q1', reportType: 'quarterly' as const, periodLabel: 'Q1' },
    { type: 'ir', period: 'q2', reportType: 'quarterly' as const, periodLabel: 'Q2' },
    { type: 'ir', period: 'q3', reportType: 'quarterly' as const, periodLabel: 'Q3' },
    { type: 'ir', period: 'hy', reportType: 'interim' as const, periodLabel: 'HY' },
  ];

  let browser: Browser;
  let page: Page;

  try {
    browser = await browserPool.getBrowser();
    page = await browser.newPage();

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Block unnecessary resources for faster loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`Scraping reports for ${symbol} (${slug})...`);

    for (const year of yearsToScrape) {
      for (const config of reportConfigs) {
        const url = generateReportUrl(slug, year, config.type, config.period);

        const report = await scrapeReportPage(
          page,
          url,
          symbol,
          companyName,
          year,
          config.reportType,
          config.periodLabel
        );

        if (report) {
          reports.push(report);
          console.log(`  Found: ${report.reportTitle}`);
        }

        // Small delay between requests
        await delay(500);
      }
    }

    await page.close();

    return {
      symbol,
      success: true,
      reportsFound: reports.length,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error(`Error scraping ${symbol}:`, error.message);
    return {
      symbol,
      success: false,
      reportsFound: 0,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

// Scrape Nigerian documents listing page
export async function scrapeNigerianDocumentsPage(): Promise<ScrapedReport[]> {
  const url = 'https://africanfinancials.com/nigeria-listed-company-documents/';
  const reports: ScrapedReport[] = [];

  let browser: Browser;
  let page: Page;

  try {
    browser = await browserPool.getBrowser();
    page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    // Block images/styles for faster loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log('Scraping Nigerian documents listing...');

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Wait for content
    await page.waitForSelector('article, .document-item, .post', { timeout: 10000 }).catch(() => {});

    // Scroll to load more content
    await autoScroll(page);

    const content = await page.content();
    const $ = cheerio.load(content);

    // Parse document listings
    $('article, .document-item, .post').each((_, el) => {
      const $el = $(el);
      const titleEl = $el.find('h2 a, h3 a, .entry-title a, .title a').first();
      const reportTitle = titleEl.text().trim();
      const reportUrl = titleEl.attr('href') || '';

      if (!reportTitle || !reportUrl) return;

      // Parse URL pattern: ng-{slug}-{year}-{type}-{period}
      const urlMatch = reportUrl.match(/ng-([a-z]+)-(\d{4})-([a-z]+)-([a-z0-9]+)/i);
      if (!urlMatch) return;

      const [, urlSlug, yearStr, typeCode, periodCode] = urlMatch;
      const year = parseInt(yearStr);

      // Find symbol from slug
      let symbol = '';
      let companyName = '';
      for (const [sym, info] of Object.entries(COMPANY_MAPPINGS)) {
        if (info.slug === urlSlug) {
          symbol = sym;
          companyName = info.name;
          break;
        }
      }

      if (!symbol) {
        // Try to extract from title
        const titleMatch = reportTitle.match(/\(([A-Z]+)\.ng\)/i);
        if (titleMatch) symbol = titleMatch[1].toUpperCase();
        companyName = reportTitle.split('(')[0].trim();
      }

      if (!symbol) return;

      // Determine report type
      let reportType: 'annual' | 'interim' | 'quarterly' | 'abridged' = 'annual';
      if (typeCode === 'ir') {
        reportType = periodCode.startsWith('q') ? 'quarterly' : 'interim';
      } else if (typeCode === 'ab') {
        reportType = 'abridged';
      }

      let period: string | undefined;
      if (periodCode === 'hy') period = 'HY';
      else if (periodCode.startsWith('q')) period = periodCode.toUpperCase();

      const dateText = $el.find('.date, time, .published').first().text().trim();
      const publishedAt = parseDate(dateText);

      reports.push({
        symbol,
        companyName,
        reportType,
        reportTitle,
        reportUrl: reportUrl.startsWith('http') ? reportUrl : `https://africanfinancials.com${reportUrl}`,
        year,
        period,
        publishedAt,
      });
    });

    await page.close();
    console.log(`Found ${reports.length} reports on listing page`);

    return reports;
  } catch (error: any) {
    console.error('Error scraping documents page:', error.message);
    return [];
  }
}

// Auto-scroll to load lazy content
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const maxScrolls = 10;
      let scrollCount = 0;

      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrollCount++;

        if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

// Batch scrape multiple companies
export async function batchScrapeCompanies(
  symbols: string[],
  batchSize: number = 5,
  delayBetweenBatches: number = 5000
): Promise<BatchSyncResult> {
  const batchId = `batch_${Date.now()}`;
  const startedAt = new Date();
  const results: SyncResult[] = [];

  console.log(`Starting batch sync ${batchId} for ${symbols.length} symbols...`);

  // Process in batches
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(symbols.length / batchSize)}`);

    // Process batch sequentially to avoid overwhelming the server
    for (const symbol of batch) {
      const result = await scrapeCompanyReports(symbol);
      results.push(result);
    }

    // Delay between batches
    if (i + batchSize < symbols.length) {
      console.log(`Waiting ${delayBetweenBatches / 1000}s before next batch...`);
      await delay(delayBetweenBatches);
    }
  }

  const completedAt = new Date();
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  console.log(`Batch ${batchId} completed: ${successCount} success, ${failureCount} failures`);

  return {
    batchId,
    startedAt,
    completedAt,
    totalSymbols: symbols.length,
    successCount,
    failureCount,
    results,
  };
}

// Get all supported symbols
export function getAllSupportedSymbols(): string[] {
  return Object.keys(COMPANY_MAPPINGS);
}

// Check if symbol is supported
export function isSymbolSupported(symbol: string): boolean {
  return symbol.toUpperCase() in COMPANY_MAPPINGS;
}

// Get company info
export function getCompanyInfo(symbol: string): { slug: string; name: string; url: string } | null {
  const mapping = COMPANY_MAPPINGS[symbol.toUpperCase()];
  if (!mapping) return null;
  return {
    ...mapping,
    url: `https://africanfinancials.com/company/ng-${mapping.slug}/`,
  };
}

// Cleanup browser on process exit
export async function cleanup(): Promise<void> {
  await browserPool.closeBrowser();
}

// Register cleanup handlers
if (typeof process !== 'undefined') {
  process.on('exit', cleanup);
  process.on('SIGINT', async () => {
    await cleanup();
    process.exit();
  });
  process.on('SIGTERM', async () => {
    await cleanup();
    process.exit();
  });
}
