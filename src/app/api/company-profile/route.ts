import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, CompanyProfile } from '@/lib/mongodb';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function isAdminRequest(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return !!ADMIN_API_KEY && apiKey === ADMIN_API_KEY;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    await connectToDatabase();

    if (symbol) {
      const profile = await CompanyProfile.findOne({ symbol: symbol.toUpperCase() });
      if (!profile) {
        return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
      }
      return NextResponse.json(profile);
    }

    const profiles = await CompanyProfile.find({}).sort({ symbol: 1 }).limit(200);
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, name, ...profileData } = body;

    if (!symbol || !name) {
      return NextResponse.json({ error: 'Symbol and name are required' }, { status: 400 });
    }

    await connectToDatabase();

    const profile = await CompanyProfile.findOneAndUpdate(
      { symbol: symbol.toUpperCase() },
      {
        symbol: symbol.toUpperCase(),
        name,
        ...profileData,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error saving company profile:', error);
    return NextResponse.json({ error: 'Failed to save company profile' }, { status: 500 });
  }
}
