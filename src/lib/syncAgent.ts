import { connectToDatabase, SyncJob, SyncHistory, FinancialReport, CompanyFinancialData } from './mongodb';
import {
  scrapeCompanyData,
  getSupportedSymbols,
  hasAfricanFinancialsData,
  type CompanyFinancialData as ScrapedCompanyData
} from './africanFinancialsScraper';

// Types
export interface SyncConfig {
  batchSize: number;
  delayBetweenSymbols: number; // ms
  delayBetweenBatches: number; // ms
  maxRetries: number;
  source: string;
}

export interface SyncJobOptions {
  symbols?: string[]; // Specific symbols to sync, or all if not provided
  priority?: 'low' | 'normal' | 'high';
  triggeredBy?: 'scheduler' | 'manual' | 'api';
  batchSize?: number;
}

export interface SyncProgress {
  jobId: string;
  status: string;
  progress: number;
  currentSymbol?: string;
  processedSymbols: number;
  totalSymbols: number;
  successCount: number;
  failureCount: number;
  reportsFound: number;
  estimatedTimeRemaining?: number;
}

const DEFAULT_CONFIG: SyncConfig = {
  batchSize: 20,
  delayBetweenSymbols: 2000, // 2 seconds between each symbol
  delayBetweenBatches: 10000, // 10 seconds between batches
  maxRetries: 3,
  source: 'africanfinancials',
};

// Generate unique job ID
function generateJobId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `sync_${timestamp}_${random}`;
}

// Delay helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create a new sync job
export async function createSyncJob(options: SyncJobOptions = {}): Promise<string> {
  await connectToDatabase();

  const symbols = options.symbols || getSupportedSymbols();
  const batchSize = options.batchSize || DEFAULT_CONFIG.batchSize;
  const totalBatches = Math.ceil(symbols.length / batchSize);

  const jobId = generateJobId();

  const job = new SyncJob({
    jobId,
    source: DEFAULT_CONFIG.source,
    status: 'pending',
    totalSymbols: symbols.length,
    processedSymbols: 0,
    successCount: 0,
    failureCount: 0,
    reportsFound: 0,
    batchSize,
    currentBatch: 0,
    totalBatches,
    symbolsToProcess: symbols,
    processedSymbolsList: [],
    errors: [],
    metadata: {
      triggeredBy: options.triggeredBy || 'manual',
      priority: options.priority || 'normal',
      retryCount: 0,
      maxRetries: DEFAULT_CONFIG.maxRetries,
    },
  });

  await job.save();
  console.log(`Created sync job ${jobId} for ${symbols.length} symbols`);

  return jobId;
}

// Get sync job status
export async function getSyncJobStatus(jobId: string): Promise<SyncProgress | null> {
  await connectToDatabase();

  const job = await SyncJob.findOne({ jobId }).lean();
  if (!job) return null;

  const progress = job.totalSymbols > 0
    ? (job.processedSymbols / job.totalSymbols) * 100
    : 0;

  // Estimate remaining time based on average processing time
  let estimatedTimeRemaining: number | undefined;
  if (job.processedSymbols > 0 && job.startedAt) {
    const elapsed = Date.now() - new Date(job.startedAt).getTime();
    const avgTimePerSymbol = elapsed / job.processedSymbols;
    const remaining = job.totalSymbols - job.processedSymbols;
    estimatedTimeRemaining = Math.round(avgTimePerSymbol * remaining / 1000); // seconds
  }

  return {
    jobId,
    status: job.status,
    progress: Math.round(progress * 100) / 100,
    processedSymbols: job.processedSymbols,
    totalSymbols: job.totalSymbols,
    successCount: job.successCount,
    failureCount: job.failureCount,
    reportsFound: job.reportsFound,
    estimatedTimeRemaining,
  };
}

