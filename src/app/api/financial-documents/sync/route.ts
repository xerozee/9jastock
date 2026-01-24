import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, FinancialDocument, FinancialDocSync } from '@/lib/mongodb';
import { fetchCompanyDocuments, getAllNGXSymbols, FinancialDocumentData } from '@/lib/africanFinancialsScraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

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
    const totalDocs = await FinancialDocument.countDocuments();
    const stocksWithDocs = await FinancialDocument.distinct('symbol');
    
    return NextResponse.json({
      success: true,
      status: syncStatus || { status: 'idle', totalStocks: 0, processedStocks: 0 },
      totalDocumentsInDB: totalDocs,
      uniqueStocksWithDocs: stocksWithDocs.length,
      stocksWithDocs: stocksWithDocs.slice(0, 50),
    });
  } catch (error) {
    console.error('Sync status error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get sync status' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const existingSync = await FinancialDocSync.findOne({ syncId: 'main' }).lean();
    if (existingSync?.status === 'running') {
      const startedAt = existingSync.startedAt ? new Date(existingSync.startedAt).getTime() : 0;
      const runningFor = Date.now() - startedAt;
      if (runningFor < 10 * 60 * 1000) {
        return NextResponse.json({
          success: false,
          error: 'Sync is already running',
          status: existingSync,
        }, { status: 409 });
      }
    }

    const allSymbols = await getAllNGXSymbols();
    const { searchParams } = new URL(request.url);
    const batchSize = parseInt(searchParams.get('batchSize') || '10');
    const startFrom = parseInt(searchParams.get('startFrom') || '0');
    
    await updateSyncProgress({
      status: 'running',
      totalStocks: allSymbols.length,
      processedStocks: startFrom,
      successfulStocks: 0,
      failedStocks: 0,
      totalDocuments: 0,
      currentSymbol: '',
      startedAt: new Date(),
      completedAt: null,
      syncErrors: [],
      stocksWithDocs: [],
    });

    let processedStocks = startFrom;
    let successfulStocks = 0;
    let failedStocks = 0;
    let totalDocuments = 0;
    const errors: string[] = [];
    const stocksWithDocs: string[] = [];

    const symbolsToProcess = allSymbols.slice(startFrom, startFrom + batchSize);
    
    for (const symbol of symbolsToProcess) {
      try {
        await updateSyncProgress({
          currentSymbol: symbol,
          processedStocks,
        });

        console.log(`[Sync] Fetching documents for ${symbol}...`);
        const documents = await fetchCompanyDocuments(symbol, 50);
        
        if (documents.length > 0) {
          await upsertDocuments(documents);
          totalDocuments += documents.length;
          stocksWithDocs.push(symbol);
          console.log(`[Sync] ${symbol}: Found ${documents.length} documents`);
        } else {
          console.log(`[Sync] ${symbol}: No documents found`);
        }
        
        successfulStocks++;
      } catch (error) {
        console.error(`[Sync] Error fetching ${symbol}:`, error);
        errors.push(`${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failedStocks++;
      }
      
      processedStocks++;
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const isComplete = processedStocks >= allSymbols.length;
    
    await updateSyncProgress({
      status: isComplete ? 'completed' : 'running',
      processedStocks,
      successfulStocks,
      failedStocks,
      totalDocuments,
      currentSymbol: '',
      completedAt: isComplete ? new Date() : null,
      syncErrors: errors,
      stocksWithDocs,
    });

    return NextResponse.json({
      success: true,
      message: isComplete ? 'Sync completed' : 'Batch completed',
      progress: {
        processed: processedStocks,
        total: allSymbols.length,
        successful: successfulStocks,
        failed: failedStocks,
        documentsFound: totalDocuments,
        stocksWithDocs: stocksWithDocs.length,
        isComplete,
        nextBatchStart: isComplete ? null : processedStocks,
      },
      errors: errors.slice(0, 10),
    });

  } catch (error) {
    console.error('Sync error:', error);
    
    await updateSyncProgress({
      status: 'error',
      syncErrors: [error instanceof Error ? error.message : 'Unknown error'],
    });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
