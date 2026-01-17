import { connectToDatabase, SocialPost } from './mongodb';
import { analyzeSentiment } from './socialCrawler';

const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;

const NGX_STOCK_SYMBOLS = [
  'DANGCEM', 'GTCO', 'ZENITHBANK', 'MTNN', 'AIRTELAFRI', 'ACCESSCORP',
  'BUACEMENT', 'SEPLAT', 'NESTLE', 'STANBIC', 'FBNH', 'UBA', 'TRANSCORP',
  'OANDO', 'PRESCO', 'WAPCO', 'FLOURMILL', 'GUINNESS', 'INTBREW', 'NASCON',
  'GEREGU', 'CONOIL', 'FIDELITYBK', 'STERLINGNG', 'FCMB', 'WEMABANK',
  'UNITYBNK', 'JAIZBANK', 'ECOBANK', 'CADBURY', 'DANGSUGAR', 'VITAFOAM',
  'NB', 'CHIPLC', 'CUTIX', 'BERGER', 'RTBRISCOE', 'UPDCREIT', 'LIVESTOCK',
  'HONYFLOUR', 'CHAMPION', 'NPFMCRFBK', 'AFRIPRUD', 'CORNERST', 'MANSARD',
  'AIICO', 'LASACO', 'LINKASSURE', 'MBENEFIT', 'NEM', 'REGALINS', 'VERITASKAP'
];

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

const STOCK_COMPANY_NAMES: Record<string, string[]> = {
  'DANGCEM': ['Dangote Cement'],
  'GTCO': ['Guaranty Trust', 'GTCO', 'GTBank', 'GT Bank'],
  'ZENITHBANK': ['Zenith Bank'],
  'MTNN': ['MTN Nigeria', 'MTN'],
  'AIRTELAFRI': ['Airtel Africa', 'Airtel'],
  'ACCESSCORP': ['Access Holdings', 'Access Bank', 'Access Corporation'],
  'UBA': ['United Bank for Africa', 'UBA'],
  'FBNH': ['FBN Holdings', 'First Bank', 'FirstBank'],
  'NESTLE': ['Nestle Nigeria', 'Nestle'],
  'SEPLAT': ['Seplat Energy', 'Seplat'],
  'BUACEMENT': ['BUA Cement', 'BUA'],
  'STANBIC': ['Stanbic IBTC', 'Stanbic'],
  'TRANSCORP': ['Transcorp', 'Transnational Corporation'],
  'OANDO': ['Oando'],
  'PRESCO': ['Presco'],
  'FLOURMILL': ['Flour Mills of Nigeria', 'FMN'],
  'GUINNESS': ['Guinness Nigeria'],
  'NB': ['Nigerian Breweries'],
  'WAPCO': ['Lafarge Africa', 'Lafarge'],
  'FCMB': ['FCMB', 'First City Monument Bank'],
  'FIDELITYBK': ['Fidelity Bank'],
  'GEREGU': ['Geregu Power'],
  'DANGSUGAR': ['Dangote Sugar'],
  'CADBURY': ['Cadbury Nigeria', 'Cadbury'],
  'INTBREW': ['International Breweries'],
  'CONOIL': ['Conoil'],
  'CUTIX': ['Cutix'],
  'JAIZBANK': ['Jaiz Bank'],
  'LIVESTOCK': ['Livestock Feeds'],
  'UNITYBNK': ['Unity Bank'],
  'VERITASKAP': ['Veritas Kapital'],
  'WEMABANK': ['Wema Bank'],
  'NASCON': ['NASCON Allied', 'NASCON'],
  'STERLINGNG': ['Sterling Bank', 'Sterling'],
  'ECOBANK': ['Ecobank Nigeria', 'Ecobank'],
  'VITAFOAM': ['Vitafoam Nigeria', 'Vitafoam'],
  'CHIPLC': ['Consolidated Hallmark', 'CHI'],
  'BERGER': ['Berger Paints'],
  'RTBRISCOE': ['RT Briscoe'],
  'UPDCREIT': ['UPDC REIT'],
  'HONYFLOUR': ['Honeywell Flour', 'Honeywell'],
  'CHAMPION': ['Champion Breweries'],
  'NPFMCRFBK': ['NPF Microfinance Bank'],
  'AFRIPRUD': ['Africa Prudential', 'AfriPrud'],
  'CORNERST': ['Cornerstone Insurance'],
  'MANSARD': ['AXA Mansard', 'Mansard'],
  'AIICO': ['AIICO Insurance', 'AIICO'],
  'LASACO': ['Lasaco Assurance'],
  'LINKASSURE': ['Linkage Assurance'],
  'MBENEFIT': ['Mutual Benefits Assurance'],
  'NEM': ['NEM Insurance'],
  'REGALINS': ['Regency Alliance Insurance'],
};

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

