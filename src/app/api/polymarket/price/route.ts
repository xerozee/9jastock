import { NextRequest, NextResponse } from 'next/server';
import { getPrice, BotConfig } from '@/lib/polymarket-bot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const config: BotConfig = {
      apiKey: body.apiKey,
      apiSecret: body.apiSecret,
      apiPassphrase: body.apiPassphrase,
      privateKey: body.privateKey,
      funderAddress: body.funderAddress,
      tokenId: body.tokenId,
      buyThreshold: 0,
      sellThreshold: 1,
      tradeSize: 0,
      checkInterval: 60,
    };
    
    if (!config.apiKey || !config.apiSecret || !config.apiPassphrase || !config.privateKey || !config.tokenId) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, apiSecret, apiPassphrase, privateKey, tokenId' },
        { status: 400 }
      );
    }
    
    const price = await getPrice(config);
    
    return NextResponse.json({ 
      price,
      tokenId: config.tokenId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch price' },
      { status: 500 }
    );
  }
}
