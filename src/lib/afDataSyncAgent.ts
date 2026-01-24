import { connectToDatabase, AFCompanyData2 } from './mongodb';
import { scrapeCompanyData } from './africanFinancialsBrowser';
import { nigerianStocks } from './stockData';
import mongoose from 'mongoose';

const SYMBOL_MAPPING: { [key: string]: string } = {
  'ACCESSCORP': 'ACCESS',
  'GTCO': 'GUARANTY',
  'FBNH': 'FIRSTBANK',
  'STANBIC': 'STANBICIBTC',
  'FIDELITYBK': 'FIDELITY',
  'FCMB': 'FCMB',
  'WEMABANK': 'WEMA',
  'STERLINGNG': 'STERLING',
  'JAIZBANK': 'JAIZ',
  'UPDCREIT': 'UPDC',
  'BUACEMENT': 'BUACEMENT',
  'DANGCEM': 'DANGCEM',
  'WAPCO': 'WAPCO',
  'TRANSCOHOT': 'TRANSCORP',
  'OANDO': 'OANDO',
  'SEPLAT': 'SEPLAT',
  'TOTAL': 'TOTALENERGIES',
  'CONOIL': 'CONOIL',
  'MTNN': 'MTNN',
  'AIRTELAFRI': 'AIRTEL',
  'DANGSUGAR': 'DANGSUGAR',
  'FLOURMILL': 'FMN',
  'NASCON': 'NASCON',
  'NESTLE': 'NESTLE',
  'NB': 'NB',
  'GUINNESS': 'GUINNESS',
  'INTBREW': 'INTBREW',
  'VITAFOAM': 'VITAFOAM',
  'PRESCO': 'PRESCO',
  'OKOMUOIL': 'OKOMUOIL',
  'MAYBAKER': 'MAYBAKER',
  'NEIMETH': 'NEIMETH',
  'GLAXOSMITH': 'GSK',
  'FIDSON': 'FIDSON',
  'PHARMDEKO': 'PHARMDEKO',
  'JULIUS': 'JULIUSBERGER',
  'JBERGER': 'JULIUSBERGER',
  'CADBURY': 'CADBURY',
  'UNILEVER': 'UNILEVER',
  'PZ': 'PZ',
  'BETAGLAS': 'BETAGLAS',
  'CUTIX': 'CUTIX',
  'CUSTODIAN': 'CUSTODIAN',
  'CHIPLC': 'CHI',
  'HONYFLOUR': 'HONEYWELL',
  'COURTVILLE': 'COURTVILLE',
  'ABCTRANS': 'ABCTRANSPORT',
};

function normalizeSymbol(symbol: string): string {
  const cleanSymbol = symbol.replace('NGX:', '').toUpperCase();
  if (SYMBOL_MAPPING[cleanSymbol]) {
    return SYMBOL_MAPPING[cleanSymbol];
  }
  let normalized = cleanSymbol
    .replace(/CORP$/, '')
    .replace(/BANK$/, '')
    .replace(/BK$/, '')
    .replace(/NG$/, '')
    .replace(/PLC$/, '');
  return normalized || cleanSymbol;
}

const afSyncStatusSchema = new mongoose.Schema({
  syncId: { type: String, default: 'af-main', unique: true },
  status: { 
    type: String, 
    enum: ['idle', 'running', 'completed', 'error', 'paused'],
    default: 'idle'
  },
  totalStocks: { type: Number, default: 0 },
  processedStocks: { type: Number, default: 0 },
  successfulStocks: { type: Number, default: 0 },
  failedStocks: { type: Number, default: 0 },
  notFoundStocks: { type: Number, default: 0 },
  currentSymbol: { type: String, default: '' },
  currentBatch: { type: Number, default: 0 },
  totalBatches: { type: Number, default: 0 },
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastUpdated: { type: Date, default: Date.now },
  lastRunDuration: { type: Number },
  syncErrors: [{ 
    symbol: String, 
    error: String, 
    timestamp: Date 
  }],
  stocksProcessed: [{
    symbol: String,
    afSymbol: String,
    found: Boolean,
    documentsCount: Number,
    dividendsCount: Number,
    syncedAt: Date
  }],
  nextScheduledRun: { type: Date },
}, { timestamps: true });

export const AFSyncStatus = mongoose.models.AFSyncStatus || mongoose.model('AFSyncStatus', afSyncStatusSchema);

