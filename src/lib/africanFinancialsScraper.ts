'use server';

export interface FinancialDocumentData {
  symbol: string;
  companyName: string;
  documentType: 'annual_report' | 'interim_report' | 'abridged_report' | 'presentation' | 'circular' | 'prospectus';
  year: number;
  period?: 'FY' | 'HY' | 'Q1' | 'Q2' | 'Q3' | 'Q4';
  title: string;
  summary: string;
  documentUrl: string;
  sourceUrl: string;
  publishedDate: Date;
  
  extractedMetrics?: {
    revenue?: number;
    revenueChange?: number;
    operatingProfit?: number;
    operatingProfitChange?: number;
    profitAfterTax?: number;
    profitAfterTaxChange?: number;
    earningsPerShare?: number;
    earningsPerSharePrior?: number;
    totalAssets?: number;
    totalEquity?: number;
    dividendPerShare?: number;
    returnOnEquity?: number;
  };
}

export interface SyncProgress {
  totalStocks: number;
  processedStocks: number;
  successfulStocks: number;
  failedStocks: number;
  totalDocuments: number;
  currentSymbol: string;
  startedAt: Date;
  lastUpdated: Date;
  status: 'idle' | 'running' | 'completed' | 'error';
  errors: string[];
}

const NGX_TO_AF_MAPPING: Record<string, string> = {
  'ACCESSCORP': 'accesscorp',
  'AIICO': 'aiico',
  'AIRTELAFRI': 'airtelafri',
  'ARADEL': 'aradel',
  'ARDOVA': 'ardova',
  'BERGER': 'berger',
  'BETAGLAS': 'betaglas',
  'BOCGAS': 'bocgas',
  'BUACEMENT': 'buacement',
  'BUAFOODS': 'buafoods',
  'CADBURY': 'cadbury',
  'CAP': 'cap',
  'CAVERTON': 'caverton',
  'CHAMPION': 'champion',
  'CHAMS': 'chams',
  'CONOIL': 'conoil',
  'CORNERST': 'cornerstone',
  'COURTVILLE': 'courtville',
  'CUSTODIAN': 'custodian',
  'CUTIX': 'cutix',
  'CWG': 'cwg',
  'DANGCEM': 'dangote-cement',
  'DANGSUGAR': 'dangote-sugar',
  'ECOBANK': 'ecobank',
  'EKOCORP': 'ekocorp',
  'ELLAHLAKES': 'ellah-lakes',
  'ETERNA': 'eterna',
  'ETRANZACT': 'etranzact',
  'FBNH': 'firstbank',
  'FCMB': 'fcmb',
  'FIDELITYBK': 'fidelity-bank',
  'FIDSON': 'fidson',
  'FLOURMILL': 'flour-mills',
  'FSDH': 'fsdh',
  'GEREGU': 'geregu',
  'GLAXOSMITH': 'gsk',
  'GTCO': 'gtco',
  'GUINNESS': 'guinness',
  'GUININS': 'guinea-insurance',
  'HONYFLOUR': 'honeywell-flour',
  'IKEJAHOTEL': 'ikeja-hotel',
  'INTBREW': 'international-breweries',
  'JAIZBANK': 'jaiz-bank',
  'JAPAULGOLD': 'japaul-gold',
  'JBERGER': 'julius-berger',
  'JOHNHOLT': 'john-holt',
  'LASACO': 'lasaco',
  'LAWUNION': 'law-union',
  'LEARNAFRICA': 'learn-africa',
  'LINKASSURE': 'linkage-assurance',
  'LIVESTOCK': 'livestock-feeds',
  'MANSARD': 'mansard',
  'MAYBAKER': 'may-baker',
  'MEYER': 'meyer',
  'MORISON': 'morison',
  'MRS': 'mrs',
  'MTNN': 'mtn-nigeria',
  'MULTIVERSE': 'multiverse',
  'NAHCO': 'nahco',
  'NASCON': 'nascon',
  'NB': 'nigerian-breweries',
  'NEIMETH': 'neimeth',
  'NEM': 'nem',
  'NESTLE': 'nestle',
  'NGXGROUP': 'ngx',
  'NNFM': 'nnfm',
  'NPFMCRFBK': 'npf-mfb',
  'OANDO': 'oando',
  'OKOMUOIL': 'okomu',
  'PHARMDEKO': 'pharmdeko',
  'PRESCO': 'presco',
  'PRESTIGE': 'prestige',
  'PZ': 'pz-cussons',
  'REDSTAREX': 'red-star',
  'RTBRISCOE': 'rt-briscoe',
  'SCOA': 'scoa',
  'SEPLAT': 'seplat',
  'SOVRENINS': 'sovereign',
  'STANBIC': 'stanbic',
  'STERLINGNG': 'sterling-bank',
  'SUNUASSUR': 'sunu',
  'TANTALIZER': 'tantalizers',
  'THOMWY': 'thomas-wyatt',
  'TOTAL': 'totalenergies',
  'TRANSCORP': 'transcorp',
  'TRANSCPOWER': 'transcorp-power',
  'UACN': 'uacn',
  'UBA': 'uba',
  'UCAP': 'ucap',
  'UNILEVER': 'unilever',
  'UNIONBANK': 'union-bank',
  'UNITYBANK': 'unity-bank',
  'UPL': 'upl',
  'VERITASKAP': 'veritas-kapital',
  'VITAFOAM': 'vitafoam',
  'WAPCO': 'lafarge-africa',
  'WAPIC': 'wapic',
  'WEMABANK': 'wema-bank',
  'ZENITHBANK': 'zenith-bank',
  'AFRIPRUD': 'afriprud',
  'CHIPLC': 'chi',
  'AFPRINT': 'afprint',
  'ABCTRANS': 'abc-transport',
  'ABBEYBDS': 'abbey',
  'ACADEMY': 'academy-press',
  'AUSTINLAZ': 'austin-laz',
  'CAPHOTEL': 'capital-hotel',
  'CEMENT': 'ccnn',
  'DEAPCAP': 'deap-capital',
  'ENAMELWA': 'enamelware',
  'FTNCOCOA': 'ftn-cocoa',
  'GOLDBREWRY': 'golden-guinea',
  'GREIF': 'greif',
  'INTERLINKED': 'interlinked',
  'MCNICHOLS': 'mcnichols',
  'MCNICHOL': 'mcnichols',
  'NSLTECH': 'nsl',
  'OMATEK': 'omatek',
  'PORTPAINT': 'portland-paints',
  'REGALINS': 'regency',
  'ROYALEX': 'royal-exchange',
  'SKYAVN': 'skyway',
  'STDINSURE': 'standard-alliance',
  'TOURIST': 'tourist-company',
  'TRIPPLE': 'tripple-gee',
  'UNIONDIAG': 'union-diagnostic',
  'UNIVINSURE': 'universal-insurance',
  'UPDC': 'updc',
  'UPDCREIT': 'updc-reit',
  'ETI': 'ecobank-transnational',
};

