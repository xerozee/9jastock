declare module '@mathieuc/tradingview' {
  interface ClientOptions {
    token?: string;
    signature?: string;
    sessionId?: string;
  }

  interface MarketData {
    lp?: number; // Last price
    ch?: number; // Change
    chp?: number; // Change percent
    volume?: number;
    open_price?: number;
    high_price?: number;
    low_price?: number;
    prev_close_price?: number;
    [key: string]: number | string | undefined;
  }

  interface Market {
    onData(callback: (data: MarketData) => void): void;
    onError(callback: (error: Error) => void): void;
    onLoaded(callback: () => void): void;
  }

  class Client {
    constructor(options?: ClientOptions);
    getMarket(symbol: string): Market;
    end(): void;
  }

  const TradingView: {
    Client: typeof Client;
  };

  export default TradingView;
}
