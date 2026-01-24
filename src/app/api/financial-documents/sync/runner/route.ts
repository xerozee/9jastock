import { NextResponse } from 'next/server';
import { connectToDatabase, FinancialDocument, FinancialDocSync } from '@/lib/mongodb';
import { fetchCompanyDocuments, getAllNGXSymbols, FinancialDocumentData } from '@/lib/africanFinancialsScraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SYNC_INTERVAL_MS = 10 * 60 * 1000;
const BATCH_SIZE = 5;
const DELAY_BETWEEN_STOCKS_MS = 300;

async function upsertDocuments(documents: FinancialDocumentData[]) {
  let upsertedCount = 0;
  for (const doc of documents) {
    await FinancialDocument.findOneAndUpdate(
      { documentUrl: doc.documentUrl },
      {
        ...doc,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
    upsertedCount++;
  }
  return upsertedCount;
}

async function updateSyncProgress(update: Record<string, any>) {
  await FinancialDocSync.findOneAndUpdate(
    { syncId: 'main' },
    { ...update, lastUpdated: new Date() },
    { upsert: true, new: true }
  );
}

export async function GET() {
  try {
    await connectToDatabase();
    
    const syncStatus = await FinancialDocSync.findOne({ syncId: 'main' }).lean();
    
    if (syncStatus?.status === 'running') {
      const startedAt = syncStatus.startedAt ? new Date(syncStatus.startedAt).getTime() : 0;
      const runningFor = Date.now() - startedAt;
      
      if (runningFor < SYNC_INTERVAL_MS) {
        return NextResponse.json({
          success: true,
          message: 'Sync is already running',
          status: syncStatus,
          runningForSeconds: Math.floor(runningFor / 1000),
        });
      }
    }

    const allSymbols = await getAllNGXSymbols();
    
    let startFrom = 0;
    if (syncStatus?.status === 'running' && syncStatus.processedStocks) {
      startFrom = syncStatus.processedStocks;
    }
    
    if (syncStatus?.status === 'completed') {
      const completedAt = syncStatus.completedAt ? new Date(syncStatus.completedAt).getTime() : 0;
      const timeSinceCompletion = Date.now() - completedAt;
      
      if (timeSinceCompletion >= SYNC_INTERVAL_MS) {
        startFrom = 0;
        console.log('[Sync Runner] Starting fresh sync cycle');
      } else {
        return NextResponse.json({
          success: true,
          message: 'Sync completed recently, waiting for next cycle',
          nextSyncIn: Math.floor((SYNC_INTERVAL_MS - timeSinceCompletion) / 1000) + ' seconds',
          status: syncStatus,
        });
      }
    }

    await updateSyncProgress({
      status: 'running',
      totalStocks: allSymbols.length,
      processedStocks: startFrom,
      startedAt: startFrom === 0 ? new Date() : syncStatus?.startedAt,
    });

    let processedStocks = startFrom;
    let successfulStocks = syncStatus?.successfulStocks || 0;
    let failedStocks = syncStatus?.failedStocks || 0;
    let totalDocuments = syncStatus?.totalDocuments || 0;
    const errors: string[] = syncStatus?.syncErrors || [];
    const stocksWithDocs: string[] = syncStatus?.stocksWithDocs || [];

    const symbolsToProcess = allSymbols.slice(startFrom, startFrom + BATCH_SIZE);
    
    for (const symbol of symbolsToProcess) {
      try {
        await updateSyncProgress({ currentSymbol: symbol });
        
        console.log(`[Sync Runner] Processing ${symbol} (${processedStocks + 1}/${allSymbols.length})`);
        const documents = await fetchCompanyDocuments(symbol, 50);
        
        if (documents.length > 0) {
          await upsertDocuments(documents);
          totalDocuments += documents.length;
          if (!stocksWithDocs.includes(symbol)) {
            stocksWithDocs.push(symbol);
          }
          console.log(`[Sync Runner] ${symbol}: ${documents.length} documents`);
        }
        
        successfulStocks++;
      } catch (error) {
        console.error(`[Sync Runner] Error for ${symbol}:`, error);
        const errorMsg = `${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        if (!errors.includes(errorMsg)) {
          errors.push(errorMsg);
        }
        failedStocks++;
      }
      
      processedStocks++;
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_STOCKS_MS));
    }

    const isComplete = processedStocks >= allSymbols.length;
    
    await updateSyncProgress({
      status: isComplete ? 'completed' : 'running',
      processedStocks,
      successfulStocks: startFrom === 0 ? successfulStocks : syncStatus?.successfulStocks || 0 + successfulStocks,
      failedStocks: startFrom === 0 ? failedStocks : syncStatus?.failedStocks || 0 + failedStocks,
      totalDocuments,
      currentSymbol: '',
      completedAt: isComplete ? new Date() : null,
      syncErrors: errors.slice(-50),
      stocksWithDocs,
    });

    return NextResponse.json({
      success: true,
      message: isComplete ? 'Full sync cycle completed' : 'Batch processed',
      progress: {
        processed: processedStocks,
        total: allSymbols.length,
        percentComplete: Math.round((processedStocks / allSymbols.length) * 100),
        documentsInDB: totalDocuments,
        stocksWithDocs: stocksWithDocs.length,
        isComplete,
      },
    });

  } catch (error) {
    console.error('[Sync Runner] Fatal error:', error);
    
    await updateSyncProgress({
      status: 'error',
      syncErrors: [error instanceof Error ? error.message : 'Unknown error'],
    }).catch(() => {});
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Sync runner failed',
    }, { status: 500 });
  }
}
