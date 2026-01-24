import axios from 'axios';
import * as cheerio from 'cheerio';

export interface FinancialReport {
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
  dividend?: number;
  dividendPerShare?: number;
  grossEarnings?: number;
  operatingProfit?: number;
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
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Comprehensive mapping of NGX symbols to African Financials URL slugs
// Based on actual africanfinancials.com URL patterns
const SYMBOL_TO_SLUG_MAP: { [key: string]: { slug: string; name: string } } = {
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
  'MCNICHOLS': { slug: 'mcnich', name: 'McNichols Plc' },
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
  'PRESTIGE': { slug: 'prestige', name: 'Prestige Assurance Plc' },
  'REGALINS': { slug: 'regal', name: 'Regency Assurance Plc' },
  'SOVRENINS': { slug: 'sovren', name: 'Sovereign Trust Insurance Plc' },
  'UNIVINSURE': { slug: 'univins', name: 'Universal Insurance Plc' },
  'WAPIC': { slug: 'wapic', name: 'Wapic Insurance Plc' },

  // Conglomerates
  'TRANSCORP': { slug: 'transc', name: 'Transnational Corporation Plc' },
  'UACN': { slug: 'uacn', name: 'UAC of Nigeria Plc' },
  'JOHNHOLT': { slug: 'johnholt', name: 'John Holt Plc' },
  'PZ': { slug: 'pz', name: 'PZ Cussons Nigeria Plc' },
  'SCOA': { slug: 'scoa', name: 'SCOA Nigeria Plc' },

  // Financial Services
  'AFRIPR': { slug: 'afripr', name: 'Africa Prudential Plc' },
  'UCAP': { slug: 'ucap', name: 'United Capital Plc' },
  'NGXGROUP': { slug: 'ngxgr', name: 'NGX Group Plc' },
  'ROYALEX': { slug: 'royal', name: 'Royal Exchange Plc' },
  'FIDSON': { slug: 'fidson', name: 'Fidson Healthcare Plc' },
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
  'PHARMDEKO': { slug: 'pharmd', name: 'Pharma-Deko Plc' },
  'NEIMETH': { slug: 'neimeth', name: 'Neimeth International Pharmaceuticals Plc' },
  'GLAXOSMITH': { slug: 'glaxo', name: 'GlaxoSmithKline Consumer Nigeria Plc' },
  'MAYBAKER': { slug: 'maybak', name: 'May & Baker Nigeria Plc' },
  'MORISON': { slug: 'moris', name: 'Morison Industries Plc' },

  // Industrial
  'BERGER': { slug: 'berger', name: 'Berger Paints Nigeria Plc' },
  'CUTIX': { slug: 'cutix', name: 'Cutix Plc' },
  'MEYER': { slug: 'meyer', name: 'Meyer Plc' },
  'BETAGLAS': { slug: 'betag', name: 'Beta Glass Plc' },
  'AUSTINLAZ': { slug: 'austin', name: 'Austin Laz & Company Plc' },
  'CAP': { slug: 'cap', name: 'Chemical and Allied Products Plc' },
  'DNMEYER': { slug: 'dnmeyer', name: 'DN Tyre & Rubber Plc' },
  'RTBRISCOE': { slug: 'rtbris', name: 'RT Briscoe Plc' },

  // Hospitality
  'TRANSCOHOT': { slug: 'transh', name: 'Transcorp Hotels Plc' },
  'TANTALIZER': { slug: 'tantal', name: 'Tantalizers Plc' },

  // Services
  'REDSTAREX': { slug: 'redstar', name: 'Red Star Express Plc' },
  'LEARNAFRCA': { slug: 'learn', name: 'Learn Africa Plc' },
  'ACADEMY': { slug: 'academy', name: 'Academy Press Plc' },
  'ABCTRANS': { slug: 'abc', name: 'ABC Transport Plc' },
};

// Report type codes used in African Financials URLs
const REPORT_TYPE_CODES = {
  annual: 'ar',
  abridged: 'ab',
  interim: 'ir',
};

// Period codes for interim reports
const PERIOD_CODES = {
  annual: '00',
  q1: 'q1',
  q2: 'q2',
  q3: 'q3',
  q4: 'q4',
  hy: 'hy',
  h1: 'hy',
  h2: 'h2',
};

function getCompanyInfo(symbol: string): { slug: string; name: string } | null {
  const upperSymbol = symbol.toUpperCase();
  return SYMBOL_TO_SLUG_MAP[upperSymbol] || null;
}

// Generate direct URL for a specific report
function generateReportUrl(slug: string, year: number, reportType: string, period: string): string {
  return `https://africanfinancials.com/document/ng-${slug}-${year}-${reportType}-${period}/`;
}

// Generate company page URL
function generateCompanyUrl(slug: string): string {
  return `https://africanfinancials.com/company/ng-${slug}/`;
}

async function fetchWithRetry(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0',
        },
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
      });

      if (response.status === 404) {
        return null;
      }

      if (response.status === 403) {
        console.log(`Access forbidden for ${url}, retrying with delay...`);
        await delay(5000 * (i + 1));
        continue;
      }

      return response.data;
    } catch (error: any) {
      console.error(`Fetch attempt ${i + 1} failed for ${url}:`, error.message);
      if (i < retries - 1) {
        await delay(3000 * (i + 1));
      }
    }
  }
  return null;
}