const ALL_NGX_SYMBOLS = [
  'ABBEYBDS', 'ABCTRANS', 'ACADEMY', 'ACCESSCORP', 'AFPRINT', 'AFRIPRUD', 'AIICO', 'AIRTELAFRI',
  'ARADEL', 'ARDOVA', 'AUSTINLAZ', 'BERGER', 'BETAGLAS', 'BOCGAS', 'BUACEMENT', 'BUAFOODS',
  'CADBURY', 'CAP', 'CAPHOTEL', 'CAVERTON', 'CEMENT', 'CHAMPION', 'CHAMS', 'CHIPLC', 'CONOIL',
  'CORNERST', 'COURTVILLE', 'CUSTODIAN', 'CUTIX', 'CWG', 'DANGCEM', 'DANGSUGAR', 'DEAPCAP',
  'ECOBANK', 'EKOCORP', 'ELLAHLAKES', 'ENAMELWA', 'ETERNA', 'ETRANZACT', 'FBNH', 'FCMB',
  'FIDELITYBK', 'FIDSON', 'FLOURMILL', 'FSDH', 'FTNCOCOA', 'GEREGU', 'GLAXOSMITH', 'GOLDBREWRY',
  'GREIF', 'GTCO', 'GUININS', 'GUINNESS', 'HONYFLOUR', 'IKEJAHOTEL', 'INTBREW', 'INTERLINKED',
  'JAIZBANK', 'JAPAULGOLD', 'JBERGER', 'JOHNHOLT', 'LASACO', 'LAWUNION', 'LEARNAFRICA',
  'LINKASSURE', 'LIVESTOCK', 'MANSARD', 'MAYBAKER', 'MCNICHOLS', 'MEYER', 'MORISON', 'MRS',
  'MTNN', 'MULTIVERSE', 'NAHCO', 'NASCON', 'NB', 'NEIMETH', 'NEM', 'NESTLE', 'NGXGROUP',
  'NNFM', 'NPFMCRFBK', 'NSLTECH', 'OANDO', 'OKOMUOIL', 'OMATEK', 'PHARMDEKO', 'PORTPAINT',
  'PRESCO', 'PRESTIGE', 'PZ', 'REDSTAREX', 'REGALINS', 'ROYALEX', 'RTBRISCOE', 'SCOA',
  'SEPLAT', 'SKYAVN', 'SOVRENINS', 'STANBIC', 'STDINSURE', 'STERLINGNG', 'SUNUASSUR',
  'TANTALIZER', 'THOMWY', 'TOTAL', 'TOURIST', 'TRANSCORP', 'TRANSCPOWER', 'TRIPPLE', 'UACN',
  'UBA', 'UCAP', 'UNILEVER', 'UNIONBANK', 'UNIONDIAG', 'UNITYBANK', 'UNIVINSURE', 'UPDC',
  'UPDCREIT', 'UPL', 'VERITASKAP', 'VITAFOAM', 'WAPCO', 'WAPIC', 'WEMABANK', 'ZENITHBANK', 'ETI'
];

