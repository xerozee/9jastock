import { connectToDatabase, SocialPost, PortfolioItem, Holding } from './mongodb';
import { analyzeSentiment } from './socialCrawler';
import { nigerianStocks } from './stockData';

const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;

const ALL_NGX_SYMBOLS = nigerianStocks.map(stock => stock.symbol);

function get72HoursAgo(): string {
  const date = new Date();
  date.setHours(date.getHours() - 72);
  return date.toISOString();
}

async function getAllUserSymbols(): Promise<string[]> {
  await connectToDatabase();
  
  const [portfolioItems, holdings] = await Promise.all([
    PortfolioItem.find({}).select('symbol').lean(),
    Holding.find({}).select('symbol').lean(),
  ]);
  
  const symbolsSet = new Set<string>();
  
  portfolioItems.forEach((item: any) => {
    if (item.symbol) {
      symbolsSet.add(item.symbol.replace('NGX:', '').toUpperCase());
    }
  });
  
  holdings.forEach((item: any) => {
    if (item.symbol) {
      symbolsSet.add(item.symbol.replace('NGX:', '').toUpperCase());
    }
  });
  
  return Array.from(symbolsSet);
}

const NGX_STOCK_DATABASE: Record<string, { name: string; sector: string; conflicting?: boolean }> = {
  'AIRTELAFRI': { name: 'Airtel Africa Plc', sector: 'Telecom' },
  'MTNN': { name: 'MTN Nigeria Communications PLC', sector: 'Telecom' },
  'ETRANZACT': { name: 'eTranzact International Plc', sector: 'Technology' },
  'CHAMS': { name: 'Chams Holding Company Plc', sector: 'Technology' },
  'CWG': { name: 'CWG Plc', sector: 'Technology' },
  'NSLTECH': { name: 'Secure Electronic Technology Plc', sector: 'Technology' },
  'AFRIPRUD': { name: 'Africa Prudential Plc', sector: 'Technology' },
  'LEGENDINT': { name: 'Legend Internet Plc', sector: 'Technology' },
  'DAARCOMM': { name: 'DAAR Communications Plc', sector: 'Media' },
  'ZENITHBANK': { name: 'Zenith Bank Plc', sector: 'Banking' },
  'GTCO': { name: 'Guaranty Trust Holding Company Plc', sector: 'Banking' },
  'ACCESSCORP': { name: 'Access Holdings Plc', sector: 'Banking' },
  'UBA': { name: 'United Bank for Africa Plc', sector: 'Banking' },
  'FIRSTHOLDCO': { name: 'First HoldCo Plc', sector: 'Banking' },
  'ETI': { name: 'Ecobank Transnational Incorporated', sector: 'Banking', conflicting: true },
  'STANBIC': { name: 'Stanbic IBTC Holdings PLC', sector: 'Banking' },
  'FIDELITYBK': { name: 'Fidelity Bank Plc', sector: 'Banking' },
  'FCMB': { name: 'FCMB Group Plc', sector: 'Banking' },
  'STERLINGNG': { name: 'Sterling Financial Holdings Company Plc', sector: 'Banking' },
  'UNITYBNK': { name: 'Unity Bank Plc', sector: 'Banking' },
  'WEMABANK': { name: 'Wema Bank PLC', sector: 'Banking' },
  'JAIZBANK': { name: 'Jaiz Bank Plc', sector: 'Banking' },
  'ABBEYBDS': { name: 'Abbey Mortgage Bank Plc', sector: 'Banking' },
  'LIVINGTRUST': { name: 'Livingtrust Mortgage Bank PLC', sector: 'Banking' },
  'NPFMCRFBK': { name: 'NPF Microfinance Bank Plc', sector: 'Banking' },
  'ASOSAVINGS': { name: 'ASO Savings and Loans Plc', sector: 'Banking' },
  'INFINITY': { name: 'Infinity Trust Mortgage Bank Plc', sector: 'Banking' },
  'DANGCEM': { name: 'Dangote Cement Plc', sector: 'Cement' },
  'BUACEMENT': { name: 'BUA Cement Plc', sector: 'Cement' },
  'WAPCO': { name: 'Lafarge Africa Plc', sector: 'Cement' },
  'BUAFOODS': { name: 'BUA Foods Plc', sector: 'Consumer Goods' },
  'NESTLE': { name: 'Nestlé Nigeria Plc', sector: 'Consumer Goods', conflicting: true },
  'DANGSUGAR': { name: 'Dangote Sugar Refinery Plc', sector: 'Consumer Goods' },
  'NASCON': { name: 'Nascon Allied Industries Plc', sector: 'Consumer Goods' },
  'CADBURY': { name: 'Cadbury Nigeria Plc', sector: 'Consumer Goods', conflicting: true },
  'PZ': { name: 'PZ Cussons Nigeria Plc', sector: 'Consumer Goods', conflicting: true },
  'UNILEVER': { name: 'Unilever Nigeria Plc', sector: 'Consumer Goods', conflicting: true },
  'HONYFLOUR': { name: 'Honeywell Flour Mills Plc', sector: 'Consumer Goods' },
  'CHAMPION': { name: 'Champion Breweries Plc', sector: 'Breweries' },
  'NB': { name: 'Nigerian Breweries Plc', sector: 'Breweries', conflicting: true },
  'INTBREW': { name: 'International Breweries Plc', sector: 'Breweries' },
  'GUINNESS': { name: 'Guinness Nigeria Plc', sector: 'Breweries', conflicting: true },
  'GOLDBREW': { name: 'Golden Guinea Breweries Plc', sector: 'Breweries' },
  'NNFM': { name: 'Northern Nigeria Flour Mills Plc', sector: 'Consumer Goods' },
  'UNIONDICON': { name: 'Union Dicon Salt Plc', sector: 'Consumer Goods' },
  'MCNICHOLS': { name: 'McNichols PLC', sector: 'Consumer Goods' },
  'MULTITREX': { name: 'Multi-Trex Integrated Foods Plc', sector: 'Consumer Goods' },
  'TANTALIZER': { name: 'Tantalizers PLC', sector: 'Consumer Goods' },
  'SEPLAT': { name: 'Seplat Energy Plc', sector: 'Oil & Gas' },
  'ARADEL': { name: 'Aradel Holdings Plc', sector: 'Oil & Gas' },
  'TOTAL': { name: 'TotalEnergies Marketing Nigeria Plc', sector: 'Oil & Gas', conflicting: true },
  'OANDO': { name: 'Oando PLC', sector: 'Oil & Gas' },
  'CONOIL': { name: 'Conoil Plc', sector: 'Oil & Gas' },
  'ETERNA': { name: 'Eterna Plc', sector: 'Oil & Gas' },
  'EUNISELL': { name: 'Eunisell Interlinked Plc', sector: 'Oil & Gas' },
  'GEREGU': { name: 'Geregu Power Plc', sector: 'Power' },
  'TRANSPOWER': { name: 'Transcorp Power Plc', sector: 'Power' },
  'AIICO': { name: 'AIICO Insurance Plc', sector: 'Insurance' },
  'MANSARD': { name: 'AXA Mansard Insurance Plc', sector: 'Insurance' },
  'NEM': { name: 'NEM Insurance Plc', sector: 'Insurance' },
  'CORNERST': { name: 'Cornerstone Insurance Plc', sector: 'Insurance' },
  'LASACO': { name: 'LASACO Assurance Plc', sector: 'Insurance' },
  'WAPIC': { name: 'Coronation Insurance Plc', sector: 'Insurance' },
  'LINKASSURE': { name: 'Linkage Assurance Plc', sector: 'Insurance' },
  'REGALINS': { name: 'Regency Alliance Insurance Plc', sector: 'Insurance' },
  'VERITASKAP': { name: 'Veritas Kapital Assurance Plc', sector: 'Insurance' },
  'CAP': { name: 'Chemical and Allied Products Plc', sector: 'Industrial', conflicting: true },
  'MBENEFIT': { name: 'Mutual Benefits Assurance Plc', sector: 'Insurance' },
  'SOVRENINS': { name: 'Sovereign Trust Insurance Plc', sector: 'Insurance' },
  'CONHALLPLC': { name: 'Consolidated Hallmark Holdings Plc', sector: 'Insurance' },
  'SUNUASSUR': { name: 'Sunu Assurances Nigeria Plc', sector: 'Insurance' },
  'PRESTIGE': { name: 'Prestige Assurance Company Plc', sector: 'Insurance' },
  'UNIVINSURE': { name: 'Universal Insurance Plc', sector: 'Insurance' },
  'GUINEAINS': { name: 'Guinea Insurance Plc', sector: 'Insurance' },
  'STACO': { name: 'STACO Insurance Plc', sector: 'Insurance' },
  'AFRINSURE': { name: 'African Alliance Insurance Plc', sector: 'Insurance' },
  'INTENEGINS': { name: 'International Energy Insurance Plc', sector: 'Insurance' },
  'FTGINSURE': { name: 'Fortis Global Insurance Plc', sector: 'Insurance' },
  'CUSTODIAN': { name: 'Custodian Investment Plc', sector: 'Insurance' },
  'ROYALEX': { name: 'Royal Exchange Plc', sector: 'Insurance' },
  'TRANSCORP': { name: 'Transnational Corporation of Nigeria Plc', sector: 'Conglomerate' },
  'TRANSCOHOT': { name: 'Transcorp Hotels Plc', sector: 'Hospitality' },
  'UACN': { name: 'UAC of Nigeria PLC', sector: 'Conglomerate' },
  'UPDC': { name: 'UPDC Plc', sector: 'Real Estate' },
  'UPDCREIT': { name: 'UPDC Real Estate Investment Trust', sector: 'Real Estate' },
  'SFSREIT': { name: 'SFS Real Estate Investment Trust Fund', sector: 'Real Estate' },
  'UHOMREIT': { name: 'UH Real Estate Investment Trust', sector: 'Real Estate' },
  'PRESCO': { name: 'Presco Plc', sector: 'Agriculture' },
  'OKOMUOIL': { name: 'The Okomu Oil Palm Company Plc', sector: 'Agriculture' },
  'ELLAHLAKES': { name: 'Ellah Lakes Plc', sector: 'Agriculture' },
  'FTNCOCOA': { name: 'FTN Cocoa Processors Plc', sector: 'Agriculture' },
  'LIVESTOCK': { name: 'Livestock Feeds Plc', sector: 'Agriculture' },
  'JBERGER': { name: 'Julius Berger Nigeria Plc', sector: 'Construction' },
  'NAHCO': { name: 'Nigerian Aviation Handling Company Plc', sector: 'Aviation' },
  'SKYAVN': { name: 'Skyway Aviation Handling Company Plc', sector: 'Aviation' },
  'CAVERTON': { name: 'Caverton Offshore Support Group Plc', sector: 'Aviation' },
  'ABCTRANS': { name: 'ABC Transport Plc', sector: 'Transport' },
  'REDSTAREX': { name: 'Red Star Express Plc', sector: 'Logistics' },
  'TRANSEXPR': { name: 'Trans-Nationwide Express Plc', sector: 'Logistics' },
  'CILEASING': { name: 'C & I Leasing Plc', sector: 'Industrial' },
  'VITAFOAM': { name: 'Vitafoam Nigeria Plc', sector: 'Industrial' },
  'BETAGLAS': { name: 'Beta Glass Plc', sector: 'Industrial' },
  'BERGER': { name: 'Berger Paints Nigeria Plc', sector: 'Industrial' },
  'CUTIX': { name: 'Cutix Plc', sector: 'Industrial' },
  'IMG': { name: 'Industrial and Medical Gases Nigeria Plc', sector: 'Industrial', conflicting: true },
  'ENAMELWA': { name: 'Nigerian Enamelware PLC', sector: 'Industrial' },
  'ALEX': { name: 'Aluminium Extrusion Industries Plc', sector: 'Industrial' },
  'PREMPAINTS': { name: 'Premier Paints Plc', sector: 'Industrial' },
  'VANLEER': { name: 'Greif Nigeria Plc', sector: 'Industrial' },
  'MEYER': { name: 'Meyer Plc', sector: 'Industrial' },
  'DUNLOP': { name: 'DN Tyre & Rubber Plc', sector: 'Industrial' },
  'FIDSON': { name: 'Fidson Healthcare Plc', sector: 'Healthcare' },
  'MAYBAKER': { name: 'May & Baker Nigeria plc', sector: 'Healthcare' },
  'NEIMETH': { name: 'Neimeth International Pharmaceuticals Plc', sector: 'Healthcare' },
  'PHARMDEKO': { name: 'Pharma Deko Plc', sector: 'Healthcare' },
  'MORISON': { name: 'Morison Industries Plc', sector: 'Healthcare' },
  'EKOCORP': { name: 'Ekocorp Plc', sector: 'Healthcare' },
  'NGXGROUP': { name: 'The Nigerian Exchange Group Plc', sector: 'Financial Services' },
  'UCAP': { name: 'United Capital Plc', sector: 'Financial Services' },
  'VFDGROUP': { name: 'VFD Group PLC', sector: 'Financial Services' },
  'DEAPCAP': { name: 'DEAP Capital Management & Trust Plc', sector: 'Financial Services' },
  'MECURE': { name: 'Mecure Industries PLC', sector: 'Industrial' },
  'IKEJAHOTEL': { name: 'Ikeja Hotel Plc', sector: 'Hospitality' },
  'CHELLARAM': { name: 'Chellarams Plc', sector: 'Conglomerate' },
  'SCOA': { name: 'SCOA Nigeria Plc', sector: 'Conglomerate' },
  'RTBRISCOE': { name: 'R.T Briscoe (Nigeria) Plc', sector: 'Conglomerate' },
  'JOHNHOLT': { name: 'John Holt Plc', sector: 'Conglomerate' },
  'JAPAULGOLD': { name: 'Japaul Gold & Ventures Plc', sector: 'Mining' },
  'MULTIVERSE': { name: 'Multiverse Mining and Exploration Plc', sector: 'Mining' },
  'RONCHESS': { name: 'Ronchess Global Resources PLC', sector: 'Other' },
  'HMCALL': { name: 'Haldane Mccall Plc', sector: 'Other' },
  'TIP': { name: 'The Initiates Plc', sector: 'Other', conflicting: true },
  'AUSTINLAZ': { name: 'Austin Laz & Company Plc', sector: 'Industrial' },
  'TRIPPLEG': { name: 'Tripple Gee & Company Plc', sector: 'Industrial' },
  'OMATEK': { name: 'Omatek Ventures Plc', sector: 'Technology' },
  'THOMASWY': { name: 'Thomas Wyatt Nigeria Plc', sector: 'Other' },
  'ACADEMY': { name: 'Academy Press Plc', sector: 'Publishing' },
  'LEARNAFRCA': { name: 'Learn Africa Plc', sector: 'Publishing' },
  'UPL': { name: 'University Press Plc', sector: 'Publishing', conflicting: true },
  'AFROMEDIA': { name: 'Afromedia Plc', sector: 'Media' },
  'NCR': { name: 'NCR (Nigeria) Plc', sector: 'Technology', conflicting: true },
  'BAPLC': { name: 'Briclinks Africa Plc', sector: 'Other' },
  'JULI': { name: 'Juli plc', sector: 'Other' },
};

