import { runBatchSync, getSyncStatus, AFSyncStatus } from '../src/lib/afDataSyncAgent';
import { connectToDatabase } from '../src/lib/mongodb';

const BATCH_SIZE = 15;
const BATCH_DELAY_MS = 30000;
const SYNC_INTERVAL_MS = 3 * 60 * 60 * 1000;

async function runScheduledSync() {
  console.log('='.repeat(60));
  console.log('African Financials Data Sync Agent');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  await connectToDatabase();
  
  let startIndex = 0;
  let completed = false;
  let batchCount = 0;
  
  const currentStatus = await getSyncStatus();
  
  if (currentStatus.status === 'running') {
    console.log('Sync already in progress, skipping...');
    return;
  }
  
  if (currentStatus.status === 'paused') {
    startIndex = currentStatus.processedStocks;
    console.log(`Resuming from index ${startIndex}`);
  }
  
  while (!completed) {
    batchCount++;
    console.log(`\nProcessing batch ${batchCount}...`);
    
    try {
      const result = await runBatchSync(BATCH_SIZE, startIndex);
      completed = result.completed;
      startIndex = result.nextStartIndex;
      
      if (!completed) {
        console.log(`Batch ${batchCount} complete. Waiting ${BATCH_DELAY_MS / 1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    } catch (error: any) {
      console.error(`Batch ${batchCount} failed:`, error.message);
      
      await AFSyncStatus.updateOne(
        { syncId: 'af-main' },
        {
          status: 'error',
          lastUpdated: new Date(),
          $push: {
            syncErrors: {
              symbol: 'BATCH',
              error: error.message,
              timestamp: new Date(),
            }
          }
        }
      );
      
      console.log('Waiting 60s before retrying...');
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
  
  const finalStatus = await getSyncStatus();
  
  console.log('\n' + '='.repeat(60));
  console.log('Sync Complete!');
  console.log(`Total stocks: ${finalStatus.totalStocks}`);
  console.log(`Successful: ${finalStatus.successfulStocks}`);
  console.log(`Not found: ${finalStatus.notFoundStocks}`);
  console.log(`Failed: ${finalStatus.failedStocks}`);
  console.log(`Duration: ${Math.round((finalStatus.lastRunDuration || 0) / 1000 / 60)} minutes`);
  console.log(`Next scheduled run: ${finalStatus.nextScheduledRun?.toISOString()}`);
  console.log('='.repeat(60));
}

async function runContinuously() {
  console.log('African Financials Sync Agent - Continuous Mode');
  console.log(`Sync interval: ${SYNC_INTERVAL_MS / 1000 / 60 / 60} hours`);
  
  while (true) {
    try {
      await runScheduledSync();
    } catch (error: any) {
      console.error('Sync cycle failed:', error.message);
    }
    
    console.log(`\nNext sync in ${SYNC_INTERVAL_MS / 1000 / 60 / 60} hours...`);
    await new Promise(resolve => setTimeout(resolve, SYNC_INTERVAL_MS));
  }
}

runContinuously().catch(console.error);
