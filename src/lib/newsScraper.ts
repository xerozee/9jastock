import axios from 'axios';
import * as cheerio from 'cheerio';
import { connectToDatabase, NewsArticle } from './mongodb';

interface InsertNewsArticle {
  title: string;
  summary?: string;
  content?: string;
  url: string;
  source: string;
  category?: string;
  symbol?: string | null;
  imageUrl?: string | null;
  publishedAt?: Date;
}

const NEWS_SOURCES = [
  {
    id: 'TradingView',
    name: 'TradingView',
    url: 'https://www.tradingview.com/markets/stocks-nigeria/news/',
    type: 'tradingview'
  },
  {
    id: 'Nairametrics',
    name: 'Nairametrics',
    url: 'https://nairametrics.com/category/stock-market/',
    type: 'general'
  },
  {
    id: 'BusinessDay',
    name: 'BusinessDay',
    url: 'https://businessday.ng/markets/',
    type: 'general'
  },
  {
    id: 'Punch',
    name: 'Punch',
    url: 'https://punchng.com/topics/business/',
    type: 'general'
  }
];

const NIGERIAN_STOCK_KEYWORDS = [
  'NGX', 'Nigerian Stock Exchange', 'Nigeria stock', 'Lagos stock',
  'Dangote', 'GTCO', 'Zenith Bank', 'UBA', 'Access Bank', 'MTN Nigeria',
  'Nestle Nigeria', 'Seplat', 'BUA', 'Airtel Nigeria', 'Stanbic IBTC',
  'FBN Holdings', 'Transcorp', 'Fidelity Bank', 'Sterling Bank',
  'FCMB', 'Wema Bank', 'Unity Bank', 'Jaiz Bank', 'Nigerian Breweries',
  'Flour Mills', 'Okomu Oil', 'Presco', 'Lafarge Africa', 'Cadbury Nigeria',
  'Guinness Nigeria', 'Nigerian stocks', 'All-Share Index', 'ASI',
  'market cap Nigeria', 'NGX All-Share'
];

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
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed for ${url}:`, error);
      if (i < retries - 1) {
        await delay(2000 * (i + 1));
      }
    }
  }
  return null;
}

function extractCompanySymbol(text: string): string | null {
  const symbolMap: { [key: string]: string } = {
    'dangote cement': 'DANGCEM',
    'dangote': 'DANGCEM',
    'gtco': 'GTCO',
    'guaranty trust': 'GTCO',
    'zenith bank': 'ZENITHBANK',
    'zenith': 'ZENITHBANK',
    'uba': 'UBA',
    'access bank': 'ACCESSCORP',
    'access': 'ACCESSCORP',
    'mtn nigeria': 'MTNN',
    'mtn': 'MTNN',
    'nestle nigeria': 'NESTLE',
    'nestle': 'NESTLE',
    'seplat': 'SEPLAT',
    'bua cement': 'BUACEMENT',
    'bua foods': 'BUAFOODS',
    'bua': 'BUACEMENT',
    'airtel nigeria': 'AIRTELAFRI',
    'airtel': 'AIRTELAFRI',
    'stanbic': 'STANBIC',
    'fbn holdings': 'FBNH',
    'first bank': 'FBNH',
    'transcorp': 'TRANSCORP',
    'fidelity bank': 'FIDELITYBK',
    'fidelity': 'FIDELITYBK',
    'nigerian breweries': 'NB',
    'flour mills': 'FLOURMILL',
    'okomu oil': 'OKOMUOIL',
    'presco': 'PRESCO',
    'lafarge': 'WAPCO',
    'cadbury nigeria': 'CADBURY',
    'cadbury': 'CADBURY',
    'guinness nigeria': 'GUINNESS',
    'guinness': 'GUINNESS',
    'julius berger': 'JBERGER',
    'conoil': 'CONOIL',
    'eterna': 'ETERNA',
    'total nigeria': 'TOTAL',
    'mobil': 'MOBIL',
    'unilever': 'UNILEVER',
    'custodian': 'CUSTODIAN',
    'wema bank': 'WEMABANK',
    'sterling bank': 'STERLNBANK',
    'fcmb': 'FCMB',
    'unity bank': 'UNITYBNK',
    'jaiz bank': 'JAIZBANK',
  };

  const lowerText = text.toLowerCase();
  for (const [keyword, symbol] of Object.entries(symbolMap)) {
    if (lowerText.includes(keyword)) {
      return symbol;
    }
  }
  return null;
}

function categorizeNews(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('earnings') || text.includes('profit') || text.includes('revenue') || text.includes('quarterly')) {
    return 'Earnings';
  }
  if (text.includes('dividend')) {
    return 'Dividend';
  }
  if (text.includes('ipo') || text.includes('listing') || text.includes('public offering')) {
    return 'IPO';
  }
  if (text.includes('merger') || text.includes('acquisition') || text.includes('takeover')) {
    return 'M&A';
  }
  if (text.includes('regulation') || text.includes('sec') || text.includes('cbn') || text.includes('policy')) {
    return 'Regulation';
  }
  if (text.includes('oil') || text.includes('gas') || text.includes('energy') || text.includes('petroleum')) {
    return 'Energy';
  }
  if (text.includes('bank') || text.includes('financial') || text.includes('lending')) {
    return 'Banking';
  }
  if (text.includes('all-share') || text.includes('asi') || text.includes('index') || text.includes('rally') || text.includes('decline')) {
    return 'Market Update';
  }
  
  return 'General';
}

async function scrapeTradingView(): Promise<InsertNewsArticle[]> {
  const articles: InsertNewsArticle[] = [];
  
  try {
    const html = await fetchWithRetry('https://www.tradingview.com/markets/stocks-nigeria/news/');
    if (!html) return articles;

    const $ = cheerio.load(html);
    
    $('article, .news-item, [data-name="news-item"], .tv-feed__story').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h2, h3, .title, [data-name="title"]').first().text().trim();
      const summary = $el.find('p, .summary, .description, [data-name="description"]').first().text().trim();
      const link = $el.find('a').first().attr('href');
      const timeText = $el.find('time, .date, .timestamp').first().text().trim();
      
      if (title && link) {
        const fullUrl = link.startsWith('http') ? link : `https://www.tradingview.com${link}`;
        const symbol = extractCompanySymbol(title + ' ' + summary);
        
        articles.push({
          title,
          summary: summary || title.substring(0, 200),
          url: fullUrl,
          source: 'TradingView',
          category: categorizeNews(title, summary),
          symbol,
          publishedAt: timeText ? new Date(timeText) : new Date(),
        });
      }
    });
    
    console.log(`TradingView: Found ${articles.length} articles`);
  } catch (error) {
    console.error('Error scraping TradingView:', error);
  }
  
  return articles;
}