export async function getAllNGXSymbols(): Promise<string[]> {
  return ALL_NGX_SYMBOLS;
}

function getAfricanFinancialsSlug(ngxSymbol: string): string {
  const upper = ngxSymbol.toUpperCase();
  return NGX_TO_AF_MAPPING[upper] || upper.toLowerCase();
}

function parseDocumentType(typeStr: string): FinancialDocumentData['documentType'] {
  const lower = typeStr.toLowerCase();
  if (lower.includes('annual')) return 'annual_report';
  if (lower.includes('interim')) return 'interim_report';
  if (lower.includes('abridged')) return 'abridged_report';
  if (lower.includes('presentation')) return 'presentation';
  if (lower.includes('circular')) return 'circular';
  if (lower.includes('prospectus')) return 'prospectus';
  return 'abridged_report';
}

function parsePeriod(periodStr: string): FinancialDocumentData['period'] | undefined {
  const upper = periodStr.toUpperCase();
  if (upper === 'FY' || upper.includes('FULL')) return 'FY';
  if (upper === 'HY' || upper.includes('HALF')) return 'HY';
  if (upper === 'Q1') return 'Q1';
  if (upper === 'Q2') return 'Q2';
  if (upper === 'Q3') return 'Q3';
  if (upper === 'Q4') return 'Q4';
  return undefined;
}

function parseMoneyValue(valueStr: string, unitStr?: string): number {
  let value = parseFloat(valueStr.replace(/,/g, ''));
  const unit = unitStr?.toLowerCase().trim();
  
  if (unit === 'trillion' || unit === 't' || unit === 'tn') value *= 1e12;
  else if (unit === 'billion' || unit === 'bn' || unit === 'b') value *= 1e9;
  else if (unit === 'million' || unit === 'mn' || unit === 'm') value *= 1e6;
  else if (unit === 'thousand' || unit === 'k') value *= 1e3;
  
  return value;
}

