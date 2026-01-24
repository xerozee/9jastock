import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const AFCompanySchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: String,
  sector: String,
  url: String,
  updatedAt: { type: Date, default: Date.now },
});

const AFDividendSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  companyName: String,
  fiscalYear: String,
  dividendType: String,
  amount: Number,
  currency: String,
  exDate: String,
  paymentDate: String,
  declarationDate: String,
  updatedAt: { type: Date, default: Date.now },
});

const AFDocumentSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  companyName: String,
  title: String,
  type: String,
  year: Number,
  url: { type: String, unique: true },
  publishedDate: String,
  metrics: {
    revenue: String,
    profit: String,
    eps: String,
  },
  updatedAt: { type: Date, default: Date.now },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const type = searchParams.get('type') || 'all';
  
  try {
    await connectToDatabase();
    
    const AFCompanyModel = mongoose.models.AFCompany || mongoose.model('AFCompany', AFCompanySchema);
    const AFDividendModel = mongoose.models.AFDividend || mongoose.model('AFDividend', AFDividendSchema);
    const AFDocumentModel = mongoose.models.AFDocument || mongoose.model('AFDocument', AFDocumentSchema);
    
    const result: {
      companies?: unknown[];
      dividends?: unknown[];
      documents?: unknown[];
      company?: unknown;
    } = {};
    
    if (symbol) {
      const normalizedSymbol = symbol.toUpperCase().replace(/\s+/g, '');
      
      if (type === 'all' || type === 'company') {
        result.company = await AFCompanyModel.findOne({ 
          symbol: { $regex: new RegExp(`^${normalizedSymbol}`, 'i') }
        }).lean();
      }
      
      if (type === 'all' || type === 'dividends') {
        result.dividends = await AFDividendModel.find({ 
          symbol: { $regex: new RegExp(`^${normalizedSymbol}`, 'i') }
        }).sort({ fiscalYear: -1 }).lean();
      }
      
      if (type === 'all' || type === 'documents') {
        result.documents = await AFDocumentModel.find({ 
          symbol: { $regex: new RegExp(`^${normalizedSymbol}`, 'i') }
        }).sort({ year: -1 }).lean();
      }
    } else {
      if (type === 'all' || type === 'companies') {
        result.companies = await AFCompanyModel.find({}).sort({ symbol: 1 }).lean();
      }
      
      if (type === 'all' || type === 'dividends') {
        result.dividends = await AFDividendModel.find({}).sort({ symbol: 1, fiscalYear: -1 }).limit(500).lean();
      }
      
      if (type === 'all' || type === 'documents') {
        result.documents = await AFDocumentModel.find({}).sort({ year: -1, symbol: 1 }).limit(500).lean();
      }
    }
    
    const stats = {
      totalCompanies: await AFCompanyModel.countDocuments(),
      totalDividends: await AFDividendModel.countDocuments(),
      totalDocuments: await AFDocumentModel.countDocuments(),
    };
    
    return NextResponse.json({
      success: true,
      data: result,
      stats,
      query: { symbol, type },
    });
    
  } catch (error) {
    console.error('[API] Error fetching African Financials data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