export async function searchXForStocks(symbols: string[]): Promise<XTweet[]> {
  const allTweets: XTweet[] = [];
  
  const cashtags = symbols.map(s => `$${s}`).join(' OR ');
  const companyNames = symbols
    .flatMap(s => STOCK_COMPANY_NAMES[s] || [])
    .filter(Boolean);
  
  const queries = [
    `(${cashtags}) lang:en -is:retweet`,
  ];
  
  if (companyNames.length > 0) {
    const namesQuery = companyNames.map(n => `"${n}"`).join(' OR ');
    queries.push(`(${namesQuery}) lang:en -is:retweet`);
  }
  
  for (const query of queries) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=20&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url`;
      
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
      console.error('X search error for query:', query, error);
    }
  }

  return allTweets;
}

export async function searchXForWatchlistStocks(watchlistSymbols: string[]): Promise<XTweet[]> {
  if (!watchlistSymbols.length) return [];
  
  const allTweets: XTweet[] = [];
  const symbolChunks: string[][] = [];
  
  for (let i = 0; i < watchlistSymbols.length; i += 5) {
    symbolChunks.push(watchlistSymbols.slice(i, i + 5));
  }

  for (const chunk of symbolChunks) {
    try {
      const cashtags = chunk.map(s => `$${s}`).join(' OR ');
      const companyNames = chunk
        .flatMap(s => STOCK_COMPANY_NAMES[s] || [])
        .filter(Boolean)
        .map(n => `"${n}"`)
        .join(' OR ');
      
      let query = `(${cashtags})`;
      if (companyNames) {
        query = `(${cashtags} OR ${companyNames})`;
      }
      query += ` lang:en -is:retweet`;
      
      const encodedQuery = encodeURIComponent(query);
      const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=15&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url`;
      
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
      .flatMap(s => {
        const names = STOCK_COMPANY_NAMES[s] || [];
        const quoted = names.map(n => `"${n}"`);
        return [`$${s}`, ...quoted];
      })
      .join(' OR ');
    
    const financeQuery = `(from:NGXGroup OR from:SECNigeria OR from:Nairametrics) (${symbolKeywords}) -is:retweet`;
    const encodedQuery = encodeURIComponent(financeQuery);
    const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=10&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url`;
    
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
    console.log('[X Crawler] Starting X/Twitter crawl...');

    const allTweets: XTweet[] = [];
    
    const symbolBatches: string[][] = [];
    for (let i = 0; i < NGX_STOCK_SYMBOLS.length; i += 10) {
      symbolBatches.push(NGX_STOCK_SYMBOLS.slice(i, i + 10));
    }
    
    for (const batch of symbolBatches) {
      try {
        const batchTweets = await searchXForStocks(batch);
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
        const endpoint = `/tweets/search/recent?query=${encodedQuery}&max_results=20&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id&user.fields=name,username,verified,profile_image_url`;
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
  
  for (const symbol of NGX_STOCK_SYMBOLS) {
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