function parseAmount(text: string): number | undefined {
  if (!text) return undefined;

  // Remove currency symbols and whitespace
  const cleaned = text.replace(/[₦NGN$USD€£,\s]/gi, '').trim();

  // Handle billions/millions/thousands/trillions
  const multipliers: { [key: string]: number } = {
    'trillion': 1e12,
    'billion': 1e9,
    'million': 1e6,
    'thousand': 1e3,
    'tn': 1e12,
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
      const numMatch = cleaned.match(/[\d.]+/);
      if (numMatch) {
        const numPart = parseFloat(numMatch[0]);
        if (!isNaN(numPart)) {
          return numPart * multiplier;
        }
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
  const monthMap: { [key: string]: number } = {
    'jan': 0, 'january': 0,
    'feb': 1, 'february': 1,
    'mar': 2, 'march': 2,
    'apr': 3, 'april': 3,
    'may': 4,
    'jun': 5, 'june': 5,
    'jul': 6, 'july': 6,
    'aug': 7, 'august': 7,
    'sep': 8, 'september': 8,
    'oct': 9, 'october': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11,
  };

  // Format: "March 26, 2025" or "26 March 2025"
  const match1 = cleaned.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (match1) {
    const month = monthMap[match1[1].toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(match1[3]), month, parseInt(match1[2]));
    }
  }

  const match2 = cleaned.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/i);
  if (match2) {
    const month = monthMap[match2[2].toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(match2[3]), month, parseInt(match2[1]));
    }
  }

  return undefined;
}

// Extract financial highlights from report page content
function extractHighlights(content: string): ReportHighlights {
  const highlights: ReportHighlights = {};

  // Gross earnings (for banks)
  const grossEarningsMatch = content.match(/gross\s+earnings[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn|t|b|m)?)/i);
  if (grossEarningsMatch) {
    highlights.grossEarnings = parseAmount(grossEarningsMatch[1]);
  }

  // Revenue patterns
  const revenuePatterns = [
    /(?:total\s+)?revenue[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn|t|b|m)?)/i,
    /revenue\s+(?:of|reached|surged|grew)\s+(?:to\s+)?(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn|t|b|m)?)/i,
  ];
  for (const pattern of revenuePatterns) {
    const match = content.match(pattern);
    if (match && !highlights.revenue) {
      highlights.revenue = parseAmount(match[1]);
    }
  }

  // Profit patterns
  const profitPatterns = [
    /profit\s+(?:after|before)\s+tax[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn|t|b|m)?)/i,
    /(?:net\s+)?profit[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn|t|b|m)?)/i,
    /PAT[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn|t|b|m)?)/i,
    /PBT[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn|t|b|m)?)/i,
  ];
  for (const pattern of profitPatterns) {
    const match = content.match(pattern);
    if (match && !highlights.profit) {
      highlights.profit = parseAmount(match[1]);
    }
  }

  // Operating profit
  const opProfitMatch = content.match(/operating\s+(?:profit|income)[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn|t|b|m)?)/i);
  if (opProfitMatch) {
    highlights.operatingProfit = parseAmount(opProfitMatch[1]);
  }

  // Total Assets
  const assetsMatch = content.match(/total\s+assets[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+\s*(?:trillion|billion|million|tn|bn|mn|t|b|m)?)/i);
  if (assetsMatch) {
    highlights.totalAssets = parseAmount(assetsMatch[1]);
  }

  // EPS
  const epsPatterns = [
    /(?:earnings|EPS|basic\s+earnings)\s*(?:per\s+share)?[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+)/i,
    /EPS[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+)\s*(?:kobo)?/i,
  ];
  for (const pattern of epsPatterns) {
    const match = content.match(pattern);
    if (match && !highlights.eps) {
      const val = parseAmount(match[1]);
      // Convert kobo to Naira if needed
      highlights.eps = content.toLowerCase().includes('kobo') && val ? val / 100 : val;
    }
  }

  // Dividend
  const dividendPatterns = [
    /(?:final\s+)?dividend[:\s]+(?:NGN\s*)?[₦]?([₦\d.,]+)\s*(?:per\s+share|kobo)?/i,
    /recommends?\s+(?:a\s+)?(?:final\s+)?dividend\s+of\s+([₦\d.,]+)\s*(?:kobo|per\s+share)?/i,
  ];
  for (const pattern of dividendPatterns) {
    const match = content.match(pattern);
    if (match && !highlights.dividendPerShare) {
      const val = parseAmount(match[1]);
      // Convert kobo to Naira if needed
      highlights.dividendPerShare = content.toLowerCase().includes('kobo') && val ? val / 100 : val;
    }
  }

  return highlights;
}

