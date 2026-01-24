import { NextResponse } from 'next/server';
import { runBatchSync, getSyncStatus, resetSync } from '@/lib/afDataSyncAgent';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, batchSize = 10, startIndex = 0 } = body;
    
    if (action === 'reset') {
      await resetSync();
      return NextResponse.json({ success: true, message: 'Sync reset successfully' });
    }
    
    const currentStatus = await getSyncStatus();
    
    if (currentStatus.status === 'running') {
      return NextResponse.json(
        { error: 'Sync is already running', currentStatus },
        { status: 409 }
      );
    }
    
    const result = await runBatchSync(batchSize, startIndex);
    
    const newStatus = await getSyncStatus();
    
    return NextResponse.json({
      success: true,
      completed: result.completed,
      nextStartIndex: result.nextStartIndex,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('Error triggering AF sync:', error);
    return NextResponse.json(
      { error: 'Failed to trigger sync', details: error.message },
      { status: 500 }
    );
  }
}

export const maxDuration = 300;