const CONFLICTING_TICKERS = ['NB', 'PZ', 'CAP', 'NESTLE', 'UNILEVER', 'TOTAL', 'CADBURY', 'GUINNESS', 'NCR', 'UPL', 'ETI', 'IMG', 'TIP'];

const NGX_SEARCH_QUERIES = {
  general: '(#NGX OR #NGXASI OR #NigerianStockMarket OR #NaijaStocks OR "Nigerian Exchange" OR "NGX All Share Index" OR "NGX equities" OR "NGX trading" OR "NGX investors")',
  newsSources: 'from:ngxgrp OR from:Nairametrics OR from:ProshareNG OR from:BusinessDayNG OR from:ngnmarket OR from:AlomolaNG OR from:CardinalStonNG OR from:vetaborker OR from:InvestorNgr OR from:TheNigerianInv OR from:SecaborNGX OR from:APaborker',
  banking: '($ZENITHBANK OR "Zenith Bank") OR ($GTCO OR "Guaranty Trust") OR ($ACCESSCORP OR "Access Holdings") OR ($UBA OR "United Bank for Africa") OR ($FIRSTHOLDCO OR "First HoldCo") OR ($ETI OR "Ecobank Transnational") OR ($STANBIC OR "Stanbic IBTC") OR ($FIDELITYBK OR "Fidelity Bank") OR ($FCMB OR "FCMB Group") OR ($STERLINGNG OR "Sterling Financial") OR ($WEMABANK OR "Wema Bank") OR ($JAIZBANK OR "Jaiz Bank")',
  telecomBigCaps: '($AIRTELAFRI OR "Airtel Africa") OR ($MTNN OR "MTN Nigeria") OR ($DANGCEM OR "Dangote Cement") OR ($BUACEMENT OR "BUA Cement") OR ($BUAFOODS OR "BUA Foods") OR ($SEPLAT OR "Seplat Energy") OR ($ARADEL OR "Aradel Holdings") OR ($GEREGU OR "Geregu Power") OR ($TRANSPOWER OR "Transcorp Power")',
  consumerGoods: '("Nigerian Breweries" OR $NB) OR ($INTBREW OR "International Breweries") OR ($GUINNESS OR "Guinness Nigeria") OR ("Nestle Nigeria" OR NESTLE) OR ($DANGSUGAR OR "Dangote Sugar") OR ($NASCON OR "Nascon Allied") OR ("Cadbury Nigeria" OR $CADBURY) OR ($HONYFLOUR OR "Honeywell Flour") OR ("Unilever Nigeria" OR $UNILEVER) OR ("PZ Cussons Nigeria")',
  oilGasIndustrial: '($SEPLAT OR "Seplat Energy") OR ("TotalEnergies Marketing Nigeria") OR ($OANDO OR "Oando Plc") OR ($CONOIL OR "Conoil Plc") OR ($JBERGER OR "Julius Berger") OR ($NAHCO OR "Nigerian Aviation Handling") OR ($VITAFOAM OR "Vitafoam Nigeria") OR ($BETAGLAS OR "Beta Glass")',
  insurance: '($AIICO OR "AIICO Insurance") OR ($MANSARD OR "AXA Mansard") OR ($NEM OR "NEM Insurance") OR ($CORNERST OR "Cornerstone Insurance") OR ($LASACO OR "LASACO Assurance") OR ($WAPIC OR "Coronation Insurance") OR ($CUSTODIAN OR "Custodian Investment") OR ($LINKASSURE OR "Linkage Assurance")',
  agriRealEstate: '($PRESCO OR "Presco Plc") OR ($OKOMUOIL OR "Okomu Oil Palm") OR ($TRANSCORP OR "Transnational Corporation") OR ($TRANSCOHOT OR "Transcorp Hotels") OR ($UACN OR "UAC of Nigeria") OR ($NGXGROUP OR "Nigerian Exchange Group") OR ($UCAP OR "United Capital") OR ($FIDSON OR "Fidson Healthcare")',
};

