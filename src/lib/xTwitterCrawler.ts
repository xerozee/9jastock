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

const STOCK_ALIASES: Record<string, string[]> = {
  'GTCO': ['GTBank', 'GT Bank', 'Guaranty Trust', 'GTCO'],
  'UBA': ['United Bank for Africa', 'UBA'],
  'FBNH': ['First Bank', 'FirstBank', 'FBN Holdings'],
  'MTNN': ['MTN Nigeria', 'MTN'],
  'AIRTELAFRI': ['Airtel Africa', 'Airtel'],
  'ACCESSCORP': ['Access Bank', 'Access Holdings', 'Access Corporation'],
  'STANBIC': ['Stanbic IBTC', 'Stanbic'],
  'BUACEMENT': ['BUA Cement', 'BUA'],
  'DANGCEM': ['Dangote Cement'],
  'SEPLAT': ['Seplat Energy', 'Seplat'],
  'FLOURMILL': ['Flour Mills', 'FMN', 'Flour Mills of Nigeria'],
  'WAPCO': ['Lafarge Africa', 'Lafarge'],
  'FCMB': ['First City Monument Bank', 'FCMB'],
  'STERLINGNG': ['Sterling Bank', 'Sterling'],
  'NB': ['Nigerian Breweries'],
  'AFRIPRUD': ['Africa Prudential', 'AfriPrud'],
  'TRANSCORP': ['Transnational Corporation', 'Transcorp'],
  'HONYFLOUR': ['Honeywell Flour', 'Honeywell'],
  'MANSARD': ['AXA Mansard', 'Mansard'],
  'CHIPLC': ['Consolidated Hallmark', 'CHI'],
  'ZENITHBANK': ['Zenith Bank'],
  'FIDELITYBK': ['Fidelity Bank'],
  'WEMABANK': ['Wema Bank'],
  'JAIZBANK': ['Jaiz Bank'],
  'ECOBANK': ['Ecobank Nigeria', 'Ecobank'],
  'UNITYBNK': ['Unity Bank'],
  'DANGSUGAR': ['Dangote Sugar'],
  'CADBURY': ['Cadbury Nigeria', 'Cadbury'],
  'NESTLE': ['Nestle Nigeria', 'Nestle'],
  'GUINNESS': ['Guinness Nigeria'],
  'INTBREW': ['International Breweries'],
  'VITAFOAM': ['Vitafoam Nigeria', 'Vitafoam'],
  'OANDO': ['Oando'],
  'PRESCO': ['Presco'],
  'CONOIL': ['Conoil'],
  'GEREGU': ['Geregu Power'],
  'CUTIX': ['Cutix'],
  'LIVESTOCK': ['Livestock Feeds'],
  'VERITASKAP': ['Veritas Kapital'],
  'NASCON': ['NASCON Allied', 'NASCON'],
  'BERGER': ['Berger Paints'],
  'RTBRISCOE': ['RT Briscoe'],
  'UPDCREIT': ['UPDC REIT'],
  'CHAMPION': ['Champion Breweries'],
  'NPFMCRFBK': ['NPF Microfinance Bank'],
  'CORNERST': ['Cornerstone Insurance'],
  'AIICO': ['AIICO Insurance', 'AIICO'],
  'LASACO': ['Lasaco Assurance'],
  'LINKASSURE': ['Linkage Assurance'],
  'MBENEFIT': ['Mutual Benefits Assurance'],
  'NEM': ['NEM Insurance'],
  'REGALINS': ['Regency Alliance Insurance'],
  'UCAP': ['United Capital'],
  'CAP': ['Chemical and Allied Products'],
  'DEAPCAP': ['DEAP Capital'],
  'TOTAL': ['TotalEnergies Marketing Nigeria'],
  'ARDOVA': ['Ardova Plc'],
  'MRS': ['MRS Oil'],
  'ETERNA': ['Eterna Plc'],
  'UNILEVER': ['Unilever Nigeria'],
  'PZ': ['PZ Cussons'],
  'OKOMUOIL': ['Okomu Oil'],
  'MAYBAKER': ['May & Baker'],
  'NEIMETH': ['Neimeth Pharmaceuticals'],
  'FIDSON': ['Fidson Healthcare'],
  'GLAXOSMITH': ['GlaxoSmithKline'],
  'UACN': ['UAC of Nigeria'],
  'NAHCO': ['Nigerian Aviation Handling Company'],
  'NGXGROUP': ['Nigerian Exchange Group', 'NGX Group'],
};