export interface SyncProgress {
  status: string;
  totalStocks: number;
  processedStocks: number;
  successfulStocks: number;
  failedStocks: number;
  notFoundStocks: number;
  currentSymbol: string;
  currentBatch: number;
  totalBatches: number;
  percentComplete: number;
  startedAt?: Date;
  completedAt?: Date;
  lastUpdated: Date;
  lastRunDuration?: number;
  nextScheduledRun?: Date;
  recentErrors: Array<{ symbol: string; error: string; timestamp: Date }>;
}

export async function getSyncStatus(): Promise<SyncProgress> {
  await connectToDatabase();
  
  let status = await AFSyncStatus.findOne({ syncId: 'af-main' });
  
  if (!status) {
    status = await AFSyncStatus.create({ syncId: 'af-main' });
  }
  
  return {
    status: status.status,
    totalStocks: status.totalStocks,
    processedStocks: status.processedStocks,
    successfulStocks: status.successfulStocks,
    failedStocks: status.failedStocks,
    notFoundStocks: status.notFoundStocks,
    currentSymbol: status.currentSymbol,
    currentBatch: status.currentBatch,
    totalBatches: status.totalBatches,
    percentComplete: status.totalStocks > 0 
      ? Math.round((status.processedStocks / status.totalStocks) * 100) 
      : 0,
    startedAt: status.startedAt,
    completedAt: status.completedAt,
    lastUpdated: status.lastUpdated,
    lastRunDuration: status.lastRunDuration,
    nextScheduledRun: status.nextScheduledRun,
    recentErrors: (status.syncErrors || []).slice(-10),
  };
}

