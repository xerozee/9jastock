import { NextResponse } from 'next/server';
import { runBatchSync, getSyncStatus, AFSyncStatus } from '@/lib/afDataSyncAgent';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const currentStatus = await getSyncStatus();
    
    if (currentStatus.status === 'running') {
      return NextResponse.json({
        message: 'Sync already in progress',
        status: currentStatus,
      });
    }
    
    let startIndex = 0;
    
    if (currentStatus.status === 'paused') {
      startIndex = currentStatus.processedStocks;
    }
    
    console.log(`AF Sync Runner: Starting batch sync from index ${startIndex}`);
    
    const result = await runBatchSync(15, startIndex);
    
    const newStatus = await getSyncStatus();
    
    if (result.completed) {
      await AFSyncStatus.updateOne(
        { syncId: 'af-main' },
        { nextScheduledRun: new Date(Date.now() + 3 * 60 * 60 * 1000) }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: result.completed ? 'Full sync completed' : 'Batch completed, more to process',
      completed: result.completed,
      nextStartIndex: result.nextStartIndex,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('Error in AF sync runner:', error);
    
    await AFSyncStatus.updateOne(
      { syncId: 'af-main' },
      { 
        status: 'error',
        lastUpdated: new Date(),
        $push: {
          syncErrors: {
            symbol: 'SYSTEM',
            error: error.message,
            timestamp: new Date(),
          }
        }
      }
    ).catch(() => {});
    
    return NextResponse.json(
      { error: 'Sync runner failed', details: error.message },
      { status: 500 }
    );
  }
}

export const maxDuration = 300;
