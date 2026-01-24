const SYNC_INTERVAL_MS = 10 * 60 * 1000;
const RUNNER_INTERVAL_MS = 30 * 1000;
const BASE_URL = process.env.REPLIT_DEPLOYMENT_URL || process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEPLOYMENT_URL || process.env.REPLIT_DEV_DOMAIN}`
  : 'http://localhost:5000';

async function runSync() {
  try {
    console.log(`[${new Date().toISOString()}] Triggering sync runner...`);
    
    const response = await fetch(`${BASE_URL}/api/financial-documents/sync/runner`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.progress) {
        console.log(`[${new Date().toISOString()}] Progress: ${data.progress.processed}/${data.progress.total} (${data.progress.percentComplete}%)`);
        console.log(`  Documents in DB: ${data.progress.documentsInDB}`);
        console.log(`  Stocks with docs: ${data.progress.stocksWithDocs}`);
        
        if (data.progress.isComplete) {
          console.log(`[${new Date().toISOString()}] Full sync cycle completed! Waiting ${SYNC_INTERVAL_MS / 1000}s for next cycle...`);
        }
      } else {
        console.log(`[${new Date().toISOString()}] ${data.message}`);
        if (data.nextSyncIn) {
          console.log(`  Next sync in: ${data.nextSyncIn}`);
        }
      }
    } else {
      console.error(`[${new Date().toISOString()}] Sync error:`, data.error);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to trigger sync:`, error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('African Financials Document Sync Service');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Sync interval: ${SYNC_INTERVAL_MS / 1000} seconds`);
  console.log(`Runner check interval: ${RUNNER_INTERVAL_MS / 1000} seconds`);
  console.log('='.repeat(60));
  
  await runSync();
  
  setInterval(runSync, RUNNER_INTERVAL_MS);
}

main().catch(console.error);