function getStockSearchTerm(symbol: string): string {
  const stock = NGX_STOCK_DATABASE[symbol];
  if (!stock) return symbol;
  if (stock.conflicting) {
    return `"${stock.name.replace(/ Plc$/i, '').replace(/ PLC$/i, '')}"`;
  }
  const shortName = stock.name.replace(/ Plc$/i, '').replace(/ PLC$/i, '');
  return `($${symbol} OR "${shortName}")`;
}

const STOCK_NAME_MAP: Record<string, string[]> = {};
const STOCK_FULL_NAME_MAP: Record<string, string> = {};

nigerianStocks.forEach(stock => {
  const names: string[] = [stock.name, stock.symbol];
  const words = stock.name.split(' ');
  if (words.length > 1 && words[0].length > 2) {
    names.push(words[0]);
  }
  const dbStock = NGX_STOCK_DATABASE[stock.symbol];
  if (dbStock) {
    names.push(dbStock.name);
  }
  STOCK_NAME_MAP[stock.symbol] = [...new Set(names)];
  STOCK_FULL_NAME_MAP[stock.symbol] = stock.name;
});

function getSearchNameForSymbol(symbol: string): string {
  const stock = NGX_STOCK_DATABASE[symbol];
  if (stock) {
    return stock.name.replace(/ Plc$/i, '').replace(/ PLC$/i, '').replace(/ Ltd$/i, '').replace(/ Holdings$/i, '');
  }
  const fullName = STOCK_FULL_NAME_MAP[symbol];
  if (fullName) {
    const cleanName = fullName.replace(/ Plc$/i, '').replace(/ Ltd$/i, '').replace(/ Holdings$/i, '');
    return cleanName;
  }
  return symbol;
}