// Process a single symbol
async function processSymbol(
  jobId: string,
  symbol: string,
  config: SyncConfig
): Promise<{ success: boolean; reportsCount: number; error?: string }> {
  const startTime = Date.now();

  try {
    if (!hasAfricanFinancialsData(symbol)) {
      return { success: false, reportsCount: 0, error: 'No mapping found' };
    }

    // Scrape the company data
    const data = await scrapeCompanyData(symbol);

    if (!data) {
      return { success: false, reportsCount: 0, error: 'Scrape returned no data' };
    }

    // Save reports to database
    let reportsCreated = 0;
    let reportsUpdated = 0;

    for (const report of data.reports) {
      const result = await FinancialReport.findOneAndUpdate(
        { symbol: report.symbol, reportUrl: report.reportUrl },
        {
          ...report,
          source: config.source,
          scrapedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      if (result.isNew) {
        reportsCreated++;
      } else {
        reportsUpdated++;
      }
    }

    // Update company financial data cache
    await CompanyFinancialData.findOneAndUpdate(
      { symbol },
      {
        symbol,
        companyName: data.companyName,
        africanFinancialsUrl: data.africanFinancialsUrl,
        reportsCount: data.reports.length,
        latestReportYear: data.reports[0]?.year,
        latestReportType: data.reports[0]?.reportType,
        dividendsCount: data.dividends.length,
        latestDividendYear: data.dividends[0]?.year,
        lastUpdated: new Date(),
        lastScrapedAt: new Date(),
        scrapeStatus: 'success',
        scrapeError: null,
      },
      { upsert: true }
    );

    // Record sync history
    await SyncHistory.create({
      jobId,
      symbol,
      source: config.source,
      status: 'success',
      reportsFound: data.reports.length,
      reportsCreated,
      reportsUpdated,
      duration: Date.now() - startTime,
      highlights: {
        latestReportYear: data.reports[0]?.year,
        latestReportType: data.reports[0]?.reportType,
        hasFinancialHighlights: data.reports.some(r => r.highlights && Object.keys(r.highlights).length > 0),
      },
    });

    return { success: true, reportsCount: data.reports.length };
  } catch (error: any) {
    // Record failed sync
    await SyncHistory.create({
      jobId,
      symbol,
      source: config.source,
      status: 'failed',
      reportsFound: 0,
      duration: Date.now() - startTime,
      error: error.message,
    });

    // Update company status
    await CompanyFinancialData.findOneAndUpdate(
      { symbol },
      {
        symbol,
        lastScrapedAt: new Date(),
        scrapeStatus: 'failed',
        scrapeError: error.message,
      },
      { upsert: true }
    );

    return { success: false, reportsCount: 0, error: error.message };
  }
}

// Run a sync job
export async function runSyncJob(
  jobId: string,
  config: SyncConfig = DEFAULT_CONFIG
): Promise<void> {
  await connectToDatabase();

  const job = await SyncJob.findOne({ jobId });
  if (!job) {
    throw new Error(`Sync job ${jobId} not found`);
  }

  if (job.status === 'running') {
    console.log(`Job ${jobId} is already running`);
    return;
  }

  if (job.status === 'completed' || job.status === 'cancelled') {
    console.log(`Job ${jobId} is already ${job.status}`);
    return;
  }

  // Update job status to running
  job.status = 'running';
  job.startedAt = new Date();
  await job.save();

  console.log(`Starting sync job ${jobId}...`);

  const symbols = job.symbolsToProcess;
  const batchSize = job.batchSize || config.batchSize;

  try {
    // Process in batches
    for (let batchIndex = 0; batchIndex < Math.ceil(symbols.length / batchSize); batchIndex++) {
      // Check if job was cancelled
      const currentJob = await SyncJob.findOne({ jobId });
      if (currentJob?.status === 'cancelled') {
        console.log(`Job ${jobId} was cancelled`);
        return;
      }

      const batchStart = batchIndex * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, symbols.length);
      const batch = symbols.slice(batchStart, batchEnd);

      console.log(`Processing batch ${batchIndex + 1}/${Math.ceil(symbols.length / batchSize)} (${batch.length} symbols)`);

      // Update current batch
      await SyncJob.updateOne({ jobId }, { currentBatch: batchIndex + 1 });

      // Process each symbol in the batch
      for (const symbol of batch) {
        console.log(`  Syncing ${symbol}...`);

        const result = await processSymbol(jobId, symbol, config);

        // Update job progress
        await SyncJob.updateOne(
          { jobId },
          {
            $inc: {
              processedSymbols: 1,
              successCount: result.success ? 1 : 0,
              failureCount: result.success ? 0 : 1,
              reportsFound: result.reportsCount,
            },
            $push: {
              processedSymbolsList: symbol,
              ...(result.error && {
                errors: { symbol, error: result.error, timestamp: new Date() },
              }),
            },
            updatedAt: new Date(),
          }
        );

        if (result.success) {
          console.log(`    Success: Found ${result.reportsCount} reports`);
        } else {
          console.log(`    Failed: ${result.error}`);
        }

        // Delay between symbols
        await delay(config.delayBetweenSymbols);
      }

      // Delay between batches
      if (batchIndex < Math.ceil(symbols.length / batchSize) - 1) {
        console.log(`Waiting ${config.delayBetweenBatches / 1000}s before next batch...`);
        await delay(config.delayBetweenBatches);
      }
    }

    // Mark job as completed
    await SyncJob.updateOne(
      { jobId },
      {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      }
    );

    console.log(`Sync job ${jobId} completed successfully`);
  } catch (error: any) {
    // Mark job as failed
    await SyncJob.updateOne(
      { jobId },
      {
        status: 'failed',
        completedAt: new Date(),
        updatedAt: new Date(),
        $push: {
          errors: { symbol: 'SYSTEM', error: error.message, timestamp: new Date() },
        },
      }
    );

    console.error(`Sync job ${jobId} failed:`, error.message);
    throw error;
  }
}

// Cancel a running sync job
export async function cancelSyncJob(jobId: string): Promise<boolean> {
  await connectToDatabase();

  const result = await SyncJob.updateOne(
    { jobId, status: 'running' },
    { status: 'cancelled', completedAt: new Date(), updatedAt: new Date() }
  );

  return result.modifiedCount > 0;
}

// Get recent sync jobs
export async function getRecentSyncJobs(limit: number = 10): Promise<any[]> {
  await connectToDatabase();

  return SyncJob.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

// Get sync history for a symbol
export async function getSymbolSyncHistory(
  symbol: string,
  limit: number = 10
): Promise<any[]> {
  await connectToDatabase();

  return SyncHistory.find({ symbol: symbol.toUpperCase() })
    .sort({ syncedAt: -1 })
    .limit(limit)
    .lean();
}

// Get symbols that need syncing (not synced in the last N hours)
export async function getStaleSymbols(hoursThreshold: number = 24): Promise<string[]> {
  await connectToDatabase();

  const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
  const allSymbols = getSupportedSymbols();

  // Find symbols that have been synced recently
  const recentlySynced = await CompanyFinancialData.find({
    lastScrapedAt: { $gte: cutoffDate },
    scrapeStatus: 'success',
  }).select('symbol').lean();

  const recentlySyncedSet = new Set(recentlySynced.map(s => s.symbol));

  // Return symbols that haven't been synced recently
  return allSymbols.filter(s => !recentlySyncedSet.has(s));
}

// Quick sync for a single symbol (bypasses job queue)
export async function quickSyncSymbol(symbol: string): Promise<{
  success: boolean;
  reportsCount: number;
  error?: string;
}> {
  await connectToDatabase();

  const jobId = `quick_${Date.now()}`;
  return processSymbol(jobId, symbol.toUpperCase(), DEFAULT_CONFIG);
}

// Get sync statistics
export async function getSyncStatistics(): Promise<{
  totalSymbolsSupported: number;
  symbolsSyncedSuccessfully: number;
  symbolsFailed: number;
  symbolsPending: number;
  totalReports: number;
  recentJobsCount: number;
  lastSyncAt?: Date;
  averageSyncDuration?: number;
}> {
  await connectToDatabase();

  const allSymbols = getSupportedSymbols();

  const [
    successCount,
    failedCount,
    totalReports,
    recentJobs,
    lastSync,
    avgDuration,
  ] = await Promise.all([
    CompanyFinancialData.countDocuments({ scrapeStatus: 'success' }),
    CompanyFinancialData.countDocuments({ scrapeStatus: 'failed' }),
    FinancialReport.countDocuments(),
    SyncJob.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    CompanyFinancialData.findOne({ scrapeStatus: 'success' }).sort({ lastScrapedAt: -1 }).select('lastScrapedAt').lean(),
    SyncHistory.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
    ]),
  ]);

  return {
    totalSymbolsSupported: allSymbols.length,
    symbolsSyncedSuccessfully: successCount,
    symbolsFailed: failedCount,
    symbolsPending: allSymbols.length - successCount - failedCount,
    totalReports,
    recentJobsCount: recentJobs,
    lastSyncAt: lastSync?.lastScrapedAt,
    averageSyncDuration: avgDuration[0]?.avgDuration,
  };
}

// Create incremental sync job (only syncs stale symbols)
export async function createIncrementalSyncJob(
  hoursThreshold: number = 24,
  options: Omit<SyncJobOptions, 'symbols'> = {}
): Promise<string> {
  const staleSymbols = await getStaleSymbols(hoursThreshold);

  if (staleSymbols.length === 0) {
    console.log('No stale symbols found, skipping sync');
    return '';
  }

  return createSyncJob({
    ...options,
    symbols: staleSymbols,
  });
}

// Export default config for external use
export { DEFAULT_CONFIG };