const STOCK_NAME_MAP: Record<string, string[]> = {};
nigerianStocks.forEach(stock => {
  const names: string[] = [stock.name, stock.symbol];
  const words = stock.name.split(' ');
  if (words.length > 1 && words[0].length > 2) {
    names.push(words[0]);
  }
  if (STOCK_ALIASES[stock.symbol]) {
    names.push(...STOCK_ALIASES[stock.symbol]);
  }
  STOCK_NAME_MAP[stock.symbol] = [...new Set(names)];
});

const NIGERIAN_STOCK_ACCOUNTS = [
  'NGXGroup', 'SECNigeria', 'Nairametrics', 'CardinalStone',
  'MeristemNg', 'AfrInvestor', 'StanbicIBTC', 'VetivaNigeria',
  'CSLStockbrokers', 'ChapelHillDen', 'InvestingNG'
];

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
  
  const cashtags = symbols.map(s => `$${s}`).join(' OR ');
  const cashtagQuery = `(${cashtags}) lang:en -is:retweet`;
  
  if (cashtagQuery.length <= 500) {
    try {
      const encodedQuery = encodeURIComponent(cashtagQuery);
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('X search error for cashtags:', error);
    }
  }

  return allTweets;
}

export async function searchXForWatchlistStocks(watchlistSymbols: string[], use72Hours: boolean = true): Promise<XTweet[]> {
  if (!watchlistSymbols.length) return [];
  
  const allTweets: XTweet[] = [];
  const startTime = use72Hours ? `&start_time=${get72HoursAgo()}` : '';
  const symbolChunks: string[][] = [];
  
  for (let i = 0; i < watchlistSymbols.length; i += 10) {
    symbolChunks.push(watchlistSymbols.slice(i, i + 10));
  }

  for (const chunk of symbolChunks) {
    try {
      const cashtags = chunk.map(s => `$${s}`).join(' OR ');
      const query = `(${cashtags}) lang:en -is:retweet`;
      
      if (query.length > 500) continue;
      
      const encodedQuery = encodeURIComponent(query);
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('X watchlist search error:', error);
    }
  }
  
  try {
    const symbolKeywords = watchlistSymbols
      .slice(0, 15)
      .map(s => `$${s}`)
      .join(' OR ');
    
    const financeQuery = `(from:NGXGroup OR from:SECNigeria OR from:Nairametrics) (${symbolKeywords}) -is:retweet`;
    const encodedQuery = encodeURIComponent(financeQuery);
    const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=10&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url${startTime}`;
    
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

  return allTweets;
}

export async function crawlXPosts(): Promise<{ success: boolean; postsProcessed: number; errors: string[] }> {
  const errors: string[] = [];
  let postsProcessed = 0;

  if (!X_BEARER_TOKEN) {
    return { success: false, postsProcessed: 0, errors: ['X_BEARER_TOKEN not configured'] };
  }

  try {
    await connectToDatabase();
    console.log('[X Crawler] Starting X/Twitter crawl (last 72 hours)...');

    const allTweets: XTweet[] = [];
    const startTime = `&start_time=${get72HoursAgo()}`;
    
    const userSymbols = await getAllUserSymbols();
    console.log(`[X Crawler] Found ${userSymbols.length} user-tracked symbols`);
    
    const allSymbols = [...new Set([...userSymbols, ...ALL_NGX_SYMBOLS])];
    console.log(`[X Crawler] Total unique symbols to search: ${allSymbols.length}`);
    
    const symbolBatches: string[][] = [];
    for (let i = 0; i < allSymbols.length; i += 20) {
      symbolBatches.push(allSymbols.slice(i, i + 20));
    }
    
    for (const batch of symbolBatches) {
      try {
        const batchTweets = await searchXForStocks(batch, true);
        allTweets.push(...batchTweets);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        errors.push(`Batch crawl error: ${error.message}`);
      }
    }
    
    const globalQueries = [
      `(from:NGXGroup OR from:SECNigeria OR from:Nairametrics OR from:CardinalStone) -is:retweet`,
      `("Nigerian stocks" OR "NGX" OR "Nigeria Stock Exchange") lang:en -is:retweet`,
    ];
    
    for (const query of globalQueries) {
      try {
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
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error: any) {
        errors.push(`Global query error: ${error.message}`);
      }
    }
    
    const tweets = allTweets;
    console.log(`[X Crawler] Found ${tweets.length} tweets`);

    for (const tweet of tweets) {
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
