export interface YahooFinanceData {
  companyProfile: {
    description: string;
    industry: string;
    sector: string;
    website: string;
    fullTimeEmployees: number | null;
    city: string;
    country: string;
    phone: string;
    address: string;
  };
  analystRatings: {
    targetHighPrice: number | null;
    targetLowPrice: number | null;
    targetMeanPrice: number | null;
    targetMedianPrice: number | null;
    recommendationMean: number | null;
    recommendationKey: string;
    numberOfAnalystOpinions: number;
    totalBuy: number;
    totalHold: number;
    totalSell: number;
  };
  earnings: {
    currentQuarterEstimate: number | null;
    currentQuarterEstimateDate: string;
    currentQuarterEstimateYear: number | null;
    earningsHistory: Array<{
      quarter: string;
      epsActual: number | null;
      epsEstimate: number | null;
      epsDifference: number | null;
      surprisePercent: number | null;
    }>;
    earningsTrend: Array<{
      period: string;
      currentEstimate: number | null;
      lowEstimate: number | null;
      highEstimate: number | null;
      numberOfAnalysts: number;
      growth: number | null;
    }>;
  };
  institutionalHoldings: {
    institutionPercentHeld: number | null;
    insidersPercentHeld: number | null;
    institutionsCount: number;
    institutionsFloatPercentHeld: number | null;
    topHolders: Array<{
      holder: string;
      shares: number;
      dateReported: string;
      percentHeld: number;
      value: number;
    }>;
  };
  financialRatios: {
    priceToBook: number | null;
    priceToSales: number | null;
    enterpriseToRevenue: number | null;
    enterpriseToEbitda: number | null;
    profitMargins: number | null;
    grossMargins: number | null;
    operatingMargins: number | null;
    returnOnAssets: number | null;
    returnOnEquity: number | null;
    revenueGrowth: number | null;
    earningsGrowth: number | null;
    bookValue: number | null;
    priceToEarnings: number | null;
    pegRatio: number | null;
    forwardPE: number | null;
    trailingPE: number | null;
    debtToEquity: number | null;
    currentRatio: number | null;
    quickRatio: number | null;
    payoutRatio: number | null;
    revenuePerShare: number | null;
    totalCashPerShare: number | null;
    freeCashflow: number | null;
    operatingCashflow: number | null;
  };
  keyStats: {
    marketCap: number | null;
    enterpriseValue: number | null;
    floatShares: number | null;
    sharesOutstanding: number | null;
    sharesShort: number | null;
    shortPercentOfFloat: number | null;
    heldPercentInsiders: number | null;
    heldPercentInstitutions: number | null;
    beta: number | null;
    fiftyTwoWeekHigh: number | null;
    fiftyTwoWeekLow: number | null;
    fiftyDayAverage: number | null;
    twoHundredDayAverage: number | null;
    averageVolume: number | null;
    averageVolume10days: number | null;
    lastSplitDate: string | null;
    lastSplitFactor: string | null;
    lastDividendDate: string | null;
    lastDividendValue: number | null;
    exDividendDate: string | null;
  };
  riskMetrics: {
    overallRisk: number | null;
    auditRisk: number | null;
    boardRisk: number | null;
    compensationRisk: number | null;
    shareholderRightsRisk: number | null;
  };
}

