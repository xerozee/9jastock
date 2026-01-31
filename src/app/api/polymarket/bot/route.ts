import { NextRequest, NextResponse } from 'next/server';
import { 
  startBot, 
  stopBot, 
  getBotState, 
  checkAndTrade,
  BotConfig,
  setPosition,
  clearHistory
} from '@/lib/polymarket-bot';

export async function GET() {
  try {
    const state = getBotState();
    return NextResponse.json(state);
  } catch (error) {
    console.error('Bot status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get bot status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'start': {
        const config: BotConfig = {
          apiKey: body.apiKey,
          apiSecret: body.apiSecret,
          apiPassphrase: body.apiPassphrase,
          privateKey: body.privateKey,
          funderAddress: body.funderAddress,
          tokenId: body.tokenId,
          buyThreshold: body.buyThreshold,
          sellThreshold: body.sellThreshold,
          tradeSize: body.tradeSize,
          checkInterval: body.checkInterval || 60,
        };
        
        const result = startBot(config);
        const state = getBotState();
        return NextResponse.json({ ...result, state });
      }
      
      case 'stop': {
        const result = stopBot();
        const state = getBotState();
        return NextResponse.json({ ...result, state });
      }
      
      case 'check': {
        const result = await checkAndTrade();
        const state = getBotState();
        return NextResponse.json({ ...result, state });
      }
      
      case 'setPosition': {
        const position = body.position;
        if (typeof position !== 'number' || position < 0) {
          return NextResponse.json(
            { error: 'Invalid position value' },
            { status: 400 }
          );
        }
        setPosition(position);
        const state = getBotState();
        return NextResponse.json({ success: true, message: `Position set to ${position}`, state });
      }
      
      case 'clearHistory': {
        clearHistory();
        const state = getBotState();
        return NextResponse.json({ success: true, message: 'History cleared', state });
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, check, setPosition, clearHistory' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Bot action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bot action failed' },
      { status: 500 }
    );
  }
}
