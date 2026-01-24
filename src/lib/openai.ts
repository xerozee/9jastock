import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || 'dummy',
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return openaiClient;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sector?: string;
  dividendYield?: number;
  peRatio?: number;
  marketCap?: number;
  volume?: number;
  rsi?: number;
  high52Week?: number;
  low52Week?: number;
}

export interface UserProfile {
  investmentGoal?: string;
  experienceLevel?: string;
  riskTolerance?: string;
  investmentHorizon?: string;
  interestedSectors?: string[];
}

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice?: number;
  gainLossPercent?: number;
}

export interface PortfolioData {
  holdings: PortfolioHolding[];
  watchlist: string[];
  totalValue?: number;
  totalCost?: number;
}

export interface AIRecommendation {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sector?: string;
  reason: string;
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  action: 'buy' | 'hold' | 'sell';
  analysis: string;
  targetPrice?: number;
  timeframe?: string;
}

export interface StockAnalysis {
  symbol: string;
  summary: string;
  technicalOutlook: string;
  fundamentalOutlook: string;
  riskAssessment: string;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  targetPrice?: number;
  keyFactors: string[];
}

export async function getAIStockRecommendations(
  stocks: StockData[],
  userProfile: UserProfile,
  portfolioData?: PortfolioData
): Promise<AIRecommendation[]> {
  const openai = getOpenAIClient();
  
  const topStocks = stocks
    .filter(s => s.marketCap && s.volume)
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 30);

  const stocksSummary = topStocks.map(s => ({
    symbol: s.symbol,
    name: s.name,
    price: s.price,
    change: s.changePercent?.toFixed(2) + '%',
    sector: s.sector || 'Unknown',
    pe: s.peRatio?.toFixed(2) || 'N/A',
    dividend: s.dividendYield?.toFixed(2) + '%' || 'N/A',
    marketCap: s.marketCap ? (s.marketCap / 1e9).toFixed(2) + 'B' : 'N/A',
    rsi: s.rsi?.toFixed(0) || 'N/A',
  }));

  // Build portfolio context for personalized recommendations
  let portfolioContext = '';
  if (portfolioData) {
    if (portfolioData.holdings.length > 0) {
      const holdingsSummary = portfolioData.holdings.map(h => ({
        symbol: h.symbol,
        shares: h.shares,
        avgCost: h.purchasePrice.toFixed(2),
        currentValue: h.currentPrice ? (h.shares * h.currentPrice).toFixed(2) : 'N/A',
        gainLoss: h.gainLossPercent ? `${h.gainLossPercent >= 0 ? '+' : ''}${h.gainLossPercent.toFixed(1)}%` : 'N/A',
      }));
      portfolioContext += `
CURRENT PORTFOLIO (${portfolioData.holdings.length} holdings):
${JSON.stringify(holdingsSummary, null, 2)}
${portfolioData.totalValue ? `Total Portfolio Value: ₦${portfolioData.totalValue.toLocaleString()}` : ''}
${portfolioData.totalCost ? `Total Cost Basis: ₦${portfolioData.totalCost.toLocaleString()}` : ''}
`;
    }
    
    if (portfolioData.watchlist.length > 0) {
      portfolioContext += `
WATCHLIST (stocks the investor is interested in):
${portfolioData.watchlist.join(', ')}
`;
    }
  }

  const prompt = `You are an expert Nigerian Stock Exchange (NGX) analyst with deep knowledge of the Nigerian economy, sectors, and market dynamics. Analyze the following NGX stocks and provide personalized recommendations for this investor.

NIGERIAN MARKET CONTEXT:
- Consider Nigeria's economic conditions: inflation, interest rates, forex stability
- Banking, Oil & Gas, Consumer Goods, and Telecom are key sectors on the NGX
- Blue-chip stocks like DANGCEM, GTCO, ZENITH, MTNN offer stability
- Growth stocks in consumer goods and telecoms may offer higher returns
- Dividend-paying stocks are popular for income-focused Nigerian investors

INVESTOR PROFILE:
- Investment Goal: ${userProfile.investmentGoal || 'Not specified'}
- Experience Level: ${userProfile.experienceLevel || 'Not specified'}  
- Risk Tolerance: ${userProfile.riskTolerance || 'Not specified'}
- Investment Horizon: ${userProfile.investmentHorizon || 'Not specified'}
- Interested Sectors: ${userProfile.interestedSectors?.join(', ') || 'Not specified'}
${portfolioContext}
PERSONALIZATION GUIDELINES:
${portfolioData?.holdings.length ? `- Consider the investor's existing holdings when making recommendations
- Suggest diversification if portfolio is concentrated in certain sectors
- For stocks they already own with gains, consider HOLD or partial profit-taking
- For stocks they own with losses, analyze if they should hold for recovery or cut losses
- Prioritize stocks that complement their existing portfolio` : '- New investor with no current holdings'}
${portfolioData?.watchlist.length ? `- Pay special attention to watchlist stocks as they show investor interest
- If a watchlist stock is a good buy, prioritize it in recommendations` : ''}

AVAILABLE STOCKS:
${JSON.stringify(stocksSummary, null, 2)}

Provide exactly 5 stock recommendations with specific BUY, HOLD, or SELL actions. For each stock:
1. Match to investor's risk tolerance and experience level
2. Align with their investment goals and time horizon
3. Consider Nigerian market-specific factors
4. Analyze fundamentals (P/E ratio, dividend yield, market cap)
5. Factor in recent performance, RSI, and momentum
6. Consider their existing portfolio and watchlist for personalization

RESPONSE FORMAT (JSON):
{
  "recommendations": [
    {
      "symbol": "SYMBOL (without NGX: prefix)",
      "action": "buy|hold|sell",
      "reason": "2-3 sentence explanation why this action suits this investor",
      "analysis": "Detailed 3-4 sentence market analysis covering fundamentals, technicals, and Nigerian economic factors affecting this stock",
      "confidenceScore": 75-95,
      "riskLevel": "low|medium|high",
      "targetPrice": 25.50,
      "timeframe": "short-term|medium-term|long-term"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_completion_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const parsed = JSON.parse(content);
    const stockMap = new Map(stocks.map(s => [s.symbol, s]));
    const stockMapNoPrefix = new Map(stocks.map(s => [s.symbol.replace('NGX:', ''), s]));

    return parsed.recommendations.map((rec: any) => {
      const cleanSymbol = rec.symbol.replace('NGX:', '');
      const stock = stockMap.get(rec.symbol) || stockMap.get(`NGX:${cleanSymbol}`) || stockMapNoPrefix.get(cleanSymbol);
      return {
        symbol: cleanSymbol,
        name: stock?.name || cleanSymbol,
        price: stock?.price || 0,
        changePercent: stock?.changePercent || 0,
        sector: stock?.sector,
        reason: rec.reason,
        confidenceScore: rec.confidenceScore || 75,
        riskLevel: rec.riskLevel || 'medium',
        action: rec.action || 'hold',
        analysis: rec.analysis || rec.reason,
        targetPrice: rec.targetPrice,
        timeframe: rec.timeframe || 'medium-term',
      };
    }).filter((rec: AIRecommendation) => rec.price > 0);
  } catch (error) {
    console.error('AI recommendations error:', error);
    throw error;
  }
}

export async function analyzeStock(stock: StockData): Promise<StockAnalysis> {
  const openai = getOpenAIClient();

  const prompt = `You are an expert Nigerian stock market analyst. Provide a comprehensive analysis of this NGX stock.