const NIGERIAN_STOCK_ACCOUNTS = [
  'ngxgrp', 'Nairametrics', 'ProshareNG', 'BusinessDayNG', 'ThisDayBusiness',
  'ngnmarket', 'FinancialDeriv', 'ARMEngage', 'MeristemWealth', 'CSLStockbrokers',
  'ChapelHillDenham', 'InvestDataLtd', 'Afrinvest', 'CardinalStone', 'UnitedCapitalPlc',
  'CoronationNig', 'Vetiva', 'FBNQuest', 'StanbicIBTC', 'FCMBGroup', 'ARMHoldings'
];

const NIGERIAN_MARKET_HASHTAGS = [
  '#NigerianStockMarket', '#NaijaStocks', '#NGX', '#NGXDaily', '#NGXASI',
  '#StockMarketNigeria', '#NaijaInvestments', '#NaijaFinance', '#NaijaEconomy',
  '#NaijaBusiness', '#InvestInNigeria', '#NigeriaEconomy', '#NigeriaFinance',
  '#NigeriaBusiness', '#AfricaMarkets'
];

const NIGERIAN_MARKET_TERMS = [
  '"Nigerian Exchange"', '"NGX All Share Index"', '"NGX market"', '"NGX trading floor"',
  '"Nigerian stocks"', '"Nigeria equities"', '"Nigerian shares"', '"NGX investors"',
  '"NGX traders"', '"NGX bulls"', '"NGX bears"'
];