// Try to fetch a specific report and extract details
async function fetchReportDetails(url: string, symbol: string, companyName: string, year: number, reportType: 'annual' | 'interim' | 'quarterly' | 'abridged', period?: string): Promise<FinancialReport | null> {
  const html = await fetchWithRetry(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  // Get the title
  const title = $('h1.entry-title, h1').first().text().trim() ||
                $('title').text().split('|')[0].trim() ||
                `${companyName} ${year} ${reportType} Report`;

  // Get published date
  const dateText = $('.published, .entry-date, time, .date').first().text().trim() ||
                   $('meta[property="article:published_time"]').attr('content') || '';
  const publishedAt = parseDate(dateText);

  // Get document URL (PDF link)
  let documentUrl: string | undefined;
  const pdfLink = $('a[href*=".pdf"]').first().attr('href');
  if (pdfLink) {
    documentUrl = pdfLink.startsWith('http') ? pdfLink : `https://africanfinancials.com${pdfLink}`;
  }

  // Extract content for highlights
  const content = $('.entry-content, .document-content, article').text();
  const highlights = extractHighlights(content);

  return {
    symbol: symbol.toUpperCase(),
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
}

// Main function to scrape company data using direct URL approach
export async function scrapeCompanyData(symbol: string): Promise<CompanyFinancialData | null> {
  const companyInfo = getCompanyInfo(symbol);
  if (!companyInfo) {
    console.log(`No African Financials mapping for symbol: ${symbol}`);
    return null;
  }

  const { slug, name: companyName } = companyInfo;
  const companyUrl = generateCompanyUrl(slug);

  console.log(`Scraping African Financials for ${symbol} (${slug}) - ${companyName}`);

  const reports: FinancialReport[] = [];
  const dividends: DividendInfo[] = [];
  const currentYear = new Date().getFullYear();

  // Try to fetch reports for the last 3 years
  const yearsToFetch = [currentYear, currentYear - 1, currentYear - 2];

  // Report types and periods to try
  const reportConfigs = [
    { type: 'ar' as const, period: '00', reportType: 'annual' as const },
    { type: 'ab' as const, period: '00', reportType: 'abridged' as const },
    { type: 'ir' as const, period: 'q1', reportType: 'quarterly' as const, periodLabel: 'Q1' },
    { type: 'ir' as const, period: 'q2', reportType: 'quarterly' as const, periodLabel: 'Q2' },
    { type: 'ir' as const, period: 'q3', reportType: 'quarterly' as const, periodLabel: 'Q3' },
    { type: 'ir' as const, period: 'hy', reportType: 'interim' as const, periodLabel: 'HY' },
  ];

  for (const year of yearsToFetch) {
    for (const config of reportConfigs) {
      const url = generateReportUrl(slug, year, config.type, config.period);

      try {
        const report = await fetchReportDetails(
          url,
          symbol,
          companyName,
          year,
          config.reportType,
          config.periodLabel
        );

        if (report) {
          reports.push(report);
          console.log(`Found: ${report.reportTitle}`);
        }

        // Small delay between requests to be respectful
        await delay(500);
      } catch (error) {
        // Report doesn't exist, continue
      }
    }
  }

  // Also try to scrape the company page for additional dividend info
  try {
    const companyHtml = await fetchWithRetry(companyUrl);
    if (companyHtml) {
      const $ = cheerio.load(companyHtml);

      // Look for dividend declarations
      $('.dividend, .dividend-item, [class*="dividend"]').each((_, el) => {
        const text = $(el).text();

        const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:NGN|₦|kobo|naira|per\s+share)/i);
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1]);
          const isKobo = text.toLowerCase().includes('kobo');

          let dividendType: 'final' | 'interim' | 'special' = 'final';
          if (text.toLowerCase().includes('interim')) dividendType = 'interim';
          else if (text.toLowerCase().includes('special')) dividendType = 'special';

          const yearMatch = text.match(/20\d{2}/);
          const year = yearMatch ? parseInt(yearMatch[0]) : currentYear;

          const dateMatch = text.match(/(\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+\w+\s+\d{4})/);
          const declarationDate = dateMatch ? parseDate(dateMatch[0]) : undefined;

          dividends.push({
            symbol: symbol.toUpperCase(),
            companyName,
            dividendType,
            amount: isKobo ? amount / 100 : amount,
            currency: 'NGN',
            declarationDate,
            year,
          });
        }
      });
    }
  } catch (error) {
    console.log('Could not fetch company page for dividend info');
  }

  // Sort reports by year (newest first)
  reports.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    // Within same year, prioritize annual > abridged > interim > quarterly
    const typeOrder = { annual: 0, abridged: 1, interim: 2, quarterly: 3 };
    return typeOrder[a.reportType] - typeOrder[b.reportType];
  });

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