const NGX_YAHOO_MAPPING: Record<string, string> = {
  'DANGCEM': 'DANGCEM.LG',
  'GTCO': 'GTCO.LG',
  'ZENITHBANK': 'ZENITHBANK.LG',
  'MTNN': 'MTNN.LG',
  'BUACEMENT': 'BUACEMENT.LG',
  'AIRTELAFRI': 'AIRTELAFRI.LG',
  'SEPLAT': 'SEPLAT.LG',
  'BUAFOODS': 'BUAFOODS.LG',
  'FBNH': 'FBNH.LG',
  'ACCESSCORP': 'ACCESSCORP.LG',
  'NESTLE': 'NESTLE.LG',
  'STANBIC': 'STANBICIBTC.LG',
  'PRESCO': 'PRESCO.LG',
  'OANDO': 'OANDO.LG',
  'TRANSCORP': 'TRANSCORP.LG',
  'ETI': 'ETI.LG',
  'FLOURMILL': 'FLOURMILL.LG',
  'GUINNESS': 'GUINNESS.LG',
  'NB': 'NB.LG',
  'WAPCO': 'WAPCO.LG',
  'TOTAL': 'TOTAL.LG',
  'INTBREW': 'INTBREW.LG',
  'JBERGER': 'JBERGER.LG',
  'CADBURY': 'CADBURY.LG',
  'FIDSON': 'FIDSON.LG',
  'CONOIL': 'CONOIL.LG',
  'UNILEVER': 'UNILEVER.LG',
  'FIDELITYBK': 'FIDELITYBK.LG',
  'UBA': 'UBA.LG',
  'FCMB': 'FCMB.LG',
  'WEMABANK': 'WEMABANK.LG',
  'UNIONBANK': 'UNIONBANK.LG',
  'STERLINGNG': 'STERLINGNG.LG',
  'ETERNA': 'ETERNA.LG',
  'CHAMS': 'CHAMS.LG',
  'DANGSUGAR': 'DANGSUGAR.LG',
  'NASCON': 'NASCON.LG',
  'CHAMPION': 'CHAMPION.LG',
  'GEREGU': 'GEREGU.LG',
  'HONYFLOUR': 'HONYFLOUR.LG',
  'CUSTODIAN': 'CUSTODIAN.LG',
  'CORNERST': 'CORNERST.LG',
  'LASACO': 'LASACO.LG',
  'AIICO': 'AIICO.LG',
  'MANSARD': 'MANSARD.LG',
  'LIVESTOCK': 'LIVESTOCK.LG',
  'OKOMUOIL': 'OKOMUOIL.LG',
  'VITAFOAM': 'VITAFOAM.LG',
  'LEARNAFRCA': 'LEARNAFRICA.LG',
  'CUTIX': 'CUTIX.LG',
  'CHIPLC': 'CHIPLC.LG',
  'ROYALEX': 'ROYALEX.LG',
};

function getYahooSymbol(ngxSymbol: string): string {
  const cleanSymbol = ngxSymbol.replace('NGX:', '').replace('NSENG:', '').toUpperCase();
  return NGX_YAHOO_MAPPING[cleanSymbol] || `${cleanSymbol}.LG`;
}

async function fetchYahooQuoteSummary(symbol: string): Promise<any> {
  const yahooSymbol = getYahooSymbol(symbol);
  const modules = [
    'assetProfile',
    'recommendationTrend',
    'financialData',
    'earnings',
    'earningsTrend',
    'defaultKeyStatistics',
    'institutionOwnership',
    'insiderHolders',
    'summaryDetail',
    'calendarEvents'
  ].join(',');
  
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(yahooSymbol)}?modules=${modules}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      console.log(`Yahoo Finance API returned ${response.status} for ${yahooSymbol}`);
      return null;
    }
    
    const data = await response.json();
    return data?.quoteSummary?.result?.[0] || null;
  } catch (error) {
    console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error);
    return null;
  }
}

function extractValue(obj: any, key: string = 'raw'): any {
  if (!obj) return null;
  if (typeof obj === 'object' && key in obj) return obj[key];
  return obj;
}