export async function syncSingleStock(symbol: string): Promise<{
  success: boolean;
  found: boolean;
  documentsCount: number;
  dividendsCount: number;
  error?: string;
}> {
  const afSymbol = normalizeSymbol(symbol);
  
  try {
    const result = await scrapeCompanyData(afSymbol);
    
    if (!result) {
      return { success: true, found: false, documentsCount: 0, dividendsCount: 0 };
    }
    
    await connectToDatabase();
    
    await AFCompanyData2.findOneAndUpdate(
      { symbol: afSymbol },
      {
        symbol: afSymbol,
        originalSymbol: symbol,
        url: result.url,
        profile: result.profile || {},
        dividends: result.dividends || [],
        documents: result.documents || [],
        found: result.found !== false,
        scrapedAt: new Date(),
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
    
    return {
      success: true,
      found: result.found !== false,
      documentsCount: result.documents?.length || 0,
      dividendsCount: result.dividends?.length || 0,
    };
  } catch (error: any) {
    console.error(`Error syncing ${symbol} (${afSymbol}):`, error.message);
    return {
      success: false,
      found: false,
      documentsCount: 0,
      dividendsCount: 0,
      error: error.message,
    };
  }
}

export async function runBatchSync(
  batchSize: number = 10,
  startIndex: number = 0,
  onProgress?: (progress: SyncProgress) => void
): Promise<{ completed: boolean; nextStartIndex: number }> {
  await connectToDatabase();
  
  const allSymbols = nigerianStocks.map(s => s.symbol);
  const totalStocks = allSymbols.length;
  const totalBatches = Math.ceil(totalStocks / batchSize);
  const currentBatch = Math.floor(startIndex / batchSize) + 1;
  
  const endIndex = Math.min(startIndex + batchSize, totalStocks);
  const batchSymbols = allSymbols.slice(startIndex, endIndex);
  
  let status = await AFSyncStatus.findOne({ syncId: 'af-main' });
  if (!status) {
    status = await AFSyncStatus.create({ syncId: 'af-main' });
  }
  
  if (startIndex === 0) {
    await AFSyncStatus.updateOne(
      { syncId: 'af-main' },
      {
        status: 'running',
        totalStocks,
        processedStocks: 0,
        successfulStocks: 0,
        failedStocks: 0,
        notFoundStocks: 0,
        currentBatch: 1,
        totalBatches,
        startedAt: new Date(),
        completedAt: null,
        syncErrors: [],
        stocksProcessed: [],
        lastUpdated: new Date(),
      }
    );
  } else {
    await AFSyncStatus.updateOne(
      { syncId: 'af-main' },
      {
        status: 'running',
        currentBatch,
        lastUpdated: new Date(),
      }
    );
  }
  
  console.log(`Starting batch ${currentBatch}/${totalBatches}: Processing ${batchSymbols.length} stocks (${startIndex}-${endIndex - 1})`);
  
  for (let i = 0; i < batchSymbols.length; i++) {
    const symbol = batchSymbols[i];
    const afSymbol = normalizeSymbol(symbol);
    
    await AFSyncStatus.updateOne(
      { syncId: 'af-main' },
      { 
        currentSymbol: symbol,
        lastUpdated: new Date(),
      }
    );
    
    console.log(`[${startIndex + i + 1}/${totalStocks}] Syncing ${symbol} -> ${afSymbol}...`);
    
    const result = await syncSingleStock(symbol);
    
    const updateOps: any = {
      $inc: { processedStocks: 1 },
      $set: { lastUpdated: new Date() },
      $push: {
        stocksProcessed: {
          symbol,
          afSymbol,
          found: result.found,
          documentsCount: result.documentsCount,
          dividendsCount: result.dividendsCount,
          syncedAt: new Date(),
        }
      }
    };
    
    if (result.success && result.found) {
      updateOps.$inc.successfulStocks = 1;
      console.log(`  ✓ Found: ${result.documentsCount} docs, ${result.dividendsCount} dividends`);
    } else if (result.success && !result.found) {
      updateOps.$inc.notFoundStocks = 1;
      console.log(`  - Not found on African Financials`);
    } else {
      updateOps.$inc.failedStocks = 1;
      updateOps.$push.syncErrors = {
        symbol,
        error: result.error || 'Unknown error',
        timestamp: new Date(),
      };
      console.log(`  ✗ Error: ${result.error}`);
    }
    
    await AFSyncStatus.updateOne({ syncId: 'af-main' }, updateOps);
    
    if (onProgress) {
      const currentStatus = await getSyncStatus();
      onProgress(currentStatus);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  }
  
  const isComplete = endIndex >= totalStocks;
  
  if (isComplete) {
    const startTime = status.startedAt || new Date();
    const duration = Date.now() - startTime.getTime();
    
    await AFSyncStatus.updateOne(
      { syncId: 'af-main' },
      {
        status: 'completed',
        currentSymbol: '',
        completedAt: new Date(),
        lastRunDuration: duration,
        nextScheduledRun: new Date(Date.now() + 3 * 60 * 60 * 1000),
        lastUpdated: new Date(),
      }
    );
    
    console.log(`Sync completed! Duration: ${Math.round(duration / 1000 / 60)} minutes`);
  } else {
    await AFSyncStatus.updateOne(
      { syncId: 'af-main' },
      {
        status: 'paused',
        currentSymbol: '',
        lastUpdated: new Date(),
      }
    );
  }
  
  return {
    completed: isComplete,
    nextStartIndex: isComplete ? 0 : endIndex,
  };
}

export async function runFullSync(onProgress?: (progress: SyncProgress) => void): Promise<void> {
  let startIndex = 0;
  let completed = false;
  
  while (!completed) {
    const result = await runBatchSync(10, startIndex, onProgress);
    completed = result.completed;
    startIndex = result.nextStartIndex;
    
    if (!completed) {
      console.log('Batch complete, waiting 10 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

export async function getStockSyncData(symbol: string): Promise<{
  found: boolean;
  lastSynced?: Date;
  documentsCount: number;
  dividendsCount: number;
  profile?: any;
  dividends?: any[];
  documents?: any[];
} | null> {
  await connectToDatabase();
  
  const afSymbol = normalizeSymbol(symbol);
  const data = await AFCompanyData2.findOne({ symbol: afSymbol });
  
  if (!data) {
    return null;
  }
  
  return {
    found: data.found,
    lastSynced: data.scrapedAt,
    documentsCount: data.documents?.length || 0,
    dividendsCount: data.dividends?.length || 0,
    profile: data.profile,
    dividends: data.dividends,
    documents: data.documents,
  };
}

export async function getAllSyncedStocks(): Promise<Array<{
  symbol: string;
  originalSymbol: string;
  found: boolean;
  documentsCount: number;
  dividendsCount: number;
  lastSynced: Date;
}>> {
  await connectToDatabase();
  
  const stocks = await AFCompanyData2.find({}).select('symbol originalSymbol found documents dividends scrapedAt').lean();
  
  return stocks.map((stock: any) => ({
    symbol: stock.symbol,
    originalSymbol: stock.originalSymbol || stock.symbol,
    found: stock.found,
    documentsCount: stock.documents?.length || 0,
    dividendsCount: stock.dividends?.length || 0,
    lastSynced: stock.scrapedAt,
  }));
}

export async function resetSync(): Promise<void> {
  await connectToDatabase();
  
  await AFSyncStatus.updateOne(
    { syncId: 'af-main' },
    {
      status: 'idle',
      processedStocks: 0,
      successfulStocks: 0,
      failedStocks: 0,
      notFoundStocks: 0,
      currentSymbol: '',
      currentBatch: 0,
      startedAt: null,
      completedAt: null,
      syncErrors: [],
      stocksProcessed: [],
      lastUpdated: new Date(),
    },
    { upsert: true }
  );
}
