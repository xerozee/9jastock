import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import {
  createSyncJob,
  getSyncJobStatus,
  runSyncJob,
  cancelSyncJob,
  getRecentSyncJobs,
  getSyncStatistics,
  createIncrementalSyncJob,
  quickSyncSymbol,
  getSymbolSyncHistory,
  getStaleSymbols,
} from '@/lib/syncAgent';
import { getSupportedSymbols } from '@/lib/africanFinancialsScraper';

// GET - Get sync status, jobs, or statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const jobId = searchParams.get('jobId');
    const symbol = searchParams.get('symbol');

    switch (action) {
      case 'status':
        if (!jobId) {
          return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
        }
        const status = await getSyncJobStatus(jobId);
        if (!status) {
          return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: status });

      case 'jobs':
        const limit = parseInt(searchParams.get('limit') || '10');
        const jobs = await getRecentSyncJobs(limit);
        return NextResponse.json({ success: true, data: jobs });

      case 'statistics':
        const stats = await getSyncStatistics();
        return NextResponse.json({ success: true, data: stats });

      case 'stale':
        const hours = parseInt(searchParams.get('hours') || '24');
        const staleSymbols = await getStaleSymbols(hours);
        return NextResponse.json({
          success: true,
          data: {
            count: staleSymbols.length,
            symbols: staleSymbols,
            hoursThreshold: hours,
          },
        });

      case 'symbol-history':
        if (!symbol) {
          return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
        }
        const historyLimit = parseInt(searchParams.get('limit') || '10');
        const history = await getSymbolSyncHistory(symbol, historyLimit);
        return NextResponse.json({ success: true, data: history });

      case 'supported':
        const supportedSymbols = getSupportedSymbols();
        return NextResponse.json({
          success: true,
          data: {
            count: supportedSymbols.length,
            symbols: supportedSymbols,
          },
        });

      default:
        // Default: return general sync info
        const [generalStats, recentJobs] = await Promise.all([
          getSyncStatistics(),
          getRecentSyncJobs(5),
        ]);
        return NextResponse.json({
          success: true,
          data: {
            statistics: generalStats,
            recentJobs,
            supportedSymbolsCount: getSupportedSymbols().length,
          },
        });
    }
  } catch (error: any) {
    console.error('Sync GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create and optionally run sync jobs
export async function POST(request: NextRequest) {
  try {
    // Optional: Check for admin authentication
    // const session = await getServerSession(authOptions);
    // if (!session || !(session.user as any).isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { action, jobId, symbols, batchSize, priority, runImmediately, hoursThreshold } = body;

    switch (action) {
      case 'create':
        // Create a new sync job
        const newJobId = await createSyncJob({
          symbols: symbols || undefined,
          batchSize: batchSize || 20,
          priority: priority || 'normal',
          triggeredBy: 'api',
        });

        if (runImmediately) {
          // Run the job in the background
          runSyncJob(newJobId).catch(err => {
            console.error(`Background job ${newJobId} failed:`, err);
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            jobId: newJobId,
            message: runImmediately
              ? 'Sync job created and started'
              : 'Sync job created. Call run endpoint to start.',
          },
        });

      case 'run':
        // Run an existing job
        if (!jobId) {
          return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
        }

        // Run in background
        runSyncJob(jobId).catch(err => {
          console.error(`Job ${jobId} failed:`, err);
        });

        return NextResponse.json({
          success: true,
          data: {
            jobId,
            message: 'Sync job started',
          },
        });

      case 'cancel':
        // Cancel a running job
        if (!jobId) {
          return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
        }

        const cancelled = await cancelSyncJob(jobId);
        return NextResponse.json({
          success: true,
          data: {
            jobId,
            cancelled,
            message: cancelled ? 'Job cancelled' : 'Job was not running',
          },
        });

      case 'incremental':
        // Create and run an incremental sync (only stale symbols)
        const incrementalJobId = await createIncrementalSyncJob(
          hoursThreshold || 24,
          {
            batchSize: batchSize || 20,
            priority: priority || 'normal',
            triggeredBy: 'api',
          }
        );

        if (!incrementalJobId) {
          return NextResponse.json({
            success: true,
            data: {
              message: 'No stale symbols found, sync not needed',
            },
          });
        }

        if (runImmediately !== false) {
          runSyncJob(incrementalJobId).catch(err => {
            console.error(`Incremental job ${incrementalJobId} failed:`, err);
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            jobId: incrementalJobId,
            message: 'Incremental sync job created and started',
          },
        });

      case 'quick-sync':
        // Quick sync a single symbol without creating a full job
        const symbol = body.symbol;
        if (!symbol) {
          return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
        }

        const result = await quickSyncSymbol(symbol);
        return NextResponse.json({
          success: true,
          data: {
            symbol,
            ...result,
          },
        });

      case 'full':
        // Create and run a full sync of all symbols
        const allSymbols = getSupportedSymbols();
        const fullJobId = await createSyncJob({
          symbols: allSymbols,
          batchSize: batchSize || 20,
          priority: priority || 'low', // Full syncs are low priority by default
          triggeredBy: 'api',
        });

        if (runImmediately !== false) {
          runSyncJob(fullJobId).catch(err => {
            console.error(`Full sync job ${fullJobId} failed:`, err);
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            jobId: fullJobId,
            totalSymbols: allSymbols.length,
            message: 'Full sync job created and started',
          },
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Sync POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