export async function getYahooFinanceData(symbol: string): Promise<YahooFinanceData | null> {
  const quoteSummary = await fetchYahooQuoteSummary(symbol);
  
  if (!quoteSummary) {
    return generateEnhancedLocalData(symbol);
  }
  
  const profile = quoteSummary.assetProfile || {};
  const financial = quoteSummary.financialData || {};
  const keyStats = quoteSummary.defaultKeyStatistics || {};
  const earnings = quoteSummary.earnings || {};
  const earningsTrend = quoteSummary.earningsTrend || {};
  const recommendation = quoteSummary.recommendationTrend || {};
  const institutions = quoteSummary.institutionOwnership || {};
  const summaryDetail = quoteSummary.summaryDetail || {};
  const calendar = quoteSummary.calendarEvents || {};
  
  const recTrend = recommendation.trend?.[0] || {};
  
  const earningsHistory = (earnings.earningsChart?.quarterly || []).map((q: any) => ({
    quarter: q.date || '',
    epsActual: extractValue(q.actual),
    epsEstimate: extractValue(q.estimate),
    epsDifference: null,
    surprisePercent: null,
  }));
  
  const earningsTrendData = (earningsTrend.trend || []).map((t: any) => ({
    period: t.period || '',
    currentEstimate: extractValue(t.earningsEstimate?.avg),
    lowEstimate: extractValue(t.earningsEstimate?.low),
    highEstimate: extractValue(t.earningsEstimate?.high),
    numberOfAnalysts: extractValue(t.earningsEstimate?.numberOfAnalysts) || 0,
    growth: extractValue(t.earningsEstimate?.growth),
  }));
  
  const topHolders = (institutions.ownershipList || []).slice(0, 10).map((h: any) => ({
    holder: h.organization || 'Unknown',
    shares: extractValue(h.position) || 0,
    dateReported: h.reportDate?.fmt || '',
    percentHeld: extractValue(h.pctHeld) || 0,
    value: extractValue(h.value) || 0,
  }));
  
  return {
    companyProfile: {
      description: profile.longBusinessSummary || '',
      industry: profile.industry || '',
      sector: profile.sector || '',
      website: profile.website || '',
      fullTimeEmployees: profile.fullTimeEmployees || null,
      city: profile.city || '',
      country: profile.country || 'Nigeria',
      phone: profile.phone || '',
      address: profile.address1 || '',
    },
    analystRatings: {
      targetHighPrice: extractValue(financial.targetHighPrice),
      targetLowPrice: extractValue(financial.targetLowPrice),
      targetMeanPrice: extractValue(financial.targetMeanPrice),
      targetMedianPrice: extractValue(financial.targetMedianPrice),
      recommendationMean: extractValue(financial.recommendationMean),
      recommendationKey: financial.recommendationKey || '',
      numberOfAnalystOpinions: extractValue(financial.numberOfAnalystOpinions) || 0,
      totalBuy: (recTrend.strongBuy || 0) + (recTrend.buy || 0),
      totalHold: recTrend.hold || 0,
      totalSell: (recTrend.sell || 0) + (recTrend.strongSell || 0),
    },
    earnings: {
      currentQuarterEstimate: extractValue(earnings.earningsChart?.currentQuarterEstimate),
      currentQuarterEstimateDate: earnings.earningsChart?.currentQuarterEstimateDate || '',
      currentQuarterEstimateYear: earnings.earningsChart?.currentQuarterEstimateYear || null,
      earningsHistory,
      earningsTrend: earningsTrendData,
    },
    institutionalHoldings: {
      institutionPercentHeld: extractValue(keyStats.heldPercentInstitutions),
      insidersPercentHeld: extractValue(keyStats.heldPercentInsiders),
      institutionsCount: institutions.ownershipList?.length || 0,
      institutionsFloatPercentHeld: extractValue(keyStats.heldPercentInstitutions),
      topHolders,
    },
    financialRatios: {
      priceToBook: extractValue(keyStats.priceToBook),
      priceToSales: extractValue(summaryDetail.priceToSalesTrailing12Months),
      enterpriseToRevenue: extractValue(keyStats.enterpriseToRevenue),
      enterpriseToEbitda: extractValue(keyStats.enterpriseToEbitda),
      profitMargins: extractValue(financial.profitMargins),
      grossMargins: extractValue(financial.grossMargins),
      operatingMargins: extractValue(financial.operatingMargins),
      returnOnAssets: extractValue(financial.returnOnAssets),
      returnOnEquity: extractValue(financial.returnOnEquity),
      revenueGrowth: extractValue(financial.revenueGrowth),
      earningsGrowth: extractValue(financial.earningsGrowth),
      bookValue: extractValue(keyStats.bookValue),
      priceToEarnings: extractValue(summaryDetail.trailingPE),
      pegRatio: extractValue(keyStats.pegRatio),
      forwardPE: extractValue(keyStats.forwardPE),
      trailingPE: extractValue(summaryDetail.trailingPE),
      debtToEquity: extractValue(financial.debtToEquity),
      currentRatio: extractValue(financial.currentRatio),
      quickRatio: extractValue(financial.quickRatio),
      payoutRatio: extractValue(summaryDetail.payoutRatio),
      revenuePerShare: extractValue(financial.revenuePerShare),
      totalCashPerShare: extractValue(financial.totalCashPerShare),
      freeCashflow: extractValue(financial.freeCashflow),
      operatingCashflow: extractValue(financial.operatingCashflow),
    },
    keyStats: {
      marketCap: extractValue(summaryDetail.marketCap),
      enterpriseValue: extractValue(keyStats.enterpriseValue),
      floatShares: extractValue(keyStats.floatShares),
      sharesOutstanding: extractValue(keyStats.sharesOutstanding),
      sharesShort: extractValue(keyStats.sharesShort),
      shortPercentOfFloat: extractValue(keyStats.shortPercentOfFloat),
      heldPercentInsiders: extractValue(keyStats.heldPercentInsiders),
      heldPercentInstitutions: extractValue(keyStats.heldPercentInstitutions),
      beta: extractValue(keyStats.beta),
      fiftyTwoWeekHigh: extractValue(summaryDetail.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: extractValue(summaryDetail.fiftyTwoWeekLow),
      fiftyDayAverage: extractValue(summaryDetail.fiftyDayAverage),
      twoHundredDayAverage: extractValue(summaryDetail.twoHundredDayAverage),
      averageVolume: extractValue(summaryDetail.averageVolume),
      averageVolume10days: extractValue(summaryDetail.averageVolume10Day),
      lastSplitDate: keyStats.lastSplitDate?.fmt || null,
      lastSplitFactor: keyStats.lastSplitFactor || null,
      lastDividendDate: calendar.dividendDate?.fmt || null,
      lastDividendValue: extractValue(summaryDetail.dividendRate),
      exDividendDate: calendar.exDividendDate?.fmt || null,
    },
    riskMetrics: {
      overallRisk: profile.overallRisk || null,
      auditRisk: profile.auditRisk || null,
      boardRisk: profile.boardRisk || null,
      compensationRisk: profile.compensationRisk || null,
      shareholderRightsRisk: profile.shareholderRightsRisk || null,
    },
  };
}

function generateEnhancedLocalData(symbol: string): YahooFinanceData {
  const cleanSymbol = symbol.replace('NGX:', '').replace('NSENG:', '').toUpperCase();
  
  const companyDescriptions: Record<string, { desc: string; industry: string; sector: string }> = {
    'DANGCEM': { 
      desc: 'Dangote Cement Plc is the largest cement producer in Sub-Saharan Africa, with operations spanning Nigeria, other African countries, and recently expanded capacities. The company is part of the Dangote Industries conglomerate.',
      industry: 'Building Materials',
      sector: 'Industrial Goods'
    },
    'GTCO': { 
      desc: 'Guaranty Trust Holding Company Plc (GTCO) is a leading financial services group in Africa, offering banking, payments, pension fund administration, and other financial services across multiple countries.',
      industry: 'Banks',
      sector: 'Financial Services'
    },
    'ZENITHBANK': { 
      desc: 'Zenith Bank Plc is one of the largest commercial banks in Nigeria, providing a wide range of corporate and retail banking services with significant presence across Africa and internationally.',
      industry: 'Banks',
      sector: 'Financial Services'
    },
    'MTNN': { 
      desc: 'MTN Nigeria Communications Plc is the largest telecommunications company in Nigeria, providing mobile voice, data, digital, and fintech services to millions of subscribers nationwide.',
      industry: 'Telecommunications',
      sector: 'ICT'
    },
    'BUACEMENT': { 
      desc: 'BUA Cement Plc is a major cement manufacturer in Nigeria, operating multiple plants and serving the construction industry with high-quality cement products.',
      industry: 'Building Materials',
      sector: 'Industrial Goods'
    },
    'AIRTELAFRI': { 
      desc: 'Airtel Africa Plc is a leading telecommunications and mobile money services provider operating in 14 countries across Africa, offering 2G, 3G, and 4G services.',
      industry: 'Telecommunications',
      sector: 'ICT'
    },
    'SEPLAT': { 
      desc: 'Seplat Energy Plc is a leading Nigerian independent energy company focused on developing oil and gas assets in Nigeria, with operations in onshore and shallow offshore environments.',
      industry: 'Oil & Gas',
      sector: 'Oil and Gas'
    },
    'BUAFOODS': { 
      desc: 'BUA Foods Plc is a leading food and infrastructure conglomerate in Nigeria, producing sugar, flour, pasta, edible oils, and other consumer food products.',
      industry: 'Food Products',
      sector: 'Consumer Goods'
    },
    'FBNH': { 
      desc: 'FBN Holdings Plc is one of the largest financial services groups in Africa, with subsidiaries in commercial banking, merchant banking, insurance, and asset management.',
      industry: 'Banks',
      sector: 'Financial Services'
    },
    'ACCESSCORP': { 
      desc: 'Access Holdings Plc is a leading African financial services group, operating one of the largest banks in Nigeria by customer base with presence across Africa and international markets.',
      industry: 'Banks',
      sector: 'Financial Services'
    },
    'NESTLE': { 
      desc: 'Nestle Nigeria Plc is a subsidiary of Nestle S.A., manufacturing and marketing food and beverage products including Milo, Maggi, Nescafe, and other popular consumer brands.',
      industry: 'Food Products',
      sector: 'Consumer Goods'
    },
    'NB': { 
      desc: 'Nigerian Breweries Plc is the largest brewing company in Nigeria, producing popular beer and beverage brands including Star, Gulder, Heineken, and Malta.',
      industry: 'Beverages',
      sector: 'Consumer Goods'
    },
    'OANDO': { 
      desc: 'Oando Plc is a leading indigenous energy group with operations spanning upstream exploration and production, midstream, and downstream sectors across Nigeria and Africa.',
      industry: 'Oil & Gas',
      sector: 'Oil and Gas'
    },
    'UBA': { 
      desc: 'United Bank for Africa Plc is a pan-African financial services group operating in 20 African countries and globally, providing retail, commercial, and corporate banking services.',
      industry: 'Banks',
      sector: 'Financial Services'
    },
    'FIDELITYBK': { 
      desc: 'Fidelity Bank Plc is a full-fledged commercial bank offering retail and corporate banking services, known for its digital banking innovations and SME focus.',
      industry: 'Banks',
      sector: 'Financial Services'
    },
  };
  
  const info = companyDescriptions[cleanSymbol] || {
    desc: `${cleanSymbol} is a company listed on the Nigerian Stock Exchange (NGX), contributing to the growth and development of Nigeria's capital market.`,
    industry: 'General',
    sector: 'General'
  };
  
  return {
    companyProfile: {
      description: info.desc,
      industry: info.industry,
      sector: info.sector,
      website: '',
      fullTimeEmployees: null,
      city: 'Lagos',
      country: 'Nigeria',
      phone: '',
      address: '',
    },
    analystRatings: {
      targetHighPrice: null,
      targetLowPrice: null,
      targetMeanPrice: null,
      targetMedianPrice: null,
      recommendationMean: null,
      recommendationKey: '',
      numberOfAnalystOpinions: 0,
      totalBuy: 0,
      totalHold: 0,
      totalSell: 0,
    },
    earnings: {
      currentQuarterEstimate: null,
      currentQuarterEstimateDate: '',
      currentQuarterEstimateYear: null,
      earningsHistory: [],
      earningsTrend: [],
    },
    institutionalHoldings: {
      institutionPercentHeld: null,
      insidersPercentHeld: null,
      institutionsCount: 0,
      institutionsFloatPercentHeld: null,
      topHolders: [],
    },
    financialRatios: {
      priceToBook: null,
      priceToSales: null,
      enterpriseToRevenue: null,
      enterpriseToEbitda: null,
      profitMargins: null,
      grossMargins: null,
      operatingMargins: null,
      returnOnAssets: null,
      returnOnEquity: null,
      revenueGrowth: null,
      earningsGrowth: null,
      bookValue: null,
      priceToEarnings: null,
      pegRatio: null,
      forwardPE: null,
      trailingPE: null,
      debtToEquity: null,
      currentRatio: null,
      quickRatio: null,
      payoutRatio: null,
      revenuePerShare: null,
      totalCashPerShare: null,
      freeCashflow: null,
      operatingCashflow: null,
    },
    keyStats: {
      marketCap: null,
      enterpriseValue: null,
      floatShares: null,
      sharesOutstanding: null,
      sharesShort: null,
      shortPercentOfFloat: null,
      heldPercentInsiders: null,
      heldPercentInstitutions: null,
      beta: null,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
      fiftyDayAverage: null,
      twoHundredDayAverage: null,
      averageVolume: null,
      averageVolume10days: null,
      lastSplitDate: null,
      lastSplitFactor: null,
      lastDividendDate: null,
      lastDividendValue: null,
      exDividendDate: null,
    },
    riskMetrics: {
      overallRisk: null,
      auditRisk: null,
      boardRisk: null,
      compensationRisk: null,
      shareholderRightsRisk: null,
    },
  };
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(2)}%`;
}

export function formatLargeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  if (value >= 1e12) return `₦${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `₦${(value / 1e3).toFixed(2)}K`;
  return `₦${value.toFixed(2)}`;
}
