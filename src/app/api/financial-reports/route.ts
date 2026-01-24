import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, FinancialReport, CompanyFinancialData } from '@/lib/mongodb';
import { scrapeCompanyData, hasAfricanFinancialsData, getSupportedSymbols } from '@/lib/africanFinancialsScraper';

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol')?.toUpperCase();
    const refresh = searchParams.get('refresh') === 'true';

    if (!symbol) {
      // Return list of supported symbols
      return NextResponse.json({
        success: true,
        supportedSymbols: getSupportedSymbols(),
        message: 'Provide a symbol parameter to get financial reports',
      });
    }

    await connectToDatabase();

    // Check if data exists and is fresh
    const cachedData = await CompanyFinancialData.findOne({ symbol }).lean();
    const isCacheFresh = cachedData?.lastScrapedAt &&
      (Date.now() - new Date(cachedData.lastScrapedAt).getTime()) < CACHE_DURATION;

    if (cachedData && isCacheFresh && !refresh) {
      // Return cached reports
      const reports = await FinancialReport.find({ symbol })
        .sort({ year: -1, reportType: 1 })
        .lean();

      return NextResponse.json({
        success: true,
        symbol,
        companyName: cachedData.companyName,
        africanFinancialsUrl: cachedData.africanFinancialsUrl,
        reports,
        reportsCount: reports.length,
        lastUpdated: cachedData.lastScrapedAt,
        cached: true,
      });
    }

    // Check if symbol is supported
    if (!hasAfricanFinancialsData(symbol)) {
      return NextResponse.json({
        success: false,
        error: `No African Financials data mapping for symbol: ${symbol}`,
        supportedSymbols: getSupportedSymbols(),
      }, { status: 404 });
    }

    // Scrape fresh data
    console.log(`Scraping African Financials data for ${symbol}...`);
    const scrapedData = await scrapeCompanyData(symbol);

    if (!scrapedData) {
      // Update cache status
      await CompanyFinancialData.findOneAndUpdate(
        { symbol },
        {
          symbol,
          lastScrapedAt: new Date(),
          scrapeStatus: 'failed',
          scrapeError: 'Failed to fetch data from African Financials',
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch data from African Financials',
        symbol,
      }, { status: 500 });
    }

    // Save reports to database
    for (const report of scrapedData.reports) {
      await FinancialReport.findOneAndUpdate(
        { symbol: report.symbol, reportUrl: report.reportUrl },
        {
          ...report,
          source: 'africanfinancials.com',
          scrapedAt: new Date(),
        },
        { upsert: true }
      );
    }

    // Update company financial data cache
    await CompanyFinancialData.findOneAndUpdate(
      { symbol },
      {
        symbol,
        companyName: scrapedData.companyName,
        africanFinancialsUrl: scrapedData.africanFinancialsUrl,
        reportsCount: scrapedData.reports.length,
        latestReportYear: scrapedData.reports[0]?.year,
        latestReportType: scrapedData.reports[0]?.reportType,
        dividendsCount: scrapedData.dividends.length,
        latestDividendYear: scrapedData.dividends[0]?.year,
        lastUpdated: new Date(),
        lastScrapedAt: new Date(),
        scrapeStatus: 'success',
        scrapeError: null,
      },
      { upsert: true }
    );

    // Get all reports for this symbol
    const reports = await FinancialReport.find({ symbol })
      .sort({ year: -1, reportType: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      symbol,
      companyName: scrapedData.companyName,
      africanFinancialsUrl: scrapedData.africanFinancialsUrl,
      reports,
      dividends: scrapedData.dividends,
      reportsCount: reports.length,
      lastUpdated: new Date(),
      cached: false,
    });
  } catch (error: any) {
    console.error('Error fetching financial reports:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

// POST endpoint for bulk scraping or manual refresh
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols, refreshAll } = body;

    await connectToDatabase();

    const results: Array<{ symbol: string; success: boolean; error?: string }> = [];

    const symbolsToProcess = refreshAll
      ? getSupportedSymbols()
      : (symbols || []).map((s: string) => s.toUpperCase());

    for (const symbol of symbolsToProcess.slice(0, 10)) { // Limit to 10 at a time
      try {
        if (!hasAfricanFinancialsData(symbol)) {
          results.push({ symbol, success: false, error: 'Not supported' });
          continue;
        }

        const scrapedData = await scrapeCompanyData(symbol);

        if (scrapedData) {
          for (const report of scrapedData.reports) {
            await FinancialReport.findOneAndUpdate(
              { symbol: report.symbol, reportUrl: report.reportUrl },
              { ...report, source: 'africanfinancials.com', scrapedAt: new Date() },
              { upsert: true }
            );
          }

          await CompanyFinancialData.findOneAndUpdate(
            { symbol },
            {
              symbol,
              companyName: scrapedData.companyName,
              africanFinancialsUrl: scrapedData.africanFinancialsUrl,
              reportsCount: scrapedData.reports.length,
              latestReportYear: scrapedData.reports[0]?.year,
              latestReportType: scrapedData.reports[0]?.reportType,
              dividendsCount: scrapedData.dividends.length,
              lastScrapedAt: new Date(),
              scrapeStatus: 'success',
            },
            { upsert: true }
          );

          results.push({ symbol, success: true });
        } else {
          results.push({ symbol, success: false, error: 'Scrape failed' });
        }

        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        results.push({ symbol, success: false, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error in bulk scrape:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
    }, { status: 500 });
  }
}