function extractMetricsFromSummary(summary: string): FinancialDocumentData['extractedMetrics'] {
  const metrics: FinancialDocumentData['extractedMetrics'] = {};
  
  const normalizedSummary = summary.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ');
  
  const revenuePatterns = [
    /(?:revenue|turnover|gross\s*(?:income|earnings))[:\s]+[₦N]?([\d,.]+)\s*(trillion|billion|million|bn|mn|tn|t|b|m)?/i,
    /[₦N]([\d,.]+)\s*(trillion|billion|million|bn|mn|tn)?\s*(?:revenue|turnover)/i,
  ];
  for (const pattern of revenuePatterns) {
    const match = normalizedSummary.match(pattern);
    if (match) {
      metrics.revenue = parseMoneyValue(match[1], match[2]);
      break;
    }
  }
  
  const revenueChangeMatch = normalizedSummary.match(/(?:revenue|turnover)[^.]*?(\d+(?:\.\d+)?)\s*%\s*(increase|decrease|growth|decline|grew|fell|drop)/i);
  if (revenueChangeMatch) {
    const change = parseFloat(revenueChangeMatch[1]);
    const direction = revenueChangeMatch[2].toLowerCase();
    metrics.revenueChange = ['increase', 'growth', 'grew'].includes(direction) ? change : -change;
  }
  
  const patPatterns = [
    /(?:profit\s*after\s*tax|PAT|net\s*(?:profit|income))[:\s]+[₦N]?([\d,.]+)\s*(trillion|billion|million|bn|mn|tn|t|b|m)?/i,
    /[₦N]([\d,.]+)\s*(trillion|billion|million|bn|mn|tn)?\s*(?:profit\s*after\s*tax|PAT|net\s*profit)/i,
  ];
  for (const pattern of patPatterns) {
    const match = normalizedSummary.match(pattern);
    if (match) {
      metrics.profitAfterTax = parseMoneyValue(match[1], match[2]);
      break;
    }
  }
  
  const patChangeMatch = normalizedSummary.match(/(?:profit\s*after\s*tax|PAT|net\s*(?:profit|income))[^.]*?(\d+(?:\.\d+)?)\s*%\s*(increase|decrease|growth|decline|grew|fell|drop)/i);
  if (patChangeMatch) {
    const change = parseFloat(patChangeMatch[1]);
    const direction = patChangeMatch[2].toLowerCase();
    metrics.profitAfterTaxChange = ['increase', 'growth', 'grew'].includes(direction) ? change : -change;
  }
  
  const epsPatterns = [
    /(?:earnings\s*per\s*share|EPS)[:\s]+[₦N]?([\d,.]+)/i,
    /EPS[:\s]+[₦N]?([\d,.]+)/i,
    /[₦N]([\d,.]+)\s*(?:earnings\s*per\s*share|EPS)/i,
  ];
  for (const pattern of epsPatterns) {
    const match = normalizedSummary.match(pattern);
    if (match) {
      metrics.earningsPerShare = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }
  
  const opProfitMatch = normalizedSummary.match(/operating\s*(?:profit|income)[:\s]+[₦N]?([\d,.]+)\s*(trillion|billion|million|bn|mn|tn|t|b|m)?/i);
  if (opProfitMatch) {
    metrics.operatingProfit = parseMoneyValue(opProfitMatch[1], opProfitMatch[2]);
  }
  
  const totalAssetsMatch = normalizedSummary.match(/total\s*assets[:\s]+[₦N]?([\d,.]+)\s*(trillion|billion|million|bn|mn|tn|t|b|m)?/i);
  if (totalAssetsMatch) {
    metrics.totalAssets = parseMoneyValue(totalAssetsMatch[1], totalAssetsMatch[2]);
  }
  
  const totalEquityPatterns = [
    /total\s*equity[:\s]+[₦N]?([\d,.]+)\s*(trillion|billion|million|bn|mn|tn|t|b|m)?/i,
    /(?:shareholder|shareholders'?)\s*(?:funds?|equity)[:\s]+[₦N]?([\d,.]+)\s*(trillion|billion|million|bn|mn|tn|t|b|m)?/i,
  ];
  for (const pattern of totalEquityPatterns) {
    const match = normalizedSummary.match(pattern);
    if (match) {
      metrics.totalEquity = parseMoneyValue(match[1], match[2]);
      break;
    }
  }
  
  const dividendPatterns = [
    /(?:final\s*)?dividend[:\s]+[₦N]?([\d,.]+)\s*(?:per\s*share)?/i,
    /dividend\s*(?:per\s*share|proposed)[:\s]+[₦N]?([\d,.]+)/i,
  ];
  for (const pattern of dividendPatterns) {
    const match = normalizedSummary.match(pattern);
    if (match) {
      metrics.dividendPerShare = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }
  
  return Object.keys(metrics).length > 0 ? metrics : undefined;
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

async function fetchPageDocuments(
  pageUrl: string,
  cleanSymbol: string,
  baseUrl: string
): Promise<{ documents: FinancialDocumentData[]; nextPageUrl: string | null }> {
  const response = await fetch(pageUrl, {
    headers: BROWSER_HEADERS,
    cache: 'no-store',
  });
  
  if (!response.ok) {
    return { documents: [], nextPageUrl: null };
  }
  
  const html = await response.text();
  
  if (html.includes('Just a moment') && html.includes('Cloudflare')) {
    console.log(`[Scraper] Cloudflare protection detected for ${pageUrl}`);
    return { documents: [], nextPageUrl: null };
  }
  
  const documents: FinancialDocumentData[] = [];
  
  const articleMatches = html.matchAll(/<article[^>]*class="[^"]*document[^"]*"[^>]*>([\s\S]*?)<\/article>/gi);
  
  for (const match of articleMatches) {
    const articleHtml = match[1];
    
    const titleMatch = articleHtml.match(/<h[23][^>]*>.*?<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
    const summaryMatch = articleHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const typeMatch = articleHtml.match(/Document type:[^<]*<a[^>]*>([^<]+)<\/a>/i);
    const dateMatch = articleHtml.match(/Published:[^<]*([A-Za-z]+\s+\d+,\s+\d+)/i);
    const yearMatch = articleHtml.match(/Year:[^<]*<a[^>]*>(\d+)<\/a>/i);
    const periodMatch = articleHtml.match(/Period:[^<]*<a[^>]*>([^<]+)<\/a>/i);
    
    if (titleMatch) {
      let docUrl = titleMatch[1];
      if (docUrl.startsWith('/')) {
        docUrl = baseUrl + docUrl;
      }
      const title = titleMatch[2].trim();
      const summary = summaryMatch ? summaryMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const docType = typeMatch ? parseDocumentType(typeMatch[1]) : 'abridged_report';
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      const period = periodMatch ? parsePeriod(periodMatch[1]) : undefined;
      const publishedDate = dateMatch ? new Date(dateMatch[1]) : new Date();
      
      documents.push({
        symbol: cleanSymbol,
        companyName: title.split(/\s+\(/)[0].trim(),
        documentType: docType,
        year,
        period,
        title,
        summary,
        documentUrl: docUrl,
        sourceUrl: pageUrl,
        publishedDate,
        extractedMetrics: extractMetricsFromSummary(summary),
      });
    }
  }
  
  const nextMatch = html.match(/<a[^>]*class="[^"]*next[^"]*"[^>]*href="([^"]+)"/i) ||
                    html.match(/<a[^>]*href="([^"]+)"[^>]*class="[^"]*next[^"]*"/i) ||
                    html.match(/class="pagination"[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>(?:Next|&raquo;|›)/i);
  
  let nextPageUrl: string | null = null;
  if (nextMatch) {
    nextPageUrl = nextMatch[1];
    if (nextPageUrl.startsWith('/')) {
      nextPageUrl = baseUrl + nextPageUrl;
    }
  }
  
  return { documents, nextPageUrl };
}

export async function fetchCompanyDocuments(symbol: string, maxPages: number = 50): Promise<FinancialDocumentData[]> {
  const cleanSymbol = symbol.replace('NSENG:', '').replace('NGX:', '').toUpperCase();
  const baseUrl = 'https://africanfinancials.com';
  
  const afSlug = getAfricanFinancialsSlug(cleanSymbol);
  const companyUrl = `${baseUrl}/company/ng-${afSlug}/`;
  
  try {
    const allDocuments: FinancialDocumentData[] = [];
    let currentUrl: string | null = companyUrl;
    let pageCount = 0;
    
    while (currentUrl && pageCount < maxPages) {
      const { documents, nextPageUrl } = await fetchPageDocuments(currentUrl, cleanSymbol, baseUrl);
      
      if (documents.length === 0) {
        break;
      }
      
      allDocuments.push(...documents);
      currentUrl = nextPageUrl;
      pageCount++;
      
      if (currentUrl) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`Fetched ${allDocuments.length} documents for ${cleanSymbol} across ${pageCount} pages`);
    return allDocuments;
  } catch (error) {
    console.error(`Error fetching documents for ${cleanSymbol}:`, error);
    return [];
  }
}

export async function fetchLatestDocuments(limit: number = 20): Promise<FinancialDocumentData[]> {
  const listUrl = 'https://africanfinancials.com/nigeria-listed-company-documents/';
  const baseUrl = 'https://africanfinancials.com';
  
  try {
    const response = await fetch(listUrl, {
      headers: BROWSER_HEADERS,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const html = await response.text();
    const documents: FinancialDocumentData[] = [];
    
    const articleBlocks = html.split(/<article[^>]*>/i).slice(1);
    
    for (let i = 0; i < Math.min(articleBlocks.length, limit); i++) {
      const block = articleBlocks[i].split(/<\/article>/i)[0];
      if (!block) continue;
      
      const companyMatch = block.match(/<a[^>]*href="https:\/\/africanfinancials\.com\/company\/ng-([^/]+)\/"[^>]*>([^<]+)<\/a>/i);
      const docMatch = block.match(/<h2[^>]*>[\s\S]*?<a[^>]*href="(https?:\/\/[^"]+|\/[^"]+)"[^>]*>([^<]+)<\/a>/i);
      const summaryMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const typeMatch = block.match(/Document type:[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
      const dateMatch = block.match(/Published:[\s\S]*?([A-Za-z]+\s+\d+,\s+\d+)/i);
      const yearMatch = block.match(/Year:[\s\S]*?<a[^>]*>(\d+)<\/a>/i);
      const periodMatch = block.match(/Period:[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
      
      if (companyMatch && docMatch && typeMatch && yearMatch) {
        const afSlugKey = companyMatch[1].toLowerCase();
        const ngxSymbol = Object.entries(NGX_TO_AF_MAPPING).find(
          ([, afSlug]) => afSlug === afSlugKey
        )?.[0] || companyMatch[1].toUpperCase();
        
        let docUrl = docMatch[1];
        if (docUrl.startsWith('/')) {
          docUrl = baseUrl + docUrl;
        }
        
        const summary = summaryMatch ? summaryMatch[1].replace(/<[^>]+>/g, '').replace(/\[\.\.\.\]/g, '').trim() : '';
        
        documents.push({
          symbol: ngxSymbol,
          companyName: companyMatch[2].replace(/\s*\([^)]+\)/, '').trim(),
          documentType: parseDocumentType(typeMatch[1]),
          year: parseInt(yearMatch[1]),
          period: periodMatch ? parsePeriod(periodMatch[1]) : undefined,
          title: docMatch[2].trim(),
          summary,
          documentUrl: docUrl,
          sourceUrl: listUrl,
          publishedDate: dateMatch ? new Date(dateMatch[1]) : new Date(),
          extractedMetrics: summary ? extractMetricsFromSummary(summary) : undefined,
        });
      }
    }
    
    return documents;
  } catch (error) {
    console.error('Error fetching latest documents:', error);
    return [];
  }
}
