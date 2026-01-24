import { NextResponse } from 'next/server';
import { testBrowserAccess } from '@/lib/africanFinancialsBrowser';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET() {
  try {
    console.log('[API] Testing African Financials browser access...');
    const result = await testBrowserAccess();
    
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Browser test error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
