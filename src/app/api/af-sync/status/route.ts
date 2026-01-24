import { NextResponse } from 'next/server';
import { getSyncStatus, getAllSyncedStocks } from '@/lib/afDataSyncAgent';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStocks = searchParams.get('includeStocks') === 'true';
    
    const status = await getSyncStatus();
    
    let response: any = { status };
    
    if (includeStocks) {
      const syncedStocks = await getAllSyncedStocks();
      response.syncedStocks = syncedStocks;
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error getting AF sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status', details: error.message },
      { status: 500 }
    );
  }
}