// Scrape Nigerian documents listing page
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
  $('article, .document-item, .post, tr.document').each((_, el) => {
    const $el = $(el);

    const titleEl = $el.find('h2 a, h3 a, .title a, .entry-title a, td a').first();
    const reportTitle = titleEl.text().trim();
    const reportUrl = titleEl.attr('href') || '';

    if (!reportTitle || !reportUrl) return;

    // Extract company symbol from URL pattern ng-{slug}-{year}-{type}-{period}
    const urlMatch = reportUrl.match(/ng-([a-z]+)-(\d{4})-([a-z]+)-([a-z0-9]+)/i);
    if (!urlMatch) return;

    const [, urlSlug, yearStr, typeCode, periodCode] = urlMatch;
    const year = parseInt(yearStr);

    // Find symbol from slug
    let symbol = '';
    let companyName = '';
    for (const [sym, info] of Object.entries(SYMBOL_TO_SLUG_MAP)) {
      if (info.slug === urlSlug) {
        symbol = sym;
        companyName = info.name;
        break;
      }
    }

    if (!symbol) {
      // Try to extract from title
      const titleSymbolMatch = reportTitle.match(/\(([A-Z]+)\.ng\)/i);
      if (titleSymbolMatch) {
        symbol = titleSymbolMatch[1].toUpperCase();
      }
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

    // Extract period label
    let period: string | undefined;
    if (periodCode === 'hy') period = 'HY';
    else if (periodCode.startsWith('q')) period = periodCode.toUpperCase();

    // Extract date
    const dateText = $el.find('.date, time, .published, .entry-meta').first().text().trim();
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

  return reports;
}

// Get report details from a specific report page
export async function getReportDetails(reportUrl: string): Promise<Partial<FinancialReport> | null> {
  console.log('Fetching report details from:', reportUrl);

  const html = await fetchWithRetry(reportUrl);
  if (!html) return null;

  const $ = cheerio.load(html);

  const details: Partial<FinancialReport> = {};

  // Try to find document download link
  const downloadLink = $('a[href*=".pdf"], a:contains("Download"), .download-link, a.btn-primary').first().attr('href');
  if (downloadLink) {
    details.documentUrl = downloadLink.startsWith('http') ? downloadLink : `https://africanfinancials.com${downloadLink}`;
  }

  // Extract highlights from the page content
  const content = $('.entry-content, .document-content, .report-summary, article').text();
  const highlights = extractHighlights(content);

  if (Object.keys(highlights).length > 0) {
    details.highlights = highlights;
  }

  return details;
}

// Check if African Financials has data for a symbol
export function hasAfricanFinancialsData(symbol: string): boolean {
  return symbol.toUpperCase() in SYMBOL_TO_SLUG_MAP;
}

// Get the list of supported symbols
export function getSupportedSymbols(): string[] {
  return Object.keys(SYMBOL_TO_SLUG_MAP);
}

// Get company info for a symbol
export function getCompanyInfoForSymbol(symbol: string): { slug: string; name: string; url: string } | null {
  const info = getCompanyInfo(symbol);
  if (!info) return null;
  return {
    ...info,
    url: generateCompanyUrl(info.slug),
  };
}

// Batch fetch reports for multiple symbols
export async function batchScrapeCompanies(symbols: string[], maxConcurrent = 3): Promise<Map<string, CompanyFinancialData | null>> {
  const results = new Map<string, CompanyFinancialData | null>();

  // Process in batches
  for (let i = 0; i < symbols.length; i += maxConcurrent) {
    const batch = symbols.slice(i, i + maxConcurrent);
    const promises = batch.map(async (symbol) => {
      const data = await scrapeCompanyData(symbol);
      results.set(symbol, data);
    });

    await Promise.all(promises);

    // Delay between batches
    if (i + maxConcurrent < symbols.length) {
      await delay(2000);
    }
  }

  return results;
}