STOCK DATA:
- Symbol: ${stock.symbol}
- Name: ${stock.name}
- Current Price: ₦${stock.price?.toFixed(2)}
- Daily Change: ${stock.changePercent?.toFixed(2)}%
- Sector: ${stock.sector || 'Unknown'}
- P/E Ratio: ${stock.peRatio?.toFixed(2) || 'N/A'}
- Dividend Yield: ${stock.dividendYield?.toFixed(2)}% 
- Market Cap: ₦${stock.marketCap ? (stock.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
- RSI: ${stock.rsi?.toFixed(0) || 'N/A'}
- 52-Week High: ₦${stock.high52Week?.toFixed(2) || 'N/A'}
- 52-Week Low: ₦${stock.low52Week?.toFixed(2) || 'N/A'}

Provide a detailed analysis in JSON format:
{
  "summary": "2-3 sentence executive summary",
  "technicalOutlook": "Technical analysis based on RSI, price action, trends",
  "fundamentalOutlook": "Fundamental analysis based on P/E, dividends, market cap",
  "riskAssessment": "Key risks to consider",
  "recommendation": "strong_buy|buy|hold|sell|strong_sell",
  "keyFactors": ["factor1", "factor2", "factor3"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_completion_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const parsed = JSON.parse(content);
    return {
      symbol: stock.symbol,
      ...parsed,
    };
  } catch (error) {
    console.error('Stock analysis error:', error);
    throw error;
  }
}
