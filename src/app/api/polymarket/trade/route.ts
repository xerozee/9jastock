import { NextRequest, NextResponse } from 'next/server';
import { executeTrade, BotConfig, setPosition } from '@/lib/polymarket-bot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { side, size } = body;
    
    if (!side || !['buy', 'sell'].includes(side)) {
      return NextResponse.json(
        { error: 'Invalid side. Must be "buy" or "sell"' },
        { status: 400 }
      );
    }
    
    if (!size || size <= 0) {
      return NextResponse.json(
        { error: 'Invalid size. Must be a positive number' },
        { status: 400 }
      );
    }
    
    const config: BotConfig = {
      apiKey: body.apiKey,
      apiSecret: body.apiSecret,
      apiPassphrase: body.apiPassphrase,
      privateKey: body.privateKey,
      funderAddress: body.funderAddress,
      tokenId: body.tokenId,
      buyThreshold: 0,
      sellThreshold: 1,
      tradeSize: size,
      checkInterval: 60,
    };
    
    if (!config.apiKey || !config.apiSecret || !config.apiPassphrase || !config.privateKey || !config.tokenId) {
      return NextResponse.json(
        { error: 'Missing required credentials' },
        { status: 400 }
      );
    }
    
    const result = await executeTrade(config, side, size);
    
    if (result.success) {
      if (side === 'buy') {
        setPosition(size);
      } else {
        setPosition(0);
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Trade error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Trade failed' },
      { status: 500 }
    );
  }
}
