import puppeteer from 'puppeteer';
import type { Browser, Page } from 'puppeteer';

const BROWSER_CONFIG = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920,1080',
    '--disable-blink-features=AutomationControlled',
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
};

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteer.launch(BROWSER_CONFIG);
  }
  return browserInstance;
}

async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

async function createPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters: PermissionDescriptor) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: 'denied' } as PermissionStatus)
        : originalQuery(parameters);
  });
  
  await page.setUserAgent(USER_AGENT);
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  });
  
  return page;
}

async function waitForCloudflare(page: Page): Promise<boolean> {
  try {
    const maxWait = 45000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      const title = await page.title();
      const content = await page.content();
      
      if (!title.includes('Just a moment') && !content.includes('Cloudflare')) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    return false;
  } catch {
    console.log('[Browser] Error waiting for Cloudflare');
    return false;
  }
}

export interface AFCompany {
  symbol: string;
  name: string;
  sector?: string;
  url: string;
}

export interface AFDividend {
  symbol: string;
  companyName: string;
  fiscalYear: string;
  dividendType: string;
  amount: number;
  currency: string;
  exDate?: string;
  paymentDate?: string;
  declarationDate?: string;
}

export interface AFSharePrice {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  date: string;
}

export interface AFDocument {
  symbol: string;
  companyName: string;
  title: string;
  type: string;
  year: number;
  url: string;
  publishedDate?: string;
  metrics?: {
    revenue?: string;
    profit?: string;
    eps?: string;
  };
}

export async function scrapeNigerianCompanies(): Promise<AFCompany[]> {
  console.log('[Browser] Scraping Nigerian companies list...');
  const browser = await getBrowser();
  const page = await createPage(browser);
  
  try {
    await page.goto('https://africanfinancials.com/african-listed-companies/?wpv-tax-country=ng', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    
    const passed = await waitForCloudflare(page);
    if (!passed) {
      console.log('[Browser] Cloudflare challenge not passed for companies page');
      return [];
    }
    
    const companies = await page.evaluate(() => {
      const results: { symbol: string; name: string; sector?: string; url: string }[] = [];
      
      const rows = document.querySelectorAll('table tbody tr, .company-list-item, article.company');
      rows.forEach(row => {
        const linkEl = row.querySelector('a[href*="/company/"]');
        const symbolEl = row.querySelector('.symbol, .ticker, td:first-child');
        const nameEl = row.querySelector('.company-name, .name, td:nth-child(2)');
        const sectorEl = row.querySelector('.sector, td:nth-child(3)');
        
        if (linkEl) {
          const url = (linkEl as HTMLAnchorElement).href;
          const symbol = symbolEl?.textContent?.trim() || '';
          const name = nameEl?.textContent?.trim() || linkEl.textContent?.trim() || '';
          const sector = sectorEl?.textContent?.trim();
          
          if (symbol || name) {
            results.push({ symbol, name, sector, url });
          }
        }
      });
      
      const links = document.querySelectorAll('a[href*="/company/ng-"]');
      links.forEach(link => {
        const url = (link as HTMLAnchorElement).href;
        const text = link.textContent?.trim() || '';
        const match = url.match(/\/company\/ng-([^/]+)/);
        if (match && !results.some(r => r.url === url)) {
          results.push({
            symbol: match[1].toUpperCase().replace(/-/g, ''),
            name: text,
            url,
          });
        }
      });
      
      return results;
    });
    
    console.log(`[Browser] Found ${companies.length} Nigerian companies`);
    return companies;
  } catch (error) {
    console.error('[Browser] Error scraping companies:', error);
    return [];
  } finally {
    await page.close();
  }
}

export async function scrapeDividends(): Promise<AFDividend[]> {
  console.log('[Browser] Scraping dividends data...');
  const browser = await getBrowser();
  const page = await createPage(browser);
  
  try {
    await page.goto('https://africanfinancials.com/dividends/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    
    const passed = await waitForCloudflare(page);
    if (!passed) {
      console.log('[Browser] Cloudflare challenge not passed for dividends page');
      return [];
    }
    
    try {
      await page.click('a[href*="ng"], button:has-text("Nigeria"), .tab-nigeria');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch {
      console.log('[Browser] No Nigeria tab found, continuing...');
    }
    
    const dividends = await page.evaluate(() => {
      const results: AFDividend[] = [];
      
      const rows = document.querySelectorAll('table tbody tr, .dividend-item');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          const companyName = cells[0]?.textContent?.trim() || '';
          const symbol = cells[1]?.textContent?.trim() || companyName.split(' ')[0];
          const amountText = cells[2]?.textContent?.trim() || '0';
          const dateText = cells[3]?.textContent?.trim() || '';
          
          const amountMatch = amountText.match(/[\d.]+/);
          const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
          const currency = amountText.includes('₦') || amountText.includes('NGN') ? 'NGN' : 'NGN';
          
          if (companyName && amount > 0) {
            results.push({
              symbol,
              companyName,
              fiscalYear: new Date().getFullYear().toString(),
              dividendType: 'Final',
              amount,
              currency,
              paymentDate: dateText,
            });
          }
        }
      });
      
      return results;
    });
    
    console.log(`[Browser] Found ${dividends.length} dividend records`);
    return dividends;
  } catch (error) {
    console.error('[Browser] Error scraping dividends:', error);
    return [];
  } finally {
    await page.close();
  }
}

