import OpenAI from 'openai';
import { connectToDatabase, FinancialReport, CompanyFinancialData } from './mongodb';

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

// Fetch financial report data for enhanced recommendations
async function getFinancialDataForSymbols(symbols: string[]): Promise<Map<string, any>> {
  try {
    await connectToDatabase();

    const reports = await FinancialReport.find({
      symbol: { $in: symbols.map(s => s.replace('NGX:', '').toUpperCase()) },
    })
      .sort({ year: -1 })
      .lean();

    const companyData = await CompanyFinancialData.find({
      symbol: { $in: symbols.map(s => s.replace('NGX:', '').toUpperCase()) },
    }).lean();

    const dataMap = new Map<string, any>();

    // Group reports by symbol
    for (const report of reports) {
      const symbol = report.symbol;
      if (!dataMap.has(symbol)) {
        dataMap.set(symbol, { reports: [], companyInfo: null });
      }
      dataMap.get(symbol).reports.push(report);
    }

    // Add company info
    for (const company of companyData) {
      if (dataMap.has(company.symbol)) {
        dataMap.get(company.symbol).companyInfo = company;
      } else {
        dataMap.set(company.symbol, { reports: [], companyInfo: company });
      }
    }

    return dataMap;
  } catch (error) {
    console.error('Error fetching financial data:', error);
    return new Map();
  }
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
  userProfile: UserProfile
): Promise<AIRecommendation[]> {
  const openai = getOpenAIClient();

  const topStocks = stocks
    .filter(s => s.marketCap && s.volume)
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 30);

  // Fetch financial report data for enhanced recommendations
  const symbols = topStocks.map(s => s.symbol);
  const financialData = await getFinancialDataForSymbols(symbols);

  const stocksSummary = topStocks.map(s => {
    const cleanSymbol = s.symbol.replace('NGX:', '').toUpperCase();
    const finData = financialData.get(cleanSymbol);
    const latestReport = finData?.reports?.[0];
    const highlights = latestReport?.highlights;

    return {
      symbol: s.symbol,
      name: s.name,
      price: s.price,
      change: s.changePercent?.toFixed(2) + '%',
      sector: s.sector || 'Unknown',
      pe: s.peRatio?.toFixed(2) || 'N/A',
      dividend: s.dividendYield?.toFixed(2) + '%' || 'N/A',
      marketCap: s.marketCap ? (s.marketCap / 1e9).toFixed(2) + 'B' : 'N/A',
      rsi: s.rsi?.toFixed(0) || 'N/A',
      // Enhanced with African Financials data
      ...(highlights && {
        latestFinancials: {
          year: latestReport?.year,
          reportType: latestReport?.reportType,
          revenue: highlights.revenue ? (highlights.revenue / 1e9).toFixed(2) + 'B' : undefined,
          profit: highlights.profit ? (highlights.profit / 1e9).toFixed(2) + 'B' : undefined,
          grossEarnings: highlights.grossEarnings ? (highlights.grossEarnings / 1e9).toFixed(2) + 'B' : undefined,
          eps: highlights.eps,
          dividendPerShare: highlights.dividendPerShare,
          totalAssets: highlights.totalAssets ? (highlights.totalAssets / 1e12).toFixed(2) + 'T' : undefined,
        },
      }),
      reportsAvailable: finData?.reports?.length || 0,
    };
  });

  const hasFinancialData = stocksSummary.some(s => s.reportsAvailable > 0);

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

AVAILABLE STOCKS (includes latest financial report data from African Financials where available):
${JSON.stringify(stocksSummary, null, 2)}

${hasFinancialData ? `
FINANCIAL DATA CONTEXT:
- Some stocks include "latestFinancials" with actual company earnings data from annual/interim reports
- Use revenue, profit, gross earnings, EPS, and dividend data to inform fundamental analysis
- Prioritize stocks with strong recent financial performance when suitable for the investor profile
- Companies with growing revenue/profit trends are generally more attractive for growth-oriented investors
- High dividend per share makes stocks attractive for passive-income focused investors
` : ''}

Provide exactly 5 stock recommendations with specific BUY, HOLD, or SELL actions. For each stock:
1. Match to investor's risk tolerance and experience level
2. Align with their investment goals and time horizon
3. Consider Nigerian market-specific factors
4. Analyze fundamentals (P/E ratio, dividend yield, market cap, AND latest financial report data if available)
5. Factor in recent performance, RSI, and momentum

RESPONSE FORMAT (JSON):
{
  "recommendations": [
    {
      "symbol": "SYMBOL (without NGX: prefix)",
      "action": "buy|hold|sell",
      "reason": "2-3 sentence explanation why this action suits this investor",
      "analysis": "Detailed 3-4 sentence market analysis covering fundamentals, technicals, and Nigerian economic factors affecting this stock. Include insights from latest financial reports if available.",
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