async function scrapeNairametrics(): Promise<InsertNewsArticle[]> {
  const articles: InsertNewsArticle[] = [];
  
  try {
    const html = await fetchWithRetry('https://nairametrics.com/category/stock-market/');
    if (!html) return articles;

    const $ = cheerio.load(html);
    
    $('article, .post').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h2 a, h3 a, .entry-title a').first().text().trim();
      const link = $el.find('h2 a, h3 a, .entry-title a').first().attr('href');
      const summary = $el.find('.entry-summary, .excerpt, p').first().text().trim();
      const imageUrl = $el.find('img').first().attr('src');
      const timeText = $el.find('time, .entry-date').first().attr('datetime') || 
                       $el.find('.date, .published').first().text().trim();
      
      if (title && link && isNigerianStockRelated(title + ' ' + summary)) {
        const symbol = extractCompanySymbol(title + ' ' + summary);
        
        articles.push({
          title,
          summary: summary || title.substring(0, 200),
          url: link,
          source: 'Nairametrics',
          category: categorizeNews(title, summary),
          symbol,
          imageUrl: imageUrl || null,
          publishedAt: timeText ? new Date(timeText) : new Date(),
        });
      }
    });
    
    console.log(`Nairametrics: Found ${articles.length} relevant articles`);
  } catch (error) {
    console.error('Error scraping Nairametrics:', error);
  }
  
  return articles;
}