export async function scrapeSharePrices(): Promise<AFSharePrice[]> {
  console.log('[Browser] Scraping share prices...');
  const browser = await getBrowser();
  const page = await createPage(browser);
  
  try {
    await page.goto('https://africanfinancials.com/nigerian-stock-exchange-share-prices/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    
    const passed = await waitForCloudflare(page);
    if (!passed) {
      console.log('[Browser] Cloudflare challenge not passed for share prices page');
      return [];
    }
    
    const prices = await page.evaluate(() => {
      const results: AFSharePrice[] = [];
      const today = new Date().toISOString().split('T')[0];
      
      const rows = document.querySelectorAll('table tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
          const symbol = cells[0]?.textContent?.trim() || '';
          const companyName = cells[1]?.textContent?.trim() || '';
          const priceText = cells[2]?.textContent?.trim() || '0';
          const changeText = cells[3]?.textContent?.trim() || '0';
          const volumeText = cells[4]?.textContent?.trim() || '0';
          
          const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
          const change = parseFloat(changeText.replace(/[^0-9.-]/g, '')) || 0;
          const changePercent = price > 0 ? (change / price) * 100 : 0;
          const volume = parseInt(volumeText.replace(/[^0-9]/g, '')) || 0;
          
          if (symbol && price > 0) {
            results.push({
              symbol,
              companyName,
              price,
              change,
              changePercent,
              volume,
              date: today,
            });
          }
        }
      });
      
      return results;
    });
    
    console.log(`[Browser] Found ${prices.length} share prices`);
    return prices;
  } catch (error) {
    console.error('[Browser] Error scraping share prices:', error);
    return [];
  } finally {
    await page.close();
  }
}

