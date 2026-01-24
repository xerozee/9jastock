import { NextResponse } from 'next/server';
import { 
  scrapeNigerianCompanies, 
  scrapeDividends, 
  scrapeSharePrices,
  scrapeCompanyDocuments,
  AFCompany,
} from '@/lib/africanFinancialsBrowser';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface ScrapeStatus {
  isRunning: boolean;
  startedAt: string | null;
  progress: {
    companies: number;
    dividends: number;
    documents: number;
    currentStock: string;
    processedStocks: number;
    totalStocks: number;
  };
  lastCompleted: string | null;
  error: string | null;
}

let scrapeStatus: ScrapeStatus = {
  isRunning: false,
  startedAt: null,
  progress: {
    companies: 0,
    dividends: 0,
    documents: 0,
    currentStock: '',
    processedStocks: 0,
    totalStocks: 0,
  },
  lastCompleted: null,
  error: null,
};

export async function GET() {
  return NextResponse.json({
    success: true,
    status: scrapeStatus,
  });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  
  if (scrapeStatus.isRunning) {
    return NextResponse.json({
      success: false,
      message: 'Scrape already in progress',
      status: scrapeStatus,
    }, { status: 409 });
  }
  
  scrapeStatus = {
    isRunning: true,
    startedAt: new Date().toISOString(),
    progress: {
      companies: 0,
      dividends: 0,
      documents: 0,
      currentStock: '',
      processedStocks: 0,
      totalStocks: 0,
    },
    lastCompleted: null,
    error: null,
  };
  
  runScrapeInBackground(type);
  
  return NextResponse.json({
    success: true,
    message: `Started ${type} scrape`,
    status: scrapeStatus,
  });
}

const AFCompanySchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: String,
  sector: String,
  url: String,
  updatedAt: { type: Date, default: Date.now },
});

const AFDividendSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  companyName: String,
  fiscalYear: String,
  dividendType: String,
  amount: Number,
  currency: String,
  exDate: String,
  paymentDate: String,
  declarationDate: String,
  updatedAt: { type: Date, default: Date.now },
});

const AFDocumentSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  companyName: String,
  title: String,
  type: String,
  year: Number,
  url: String,
  publishedDate: String,
  metrics: {
    revenue: String,
    profit: String,
    eps: String,
  },
  updatedAt: { type: Date, default: Date.now },
});

async function runScrapeInBackground(type: string) {
  try {
    await connectToDatabase();
    
    if (type === 'companies' || type === 'all') {
      console.log('[Scrape] Fetching companies...');
      const companies = await scrapeNigerianCompanies();
      scrapeStatus.progress.companies = companies.length;
      scrapeStatus.progress.totalStocks = companies.length;
      
      if (companies.length > 0) {
        const AFCompanyModel = mongoose.models.AFCompany || mongoose.model('AFCompany', AFCompanySchema);
        
        for (const company of companies) {
          await AFCompanyModel.findOneAndUpdate(
            { symbol: company.symbol },
            { ...company, updatedAt: new Date() },
            { upsert: true }
          );
        }
      }
    }
    
    if (type === 'dividends' || type === 'all') {
      console.log('[Scrape] Fetching dividends...');
      const dividends = await scrapeDividends();
      scrapeStatus.progress.dividends = dividends.length;
      
      if (dividends.length > 0) {
        const AFDividendModel = mongoose.models.AFDividend || mongoose.model('AFDividend', AFDividendSchema);
        
        for (const dividend of dividends) {
          await AFDividendModel.findOneAndUpdate(
            { symbol: dividend.symbol, fiscalYear: dividend.fiscalYear, dividendType: dividend.dividendType },
            { ...dividend, updatedAt: new Date() },
            { upsert: true }
          );
        }
      }
    }
    
    if (type === 'documents' || type === 'all') {
      console.log('[Scrape] Fetching documents for all companies...');
      
      const AFCompanyModel = mongoose.models.AFCompany || mongoose.model('AFCompany', AFCompanySchema);
      const companies = await AFCompanyModel.find({}).lean();
      
      const AFDocumentModel = mongoose.models.AFDocument || mongoose.model('AFDocument', AFDocumentSchema);
      
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i] as AFCompany;
        scrapeStatus.progress.currentStock = company.symbol;
        scrapeStatus.progress.processedStocks = i + 1;
        
        try {
          const docs = await scrapeCompanyDocuments(company.url, company.symbol);
          
          for (const doc of docs) {
            doc.companyName = company.name;
            await AFDocumentModel.findOneAndUpdate(
              { url: doc.url },
              { ...doc, updatedAt: new Date() },
              { upsert: true }
            );
          }
          
          scrapeStatus.progress.documents += docs.length;
        } catch (error) {
          console.error(`[Scrape] Error processing ${company.symbol}:`, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    scrapeStatus.isRunning = false;
    scrapeStatus.lastCompleted = new Date().toISOString();
    console.log('[Scrape] Complete!', scrapeStatus.progress);
    
  } catch (error) {
    console.error('[Scrape] Error:', error);
    scrapeStatus.isRunning = false;
    scrapeStatus.error = error instanceof Error ? error.message : 'Unknown error';
  }
}
