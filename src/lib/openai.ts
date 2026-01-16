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

export interface AIRecommendation {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sector?: string;
  reason: string;
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
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
  userProfile: UserProfile
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

  const prompt = `You are an expert Nigerian stock market analyst. Analyze the following NGX stocks and recommend the top 5 best stocks for this investor.

INVESTOR PROFILE:
- Investment Goal: ${userProfile.investmentGoal || 'Not specified'}
- Experience Level: ${userProfile.experienceLevel || 'Not specified'}
- Risk Tolerance: ${userProfile.riskTolerance || 'Not specified'}
- Investment Horizon: ${userProfile.investmentHorizon || 'Not specified'}
- Interested Sectors: ${userProfile.interestedSectors?.join(', ') || 'Not specified'}

AVAILABLE STOCKS:
${JSON.stringify(stocksSummary, null, 2)}

Provide exactly 5 stock recommendations. For each stock, explain why it matches this investor's profile. Consider:
1. The investor's risk tolerance and experience
2. Their investment goals and time horizon
3. The stock's fundamentals (P/E ratio, dividend yield)
4. Recent performance and momentum
5. Sector preferences

Respond in JSON format:
{
  "recommendations": [
    {
      "symbol": "SYMBOL",
      "reason": "Brief explanation why this stock suits this investor (2-3 sentences)",
      "confidenceScore": 85,
      "riskLevel": "low|medium|high"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_completion_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const parsed = JSON.parse(content);
    const stockMap = new Map(stocks.map(s => [s.symbol, s]));

    return parsed.recommendations.map((rec: any) => {
      const stock = stockMap.get(rec.symbol);
      return {
        symbol: rec.symbol,
        name: stock?.name || rec.symbol,
        price: stock?.price || 0,
        changePercent: stock?.changePercent || 0,
        sector: stock?.sector,
        reason: rec.reason,
        confidenceScore: rec.confidenceScore || 75,
        riskLevel: rec.riskLevel || 'medium',
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
