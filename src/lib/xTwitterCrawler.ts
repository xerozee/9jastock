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
  
  const queries = [
    `(${symbols.slice(0, 5).map(s => `$${s}`).join(' OR ')}) lang:en -is:retweet`,
    `("Nigerian stocks" OR "NGX" OR "Nigeria Stock Exchange") lang:en -is:retweet`,
    `(${NIGERIAN_STOCK_ACCOUNTS.slice(0, 5).map(a => `from:${a}`).join(' OR ')}) -is:retweet`,
  ];

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

  for (const chunk of symbolChunks.slice(0, 2)) {
    try {
      const cashtags = chunk.map(s => `$${s}`).join(' OR ');
      const companyNames = chunk.map(s => {
        const stockNames: Record<string, string> = {
          'DANGCEM': 'Dangote Cement',
          'GTCO': 'GTBank',
          'ZENITHBANK': 'Zenith Bank',
          'MTNN': 'MTN Nigeria',
          'AIRTELAFRI': 'Airtel Africa',
          'ACCESSCORP': 'Access Bank',
          'UBA': 'United Bank for Africa',
          'FBNH': 'First Bank',
          'NESTLE': 'Nestle Nigeria',
          'SEPLAT': 'Seplat Energy',
        };
        return stockNames[s] || s;
      }).join(' OR ');
      
      const query = `(${cashtags} OR ${companyNames}) lang:en -is:retweet`;
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

    const tweets = await searchXForStocks(NGX_STOCK_SYMBOLS.slice(0, 10));
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
          stockMentions: sentiment.stockMentions,
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

export async function getWatchlistXPosts(watchlistSymbols: string[]): Promise<any[]> {
  if (!watchlistSymbols.length) return [];

  try {
    await connectToDatabase();

    const dbPosts = await SocialPost.find({
      platform: 'twitter',
      stockMentions: { $in: watchlistSymbols.map(s => s.toUpperCase()) },
      isActive: true,
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();

    if (dbPosts.length >= 5) {
      return dbPosts.map(post => ({
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
    }

    const freshTweets = await searchXForWatchlistStocks(watchlistSymbols);
    
    const posts = freshTweets.slice(0, 10).map(tweet => {
      const user = (tweet as any)._user as XUser | undefined;
      return {
        id: tweet.id,
        platform: 'twitter',
        author: user?.name || 'X User',
        authorHandle: user ? `@${user.username}` : undefined,
        content: tweet.text,
        timestamp: formatTimeAgo(new Date(tweet.created_at)),
        likes: tweet.public_metrics?.like_count || 0,
        comments: tweet.public_metrics?.reply_count || 0,
        shares: (tweet.public_metrics?.retweet_count || 0) + (tweet.public_metrics?.quote_count || 0),
        verified: user?.verified || false,
        stockMentions: extractStockMentions(tweet.text),
        url: user ? `https://x.com/${user.username}/status/${tweet.id}` : undefined,
      };
    });

    return posts;
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