export async function scrapeCompanyDocuments(companyUrl: string, symbol: string): Promise<AFDocument[]> {
  console.log(`[Browser] Scraping documents for ${symbol}...`);
  const browser = await getBrowser();
  const page = await createPage(browser);
  
  try {
    await page.goto(companyUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    
    const passed = await waitForCloudflare(page);
    if (!passed) {
      console.log(`[Browser] Cloudflare challenge not passed for ${symbol}`);
      return [];
    }
    
    const documents = await page.evaluate((sym: string) => {
      const results: AFDocument[] = [];
      
      const docElements = document.querySelectorAll('article.document, .document-item, a[href*="/document/"]');
      docElements.forEach(doc => {
        const linkEl = doc.querySelector('a[href*="/document/"]') || doc as HTMLAnchorElement;
        const titleEl = doc.querySelector('.document-title, h3, h4, .title') || linkEl;
        const dateEl = doc.querySelector('.date, time, .published-date');
        const summaryEl = doc.querySelector('.summary, .excerpt, p');
        
        const url = (linkEl as HTMLAnchorElement).href || '';
        const title = titleEl?.textContent?.trim() || '';
        const dateText = dateEl?.textContent?.trim() || '';
        const summary = summaryEl?.textContent?.trim() || '';
        
        let type = 'Other';
        const titleLower = title.toLowerCase();
        if (titleLower.includes('annual')) type = 'Annual Report';
        else if (titleLower.includes('interim') || titleLower.includes('half')) type = 'Interim Report';
        else if (titleLower.includes('quarterly') || titleLower.includes('q1') || titleLower.includes('q2') || titleLower.includes('q3')) type = 'Quarterly Report';
        else if (titleLower.includes('presentation')) type = 'Presentation';
        
        const yearMatch = title.match(/20\d{2}/) || dateText.match(/20\d{2}/);
        const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
        
        const metrics: { revenue?: string; profit?: string; eps?: string } = {};
        const revenueMatch = summary.match(/revenue[:\s]+([₦N]?[\d,.]+\s*(?:bn|mn|billion|million)?)/i);
        const profitMatch = summary.match(/(?:profit|PAT)[:\s]+([₦N]?[\d,.]+\s*(?:bn|mn|billion|million)?)/i);
        const epsMatch = summary.match(/EPS[:\s]+([₦N]?[\d,.]+)/i);
        
        if (revenueMatch) metrics.revenue = revenueMatch[1];
        if (profitMatch) metrics.profit = profitMatch[1];
        if (epsMatch) metrics.eps = epsMatch[1];
        
        if (url && title) {
          results.push({
            symbol: sym,
            companyName: '',
            title,
            type,
            year,
            url,
            publishedDate: dateText,
            metrics: Object.keys(metrics).length > 0 ? metrics : undefined,
          });
        }
      });
      
      return results;
    }, symbol);
    
    console.log(`[Browser] Found ${documents.length} documents for ${symbol}`);
    return documents;
  } catch (error) {
    console.error(`[Browser] Error scraping documents for ${symbol}:`, error);
    return [];
  } finally {
    await page.close();
  }
}

export async function scrapeAllNigerianData(): Promise<{
  companies: AFCompany[];
  dividends: AFDividend[];
  sharePrices: AFSharePrice[];
  documents: AFDocument[];
}> {
  console.log('[Browser] Starting full Nigerian data scrape...');
  
  try {
    const companies = await scrapeNigerianCompanies();
    const dividends = await scrapeDividends();
    const sharePrices = await scrapeSharePrices();
    
    const allDocuments: AFDocument[] = [];
    
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      console.log(`[Browser] Processing ${i + 1}/${companies.length}: ${company.symbol}`);
      
      const docs = await scrapeCompanyDocuments(company.url, company.symbol);
      docs.forEach(doc => {
        doc.companyName = company.name;
      });
      allDocuments.push(...docs);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`[Browser] Scrape complete: ${companies.length} companies, ${dividends.length} dividends, ${sharePrices.length} prices, ${allDocuments.length} documents`);
    
    return {
      companies,
      dividends,
      sharePrices,
      documents: allDocuments,
    };
  } finally {
    await closeBrowser();
  }
}

export async function testBrowserAccess(): Promise<{ success: boolean; message: string; pageTitle?: string }> {
  console.log('[Browser] Testing Cloudflare bypass...');
  const browser = await getBrowser();
  const page = await createPage(browser);
  
  try {
    await page.goto('https://africanfinancials.com/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    
    const passed = await waitForCloudflare(page);
    const title = await page.title();
    
    console.log(`[Browser] Page title: ${title}`);
    console.log(`[Browser] Access ${passed ? 'SUCCESS' : 'BLOCKED'}`);
    
    return {
      success: passed,
      message: passed 
        ? 'Successfully bypassed Cloudflare protection' 
        : 'Cloudflare challenge not passed - browser may be detected as bot',
      pageTitle: title,
    };
  } catch (error) {
    console.error('[Browser] Test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    await page.close();
    await closeBrowser();
  }
}