const MARKET_ACTION_KEYWORDS = [
  'earnings', 'results', 'dividend', 'bonus', 'rights', 'merger', 'acquisition',
  'takeover', 'restructuring', 'listing', 'profit', 'loss', 'rally', 'breakout',
  'selloff', 'correction'
];

const FINANCE_KEYWORDS = [
  'stock', 'stocks', 'share', 'shares', 'invest', 'investor', 'investing', 'investment',
  'dividend', 'dividends', 'earnings', 'profit', 'loss', 'revenue', 'market', 'trading',
  'trade', 'trader', 'buy', 'sell', 'bullish', 'bearish', 'portfolio', 'equity', 'equities',
  'ngx', 'nse', 'ipo', 'rights issue', 'bonus issue', 'agm', 'eps', 'p/e', 'pe ratio',
  'market cap', 'valuation', 'price target', 'analyst', 'rating', 'upgrade', 'downgrade',
  'accumulate', 'hold', 'outperform', 'underperform', 'quarter', 'quarterly', 'annual',
  'financial', 'finance', 'fiscal', 'roi', 'yield', 'growth', 'recession', 'rally',
  'breakout', 'selloff', 'correction', 'volatility', 'volume', 'capitalization', 'naira',
  '₦', 'ngn', 'stock exchange', 'exchange', 'broker', 'brokerage', 'sec', 'regulator'
];

const COMPANY_OFFICIAL_ACCOUNTS: Record<string, string[]> = {
  'DANGCEM': ['danglobal', 'dangotecement', 'dangotegroup'],
  'MTNN': ['maborokekola', 'maboroke', 'mtloopng', 'mtlooperng', 'mtnnigeria', 'maborokeola'],
  'AIRTELAFRI': ['airtelafrica', 'aaborokeiri', 'airtelng', 'airnelng', 'airtelin'],
  'ZENITHBANK': ['zenithbank', 'zenith_bank', 'zenithbankng'],
  'GTCO': ['gtaborokeban', 'gtcoplc', 'gtbank', 'guarantytrust'],
  'ACCESSCORP': ['myaccessbank', 'accessbankplc', 'access_bankplc'],
  'UBA': ['ubaigroup', 'ubag7i3roup', 'ubagroupplc'],
  'FIRSTHOLDCO': ['firstbnkg7i3ia', 'firstbankng', 'firstbanknigeria'],
  'BUACEMENT': ['buacement', 'bua_cement'],
  'BUAFOODS': ['buafoods', 'bua_foods'],
  'SEPLAT': ['seplatey', 'seplatgy', 'seplatm', 'seplategygy', 'seplateygy', 'seplatenergy'],
  'NESTLE': ['nestle', 'nestleng', 'nestlenigeria'],
  'GUINNESS': ['guinness', 'guinessng', 'guinnessnigeria'],
  'NB': ['nigerianbreweries', 'nbplc', 'nigerianbreweria'],
  'CADBURY': ['cadburyng', 'cadburynigeria'],
  'UNILEVER': ['unileverng', 'unilevernigeria'],
  'TOTAL': ['totalenergiesng', 'totalenergies', 'totalng'],
  'OANDO': ['oandoplc', 'oando_plc'],
  'STANBIC': ['stabicibtc', 'stanbic_ibtc', 'stanbicibtc'],
  'FIDELITYBK': ['fidelitybankng', 'fidelity_bank'],
  'FCMB': ['myfcmb', 'fcmbng', 'fcmbgroup'],
  'WEMABANK': ['waborokeema', 'wemabankng'],
  'STERLINGNG': ['sterling_bankng', 'sterlingbankng'],
  'PRESCO': ['prescoplc', 'presco_plc'],
  'TRANSCORP': ['transcorpore', 'transcorpore_ng'],
  'FIDSON': ['fidsonhc', 'fidsonhealthcare'],
  'JBERGER': ['juliusbergerng', 'julius_berger'],
};

