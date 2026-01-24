import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, FinancialDocument } from '@/lib/mongodb';
import { fetchCompanyDocuments, fetchLatestDocuments, FinancialDocumentData } from '@/lib/africanFinancialsScraper';

export const dynamic = 'force-dynamic';

const CACHE_TTL = 10 * 60 * 1000;

async function upsertDocuments(documents: FinancialDocumentData[]) {
  for (const doc of documents) {
    await FinancialDocument.findOneAndUpdate(
      { documentUrl: doc.documentUrl },
      {
        ...doc,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '10');
    const refresh = searchParams.get('refresh') === 'true';

    await connectToDatabase();

    if (symbol) {
      const cleanSymbol = symbol.toUpperCase().replace('NSENG:', '').replace('NGX:', '');
      
      const baseQuery: Record<string, any> = { symbol: cleanSymbol };
      if (type) baseQuery.documentType = type;
      if (year) baseQuery.year = parseInt(year);
      
      const existingDocs = await FinancialDocument.find(baseQuery)
        .sort({ publishedDate: -1 })
        .limit(limit)
        .lean();

      const anyDocsForSymbol = await FinancialDocument.findOne({ symbol: cleanSymbol }).lean();
      const lastUpdateTime = anyDocsForSymbol?.lastUpdated ? new Date(anyDocsForSymbol.lastUpdated).getTime() : 0;
      
      const shouldRefresh = refresh || 
        !anyDocsForSymbol || 
        (Date.now() - lastUpdateTime > CACHE_TTL);

      if (shouldRefresh) {
        const freshDocs = await fetchCompanyDocuments(cleanSymbol);
        if (freshDocs.length > 0) {
          await upsertDocuments(freshDocs);
          
          const updatedDocs = await FinancialDocument.find(baseQuery)
            .sort({ publishedDate: -1 })
            .limit(limit)
            .lean();
          
          return NextResponse.json({
            success: true,
            documents: updatedDocs,
            count: updatedDocs.length,
            source: 'fresh',
            lastUpdated: new Date().toISOString(),
          });
        }
      }

      return NextResponse.json({
        success: true,
        documents: existingDocs,
        count: existingDocs.length,
        source: 'cache',
        lastUpdated: anyDocsForSymbol?.lastUpdated || null,
      });
    }

    const baseQuery: Record<string, any> = {};
    if (type) baseQuery.documentType = type;
    if (year) baseQuery.year = parseInt(year);
    
    const existingLatest = await FinancialDocument.find(baseQuery)
      .sort({ publishedDate: -1 })
      .limit(limit)
      .lean();

    const mostRecentDoc = await FinancialDocument.findOne({})
      .sort({ lastUpdated: -1 })
      .lean();
    
    const lastUpdateTime = mostRecentDoc?.lastUpdated ? new Date(mostRecentDoc.lastUpdated).getTime() : 0;

    const shouldRefreshLatest = refresh || 
      !mostRecentDoc || 
      (Date.now() - lastUpdateTime > CACHE_TTL);

    if (shouldRefreshLatest) {
      const latestDocs = await fetchLatestDocuments(Math.max(limit, 20));
      if (latestDocs.length > 0) {
        await upsertDocuments(latestDocs);
        
        const updatedLatest = await FinancialDocument.find(baseQuery)
          .sort({ publishedDate: -1 })
          .limit(limit)
          .lean();
        
        return NextResponse.json({
          success: true,
          documents: updatedLatest,
          count: updatedLatest.length,
          source: 'fresh',
          lastUpdated: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      documents: existingLatest,
      count: existingLatest.length,
      source: 'cache',
      lastUpdated: mostRecentDoc?.lastUpdated || null,
    });

  } catch (error) {
    console.error('Financial documents API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch financial documents' 
    }, { status: 500 });
  }
}
