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

    const companiesWithStats = companies.map((company: any) => {
      const docs = company.documents || [];
      const dividends = company.dividends || [];
      
      const annualReports = docs.filter((d: any) => d.type === 'Annual Report').length;
      const interimReports = docs.filter((d: any) => d.type === 'Interim Report').length;
      const quarterlyReports = docs.filter((d: any) => d.type === 'Quarterly Report').length;
      const presentations = docs.filter((d: any) => d.type === 'Presentation').length;
      const otherDocs = docs.filter((d: any) => !['Annual Report', 'Interim Report', 'Quarterly Report', 'Presentation'].includes(d.type)).length;
      
      const latestDoc = docs[0];
      const latestYear = latestDoc?.year || 0;
      
      return {
        symbol: company.originalSymbol || company.symbol,
        afSymbol: company.symbol,
        name: company.name?.replace(/\s*\([^)]*\)$/, '') || company.symbol,
        url: company.url,
        totalDocuments: docs.length,
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
      
      (company.documents || []).forEach((doc: any) => {
        if (!allDocuments.some(d => d.url === doc.url)) {
          allDocuments.push({
            ...doc,
            companySymbol: symbol,
            companyName,
          });
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
