import { checkAndTrade, getBotState, startBot, BotConfig } from '../src/lib/polymarket-bot';

const BOT_CHECK_INTERVAL = 60000;

let isRunning = false;

async function runBotCheck() {
  const state = getBotState();
  
  if (!state.running) {
    console.log('[Polymarket Bot] Bot is not running, skipping check...');
    return;
  }
  
  console.log('[Polymarket Bot] Checking price and executing trades if needed...');
  
  try {
    const result = await checkAndTrade();
    console.log(`[Polymarket Bot] ${result.message}`);
    
    if (result.executed) {
      console.log(`[Polymarket Bot] Trade executed: ${result.action} at $${result.price.toFixed(4)}`);
    }
  } catch (error) {
    console.error('[Polymarket Bot] Error during check:', error instanceof Error ? error.message : error);
  }
}

async function main() {
  console.log('============================================================');
  console.log('Polymarket Trading Bot - Background Scheduler');
  console.log('Check interval:', BOT_CHECK_INTERVAL / 1000, 'seconds');
  console.log('============================================================');
  console.log('');
  console.log('This scheduler will check prices and execute trades');
  console.log('when the bot is started via the dashboard.');
  console.log('');
  console.log('To start the bot, configure it at /polymarket-bot');
  console.log('============================================================');
  
  isRunning = true;
  
  while (isRunning) {
    await runBotCheck();
    
    const state = getBotState();
    const interval = state.config?.checkInterval ? state.config.checkInterval * 1000 : BOT_CHECK_INTERVAL;
    
    console.log(`[Polymarket Bot] Next check in ${interval / 1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

process.on('SIGINT', () => {
  console.log('[Polymarket Bot] Shutting down...');
  isRunning = false;
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[Polymarket Bot] Shutting down...');
  isRunning = false;
  process.exit(0);
});

main().catch(console.error);
