import { NextResponse } from 'next/server';
import { connectToDatabase, AFCompanyData2 } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    const companies = await AFCompanyData2.find({ found: true })
      .select('symbol originalSymbol name url documents dividends profile scrapedAt')
      .sort({ 'documents.0.year': -1 })
      .lean();

    const isDateString = (str: string) => /^\d{4}-\d{2}-\d{2}$/.test(str);
    const isYearOnly = (str: string) => /^20\d{2}$/.test(str);
    const isReportType = (str: string) => {
      const lower = str.toLowerCase();
      return lower.includes('report') || lower.includes('presentation') || 
             lower === 'agm' || lower.includes('meeting') || lower.includes('abridged');
    };

    const mergeCompanyDocs = (docs: any[]) => {
      const docsByUrl = new Map<string, any>();
      
      docs.forEach((doc: any) => {
        const url = doc.url;
        if (!url) return;
        
        if (!docsByUrl.has(url)) {
          docsByUrl.set(url, { url, type: null, title: null, year: null, publishedDate: null });
        }
        
        const merged = docsByUrl.get(url);
        const title = doc.title?.trim() || '';
        
        if (isDateString(title)) {
          merged.publishedDate = title;
        } else if (isYearOnly(title)) {
          if (!merged.year || parseInt(title) < merged.year) {
            merged.year = parseInt(title);
          }
        } else if (isReportType(title)) {
          merged.type = doc.type || title;
          merged.title = title;
        }
      });
      
      return Array.from(docsByUrl.values()).filter(d => d.type && d.title);
    };

    const companiesWithStats = companies.map((company: any) => {
      const docs = company.documents || [];
      const dividends = company.dividends || [];
      
      const mergedDocs = mergeCompanyDocs(docs);
      const annualReports = mergedDocs.filter((d: any) => d.type === 'Annual Report').length;
      const interimReports = mergedDocs.filter((d: any) => d.type === 'Interim Report').length;
      const quarterlyReports = mergedDocs.filter((d: any) => d.type === 'Quarterly Report').length;
      const presentations = mergedDocs.filter((d: any) => d.type === 'Presentation').length;
      const otherDocs = mergedDocs.filter((d: any) => !['Annual Report', 'Interim Report', 'Quarterly Report', 'Presentation'].includes(d.type)).length;
      
      const latestDoc = mergedDocs.sort((a, b) => (b.year || 0) - (a.year || 0))[0];
      const latestYear = latestDoc?.year || 0;
      
      return {
        symbol: company.originalSymbol || company.symbol,
        afSymbol: company.symbol,
        name: company.name?.replace(/\s*\([^)]*\)$/, '') || company.symbol,
        url: company.url,
        totalDocuments: mergedDocs.length,
        annualReports,
        interimReports,
        quarterlyReports,
        presentations,
        otherDocs,
        dividendCount: dividends.length,
        latestYear,
        profile: company.profile,
        scrapedAt: company.scrapedAt,
      };
    });

    const allDocuments: any[] = [];
    const allDividends: any[] = [];

    companies.forEach((company: any) => {
      const companyName = company.name?.replace(/\s*\([^)]*\)$/, '') || company.symbol;
      const symbol = company.originalSymbol || company.symbol;
      
      const docsByUrl = new Map<string, any>();
      
      (company.documents || []).forEach((doc: any) => {
        const url = doc.url;
        if (!url) return;
        
        if (!docsByUrl.has(url)) {
          docsByUrl.set(url, {
            url,
            companySymbol: symbol,
            companyName,
            type: null,
            title: null,
            year: null,
            publishedDate: null,
          });
        }
        
        const merged = docsByUrl.get(url);
        const title = doc.title?.trim() || '';
        
        if (isDateString(title)) {
          merged.publishedDate = title;
        } else if (isYearOnly(title)) {
          if (!merged.year || parseInt(title) < merged.year) {
            merged.year = parseInt(title);
          }
        } else if (isReportType(title)) {
          merged.type = doc.type || title;
          merged.title = title;
        } else if (title === 'HY' || title === 'Q1' || title === 'Q2' || title === 'Q3' || title === 'Q4') {
          if (!merged.title || !merged.title.includes(title)) {
            merged.period = title;
          }
        }
      });
      
      docsByUrl.forEach((doc) => {
        if (doc.type && doc.title) {
          const existingDoc = allDocuments.find(d => d.url === doc.url);
          if (!existingDoc) {
            if (doc.period && doc.title && !doc.title.includes(doc.period)) {
              doc.title = `${doc.title} (${doc.period})`;
            }
            delete doc.period;
            allDocuments.push(doc);
          }
        }
      });
      
      (company.dividends || []).forEach((div: any) => {
        allDividends.push({
          ...div,
          companySymbol: symbol,
          companyName,
        });
      });
    });

    allDocuments.sort((a, b) => (b.year || 0) - (a.year || 0));
    allDividends.sort((a, b) => {
      const yearA = parseInt(a.fiscalYear) || 0;
      const yearB = parseInt(b.fiscalYear) || 0;
      return yearB - yearA;
    });

    const stats = {
      totalCompanies: companies.length,
      totalDocuments: allDocuments.length,
      totalDividends: allDividends.length,
      annualReports: allDocuments.filter(d => d.type === 'Annual Report').length,
      interimReports: allDocuments.filter(d => d.type === 'Interim Report').length,
      quarterlyReports: allDocuments.filter(d => d.type === 'Quarterly Report').length,
      presentations: allDocuments.filter(d => d.type === 'Presentation').length,
    };

    return NextResponse.json({
      success: true,
      stats,
      companies: companiesWithStats,
      documents: allDocuments.slice(0, 200),
      dividends: allDividends.slice(0, 100),
    });
  } catch (error) {
    console.error('[API] Error fetching financials:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