async function scrapeBusinessDay(): Promise<InsertNewsArticle[]> {
  const articles: InsertNewsArticle[] = [];
  
  try {
    const html = await fetchWithRetry('https://businessday.ng/markets/');
    if (!html) return articles;

    const $ = cheerio.load(html);
    
    $('article, .post, .td-module-container').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h3 a, h2 a, .entry-title a').first().text().trim();
      const link = $el.find('h3 a, h2 a, .entry-title a').first().attr('href');
      const summary = $el.find('.td-excerpt, .excerpt, p').first().text().trim();
      const imageUrl = $el.find('img').first().attr('src');
      const timeText = $el.find('time, .td-post-date').first().text().trim();
      
      if (title && link && isNigerianStockRelated(title + ' ' + summary)) {
        const symbol = extractCompanySymbol(title + ' ' + summary);
        
        articles.push({
          title,
          summary: summary || title.substring(0, 200),
          url: link,
          source: 'BusinessDay',
          category: categorizeNews(title, summary),
          symbol,
          imageUrl: imageUrl || null,
          publishedAt: timeText ? new Date(timeText) : new Date(),
        });
      }
    });
    
    console.log(`BusinessDay: Found ${articles.length} relevant articles`);
  } catch (error) {
    console.error('Error scraping BusinessDay:', error);
  }
  
  return articles;
}

async function scrapePunchNG(): Promise<InsertNewsArticle[]> {
  const articles: InsertNewsArticle[] = [];
  
  try {
    const html = await fetchWithRetry('https://punchng.com/topics/business/');
    if (!html) return articles;

    const $ = cheerio.load(html);
    
    $('article, .post').each((_, element) => {
      const $el = $(element);
      const title = $el.find('h2 a, h3 a, .entry-title a').first().text().trim();
      const link = $el.find('h2 a, h3 a, .entry-title a').first().attr('href');
      const summary = $el.find('.entry-summary, .excerpt, p').first().text().trim();
      const imageUrl = $el.find('img').first().attr('src');
      const timeText = $el.find('time, .date').first().text().trim();
      
      if (title && link && isNigerianStockRelated(title + ' ' + summary)) {
        const symbol = extractCompanySymbol(title + ' ' + summary);
        
        articles.push({
          title,
          summary: summary || title.substring(0, 200),
          url: link,
          source: 'Punch',
          category: categorizeNews(title, summary),
          symbol,
          imageUrl: imageUrl || null,
          publishedAt: timeText ? new Date(timeText) : new Date(),
        });
      }
    });
    
    console.log(`Punch NG: Found ${articles.length} relevant articles`);
  } catch (error) {
    console.error('Error scraping Punch NG:', error);
  }
  
  return articles;
}

function isNigerianStockRelated(text: string): boolean {
  const lowerText = text.toLowerCase();
  return NIGERIAN_STOCK_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

async function saveArticles(articles: InsertNewsArticle[]): Promise<number> {
  await connectToDatabase();
  let savedCount = 0;
  
  for (const article of articles) {
    try {
      const existing = await NewsArticle.findOne({ url: article.url });
      
      if (!existing) {
        await NewsArticle.create(article);
        savedCount++;
      }
    } catch (error) {
      console.error(`Error saving article: ${article.title}`, error);
    }
  }
  
  return savedCount;
}

export async function runNewsScraper(): Promise<{
  total: number;
  saved: number;
  sources: { [key: string]: number };
}> {
  console.log('Starting news scraper...');
  const startTime = Date.now();
  
  const results = await Promise.allSettled([
    scrapeTradingView(),
    scrapeNairametrics(),
    scrapeBusinessDay(),
    scrapePunchNG(),
  ]);
  
  const allArticles: InsertNewsArticle[] = [];
  const sourceCounts: { [key: string]: number } = {};
  
  results.forEach((result, index) => {
    const sourceName = ['TradingView', 'Nairametrics', 'BusinessDay', 'Punch'][index];
    if (result.status === 'fulfilled') {
      sourceCounts[sourceName] = result.value.length;
      allArticles.push(...result.value);
    } else {
      console.error(`Failed to scrape ${sourceName}:`, result.reason);
      sourceCounts[sourceName] = 0;
    }
  });
  
  const savedCount = await saveArticles(allArticles);
  
  const duration = (Date.now() - startTime) / 1000;
  console.log(`Scraper completed in ${duration.toFixed(2)}s. Found ${allArticles.length} articles, saved ${savedCount} new.`);
  
  return {
    total: allArticles.length,
    saved: savedCount,
    sources: sourceCounts,
  };
}

export async function getLatestNews(limit = 50): Promise<InsertNewsArticle[]> {
  await connectToDatabase();
  const articles = await NewsArticle.find()
    .sort({ scrapedAt: -1 })
    .limit(limit)
    .lean();
  
  return articles as InsertNewsArticle[];
}