function isCompanyOfficialAccount(symbol: string, username: string): boolean {
  const lowerUsername = username.toLowerCase();
  const symbolLower = symbol.toLowerCase();
  
  if (lowerUsername.includes(symbolLower) || symbolLower.includes(lowerUsername)) {
    return true;
  }
  
  const officialAccounts = COMPANY_OFFICIAL_ACCOUNTS[symbol];
  if (officialAccounts) {
    return officialAccounts.some(account => lowerUsername.includes(account) || account.includes(lowerUsername));
  }
  
  const stock = NGX_STOCK_DATABASE[symbol];
  if (stock) {
    const companyWords = stock.name.toLowerCase().split(' ').filter(w => w.length > 3);
    for (const word of companyWords) {
      if (word !== 'plc' && word !== 'nigeria' && word !== 'nigerian' && word !== 'limited' && word !== 'holdings') {
        if (lowerUsername.includes(word)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function containsFinanceKeyword(text: string): boolean {
  const lowerText = text.toLowerCase();
  return FINANCE_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

function filterTweetsForRelevance(tweets: XTweet[], symbols: string[]): XTweet[] {
  return tweets.filter(tweet => {
    const user = (tweet as any)._user as XUser | undefined;
    if (!user) return true;
    
    for (const symbol of symbols) {
      if (isCompanyOfficialAccount(symbol, user.username)) {
        return false;
      }
    }
    
    if (!containsFinanceKeyword(tweet.text)) {
      return false;
    }
    
    return true;
  });
}

interface XTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  entities?: {
    cashtags?: { tag: string }[];
    mentions?: { username: string }[];
  };
}

interface XUser {
  id: string;
  name: string;
  username: string;
  verified?: boolean;
  profile_image_url?: string;
}

interface XSearchResponse {
  data?: XTweet[];
  includes?: {
    users?: XUser[];
  };
  meta?: {
    result_count: number;
    next_token?: string;
  };
}

async function fetchFromXApi(endpoint: string): Promise<any> {
  if (!X_BEARER_TOKEN) {
    throw new Error('X_BEARER_TOKEN is not configured');
  }

  const response = await fetch(`https://api.twitter.com/2${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${X_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`X API Error (${response.status}):`, errorText);
    throw new Error(`X API request failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function searchXForStocks(symbols: string[], use72Hours: boolean = true): Promise<XTweet[]> {
  const allTweets: XTweet[] = [];
  const startTime = use72Hours ? `&start_time=${get72HoursAgo()}` : '';
  
  const companyNames = symbols.slice(0, 6).map(s => `"${getSearchNameForSymbol(s)}"`).join(' OR ');
  const nigerianContext = '(Nigeria OR NGX OR #NGX OR #NigerianStockMarket OR #NaijaStocks OR "Nigerian Exchange")';
  const query = `(${companyNames}) ${nigerianContext} lang:en -is:retweet`;
  
  if (query.length <= 512) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=25&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url${startTime}`;
      
      const response: XSearchResponse = await fetchFromXApi(endpoint);
      
      if (response.data) {
        const usersMap = new Map<string, XUser>();
        if (response.includes?.users) {
          response.includes.users.forEach(user => {
            usersMap.set(user.id, user);
          });
        }
        
        for (const tweet of response.data) {
          (tweet as any)._user = usersMap.get(tweet.author_id);
          allTweets.push(tweet);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('X search error for company names:', error);
    }
  }

  return filterTweetsForRelevance(allTweets, symbols);
}

export async function searchNigerianMarketBuzz(use72Hours: boolean = true): Promise<XTweet[]> {
  const allTweets: XTweet[] = [];
  const startTime = use72Hours ? `&start_time=${get72HoursAgo()}` : '';
  
  const allCompanyNames = ALL_NGX_SYMBOLS.map(s => getSearchNameForSymbol(s));
  const topCompanyNames = allCompanyNames.slice(0, 10).map(n => `"${n}"`).join(' OR ');
  
  const nigerianContext = '(Nigeria OR NGX OR #NGX OR #NigerianStockMarket OR #NaijaStocks)';
  const companyQuery = `(${topCompanyNames}) ${nigerianContext} lang:en -is:retweet`;
  
  try {
    const encodedQuery = encodeURIComponent(companyQuery);
    const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=30&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url${startTime}`;
    
    const response: XSearchResponse = await fetchFromXApi(endpoint);
    
    if (response.data) {
      const usersMap = new Map<string, XUser>();
      if (response.includes?.users) {
        response.includes.users.forEach(user => {
          usersMap.set(user.id, user);
        });
      }
      
      for (const tweet of response.data) {
        (tweet as any)._user = usersMap.get(tweet.author_id);
        allTweets.push(tweet);
      }
    }
  } catch (error) {
    console.error('X Nigerian market buzz search error:', error);
  }
  
  const trustedSources = NIGERIAN_STOCK_ACCOUNTS.slice(0, 8).map(a => `from:${a}`).join(' OR ');
  const marketHashtags = '#NGX OR #NigerianStockMarket OR #NaijaStocks OR #NGXASI';
  const sourceQuery = `(${trustedSources}) OR (${marketHashtags}) lang:en -is:retweet`;
  
  try {
    const encodedQuery = encodeURIComponent(sourceQuery);
    const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=20&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url${startTime}`;
    
    const response: XSearchResponse = await fetchFromXApi(endpoint);
    
    if (response.data) {
      const usersMap = new Map<string, XUser>();
      if (response.includes?.users) {
        response.includes.users.forEach(user => {
          usersMap.set(user.id, user);
        });
      }
      
      const existingIds = new Set(allTweets.map(t => t.id));
      for (const tweet of response.data) {
        if (!existingIds.has(tweet.id)) {
          (tweet as any)._user = usersMap.get(tweet.author_id);
          allTweets.push(tweet);
        }
      }
    }
  } catch (error) {
    console.error('X trusted sources search error:', error);
  }

  return filterTweetsForRelevance(allTweets, ALL_NGX_SYMBOLS);
}

export async function searchXForWatchlistStocks(watchlistSymbols: string[], use72Hours: boolean = true): Promise<XTweet[]> {
  if (!watchlistSymbols.length) return [];
  
  const allTweets: XTweet[] = [];
  const startTime = use72Hours ? `&start_time=${get72HoursAgo()}` : '';
  
  try {
    const companyNames = watchlistSymbols
      .slice(0, 5)
      .map(s => `"${getSearchNameForSymbol(s)}"`)
      .join(' OR ');
    const nigerianContext = '(Nigeria OR NGX OR #NGX OR #NigerianStockMarket OR #NaijaStocks OR "Nigerian Exchange" OR Naira)';
    const query = `(${companyNames}) ${nigerianContext} lang:en -is:retweet`;
    
    if (query.length <= 512) {
      const encodedQuery = encodeURIComponent(query);
      const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=20&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url${startTime}`;
      
      const response: XSearchResponse = await fetchFromXApi(endpoint);
      
      if (response.data) {
        const usersMap = new Map<string, XUser>();
        if (response.includes?.users) {
          response.includes.users.forEach(user => {
            usersMap.set(user.id, user);
          });
        }
        
        for (const tweet of response.data) {
          (tweet as any)._user = usersMap.get(tweet.author_id);
          allTweets.push(tweet);
        }
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('X watchlist search error:', error);
  }
  
  try {
    const companyNames = watchlistSymbols
      .slice(0, 4)
      .map(s => getSearchNameForSymbol(s))
      .join(' OR ');
    
    const trustedSources = 'from:ngxgrp OR from:Nairametrics OR from:ProshareNG OR from:BusinessDayNG';
    const financeQuery = `(${trustedSources}) (${companyNames}) -is:retweet`;
    const encodedQuery = encodeURIComponent(financeQuery);
    const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=15&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url${startTime}`;
    
    const response: XSearchResponse = await fetchFromXApi(endpoint);
    
    if (response.data) {
      const usersMap = new Map<string, XUser>();
      if (response.includes?.users) {
        response.includes.users.forEach(user => {
          usersMap.set(user.id, user);
        });
      }
      
      for (const tweet of response.data) {
        (tweet as any)._user = usersMap.get(tweet.author_id);
        allTweets.push(tweet);
      }
    }
  } catch (error) {
    console.error('X finance accounts search error:', error);
  }

  return filterTweetsForRelevance(allTweets, watchlistSymbols);
}

const TOP_NIGERIAN_STOCKS = [
  'GTCO', 'ZENITHBANK', 'ACCESSCORP', 'UBA', 'FIRSTHOLDCO', 'MTNN', 
  'DANGCEM', 'BUACEMENT', 'SEPLAT', 'AIRTELAFRI', 'STANBIC', 
  'NB', 'NESTLE', 'TRANSCORP', 'GEREGU', 'BUAFOODS', 'ARADEL',
  'TRANSPOWER', 'ETI', 'FIDELITYBK', 'OANDO', 'PRESCO', 'NGXGROUP'
];

async function searchWithQuery(query: string, startTime: string, maxResults: number = 30): Promise<XTweet[]> {
  const tweets: XTweet[] = [];
  const fullQuery = `${query} lang:en -is:retweet`;
  if (fullQuery.length > 512) {
    console.log(`[X Crawler] Query too long (${fullQuery.length} chars), skipping`);
    return tweets;
  }
  
  const encodedQuery = encodeURIComponent(fullQuery);
  const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=${maxResults}&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url${startTime}`;
  
  const response: XSearchResponse = await fetchFromXApi(endpoint);
  
  if (response.data) {
    const usersMap = new Map<string, XUser>();
    if (response.includes?.users) {
      response.includes.users.forEach(user => {
        usersMap.set(user.id, user);
      });
    }
    for (const tweet of response.data) {
      (tweet as any)._user = usersMap.get(tweet.author_id);
      tweets.push(tweet);
    }
  }
  return tweets;
}

export async function crawlXPosts(): Promise<{ success: boolean; postsProcessed: number; errors: string[] }> {
  const errors: string[] = [];
  let postsProcessed = 0;

  if (!X_BEARER_TOKEN) {
    return { success: false, postsProcessed: 0, errors: ['X_BEARER_TOKEN not configured'] };
  }

  try {
    await connectToDatabase();
    console.log('[X Crawler] Starting sector-based X/Twitter crawl with 143 stocks...');

    const allTweets: XTweet[] = [];
    const seenIds = new Set<string>();
    const startTime = `&start_time=${get72HoursAgo()}`;
    
    const sectorQueries = [
      { name: 'General + Banking', query: `${NGX_SEARCH_QUERIES.general} OR ${NGX_SEARCH_QUERIES.banking}` },
      { name: 'Telecoms + Big Caps', query: NGX_SEARCH_QUERIES.telecomBigCaps },
      { name: 'Consumer Goods', query: NGX_SEARCH_QUERIES.consumerGoods },
      { name: 'Oil & Gas + Industrial', query: NGX_SEARCH_QUERIES.oilGasIndustrial },
      { name: 'Insurance', query: NGX_SEARCH_QUERIES.insurance },
      { name: 'Agri + Real Estate', query: NGX_SEARCH_QUERIES.agriRealEstate },
      { name: 'News Sources', query: NGX_SEARCH_QUERIES.newsSources },
    ];
    
    let callCount = 0;
    for (const sector of sectorQueries) {
      if (callCount >= 4) {
        console.log(`[X Crawler] Reached API call limit (4 calls), stopping to minimize costs`);
        break;
      }
      
      try {
        console.log(`[X Crawler] Searching: ${sector.name}`);
        const tweets = await searchWithQuery(sector.query, startTime, 25);
        
        for (const tweet of tweets) {
          if (!seenIds.has(tweet.id)) {
            seenIds.add(tweet.id);
            allTweets.push(tweet);
          }
        }
        
        console.log(`[X Crawler] ${sector.name}: Found ${tweets.length} tweets (${allTweets.length} total unique)`);
        callCount++;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        errors.push(`${sector.name} search error: ${error.message}`);
      }
    }
    
    const filteredTweets = filterTweetsForRelevance(allTweets, ALL_NGX_SYMBOLS);
    console.log(`[X Crawler] Found ${allTweets.length} tweets, ${filteredTweets.length} after filtering`);

    for (const tweet of filteredTweets) {
      try {
        const user = (tweet as any)._user as XUser | undefined;
        const externalId = `x-${tweet.id}`;

        const existing = await SocialPost.findOne({
          externalId,
          platform: 'twitter',
        });

        if (existing) {
          if (tweet.public_metrics) {
            await SocialPost.updateOne(
              { _id: existing._id },
              {
                $set: {
                  likes: tweet.public_metrics.like_count,
                  comments: tweet.public_metrics.reply_count,
                  shares: tweet.public_metrics.retweet_count + tweet.public_metrics.quote_count,
                },
              }
            );
          }
          continue;
        }

        const sentiment = await analyzeSentiment(tweet.text);
        
        let stockMentions = sentiment.stockMentions;
        if (!stockMentions || stockMentions.length === 0) {
          stockMentions = extractStockMentions(tweet.text);
        }

        await SocialPost.create({
          platform: 'twitter',
          externalId,
          author: user?.name || 'X User',
          authorHandle: user ? `@${user.username}` : undefined,
          authorAvatar: user?.profile_image_url,
          content: tweet.text,
          originalUrl: user ? `https://x.com/${user.username}/status/${tweet.id}` : undefined,
          likes: tweet.public_metrics?.like_count || 0,
          comments: tweet.public_metrics?.reply_count || 0,
          shares: (tweet.public_metrics?.retweet_count || 0) + (tweet.public_metrics?.quote_count || 0),
          verified: user?.verified || false,
          stockMentions,
          sentiment: sentiment.sentiment,
          sentimentScore: sentiment.score,
          sentimentReason: sentiment.reason,
          publishedAt: new Date(tweet.created_at),
          scrapedAt: new Date(),
          isActive: true,
        });

        postsProcessed++;
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        if (!error.message?.includes('duplicate key')) {
          errors.push(`Tweet ${tweet.id}: ${error.message}`);
        }
      }
    }

    console.log(`[X Crawler] Complete. Processed ${postsProcessed} new posts.`);
    return { success: true, postsProcessed, errors };
  } catch (error: any) {
    console.error('[X Crawler] Failed:', error);
    return { success: false, postsProcessed, errors: [...errors, error.message] };
  }
}

export async function getWatchlistXPosts(watchlistSymbols: string[], limit: number = 10): Promise<any[]> {
  if (!watchlistSymbols.length) return [];

  try {
    await connectToDatabase();

    const dbPosts = await SocialPost.find({
      platform: 'twitter',
      stockMentions: { $in: watchlistSymbols.map(s => s.toUpperCase()) },
      isActive: true,
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    return dbPosts.map((post: any) => ({
      id: post._id.toString(),
      platform: 'twitter',
      author: post.author,
      authorHandle: post.authorHandle,
      content: post.content,
      timestamp: formatTimeAgo(post.publishedAt),
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      verified: post.verified,
      stockMentions: post.stockMentions,
      sentiment: post.sentiment,
      url: post.originalUrl,
    }));
  } catch (error) {
    console.error('[X Crawler] getWatchlistXPosts error:', error);
    return [];
  }
}

function extractStockMentions(content: string): string[] {
  const mentions: string[] = [];
  const upperContent = content.toUpperCase();
  
  for (const symbol of ALL_NGX_SYMBOLS) {
    if (upperContent.includes(symbol) || upperContent.includes(`$${symbol}`)) {
      mentions.push(symbol);
    }
  }
  
  return [...new Set(mentions)];
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return new Date(date).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
  });
}
