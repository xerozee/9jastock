import OpenAI from 'openai';
import { connectToDatabase, SocialPost, ISocialPost } from './mongodb';
import * as cheerio from 'cheerio';

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

const NIGERIAN_TWITTER_ACCOUNTS = [
  'Naborhood', 'Afrinvestor', 'naborhood', 'CardinalStone',
  'MeristemNg', 'CSlonenig', 'NGXGroup', 'SECNigeria', 'Naborhood',
  'StockWatchNG', 'NaijaStockGuru', 'LagosTrader', 'NGMarketWatch'
];

interface RawPost {
  platform: 'reddit' | 'tradingview' | 'twitter' | 'news';
  externalId: string;
  author: string;
  authorHandle?: string;
  content: string;
  originalUrl?: string;
  imageUrl?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  verified?: boolean;
  subreddit?: string;
  publishedAt: Date;
}

interface SentimentResult {
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  score: number;
  reason: string;
  stockMentions: string[];
}

export async function analyzeSentiment(content: string): Promise<SentimentResult> {
  try {
    const openai = new OpenAI();
    
    const prompt = `Analyze this social media post about Nigerian stocks. Return a JSON object with:
- sentiment: "bullish", "bearish", "neutral", or "mixed"
- score: number from -1 (very bearish) to 1 (very bullish)
- reason: brief 1-sentence explanation
- stockMentions: array of Nigerian stock symbols mentioned (e.g., DANGCEM, GTCO, MTNN)

Nigerian stock symbols to look for: ${NGX_STOCK_SYMBOLS.slice(0, 30).join(', ')}

Post: "${content}"

Return ONLY valid JSON, no markdown.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const text = response.choices[0]?.message?.content?.trim() || '{}';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);
    
    return {
      sentiment: result.sentiment || 'neutral',
      score: typeof result.score === 'number' ? result.score : 0,
      reason: result.reason || 'Analysis unavailable',
      stockMentions: Array.isArray(result.stockMentions) ? result.stockMentions : [],
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    const mentions = extractStockMentions(content);
    return {
      sentiment: 'neutral',
      score: 0,
      reason: 'Sentiment analysis unavailable',
      stockMentions: mentions,
    };
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

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...options.headers,
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function scrapeTradingViewCommunity(): Promise<RawPost[]> {
  const posts: RawPost[] = [];
  
  try {
    const symbols = ['DANGCEM', 'GTCO', 'ZENITHBANK', 'MTNN', 'AIRTELAFRI'];
    
    for (const symbol of symbols) {
      try {
        const url = `https://www.tradingview.com/symbols/NSENG-${symbol}/ideas/`;
        const response = await fetchWithTimeout(url);
        
        if (!response.ok) continue;
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        $('.tv-widget-idea').each((_, element) => {
          const $el = $(element);
          const title = $el.find('.tv-widget-idea__title').text().trim();
          const author = $el.find('.tv-card-user-info__name').text().trim() || 'TradingView User';
          const description = $el.find('.tv-widget-idea__description-row').text().trim();
          const likes = parseInt($el.find('.tv-social-row__likes').text()) || 0;
          const comments = parseInt($el.find('.tv-social-row__comments').text()) || 0;
          const link = $el.find('.tv-widget-idea__title-link').attr('href');
          
          if (title || description) {
            posts.push({
              platform: 'tradingview',
              externalId: `tv-${symbol}-${Buffer.from(title || description).toString('base64').slice(0, 20)}`,
              author,
              content: `${title}\n${description}`.trim().slice(0, 500),
              originalUrl: link ? `https://www.tradingview.com${link}` : undefined,
              likes,
              comments,
              publishedAt: new Date(),
            });
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error scraping TradingView for ${symbol}:`, error);
      }
    }
  } catch (error) {
    console.error('TradingView scraping error:', error);
  }
  
  return posts;
}

export async function scrapeTwitterPublic(): Promise<RawPost[]> {
  const posts: RawPost[] = [];
  
  try {
    const searchTerms = ['Nigerian stocks', 'NGX', 'DANGCEM', 'NSE Nigeria', 'Lagos Stock Exchange'];
    
    for (const term of searchTerms.slice(0, 2)) {
      try {
        const url = `https://nitter.net/search?f=tweets&q=${encodeURIComponent(term)}`;
        const response = await fetchWithTimeout(url);
        
        if (!response.ok) continue;
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        $('.timeline-item').each((_, element) => {
          const $el = $(element);
          const content = $el.find('.tweet-content').text().trim();
          const author = $el.find('.fullname').text().trim() || 'Twitter User';
          const handle = $el.find('.username').text().trim();
          const statsText = $el.find('.tweet-stats').text();
          const likes = parseInt(statsText.match(/(\d+)\s*likes?/i)?.[1] || '0');
          const replies = parseInt(statsText.match(/(\d+)\s*repl/i)?.[1] || '0');
          const retweets = parseInt(statsText.match(/(\d+)\s*retweet/i)?.[1] || '0');
          const link = $el.find('.tweet-link').attr('href');
          const verified = $el.find('.verified-icon').length > 0;
          
          if (content && content.length > 20) {
            posts.push({
              platform: 'twitter',
              externalId: `tw-${Buffer.from(content).toString('base64').slice(0, 20)}`,
              author,
              authorHandle: handle,
              content: content.slice(0, 500),
              originalUrl: link ? `https://twitter.com${link}` : undefined,
              likes,
              comments: replies,
              shares: retweets,
              verified,
              publishedAt: new Date(),
            });
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`Twitter search error for ${term}:`, error);
      }
    }
  } catch (error) {
    console.error('Twitter scraping error:', error);
  }
  
  return posts;
}

export async function scrapeReddit(): Promise<RawPost[]> {
  const posts: RawPost[] = [];
  
  try {
    const subreddits = ['NigerianStocks', 'africafinance', 'investing'];
    
    for (const subreddit of subreddits) {
      try {
        const url = `https://www.reddit.com/r/${subreddit}/search.json?q=nigeria+stock&restrict_sr=on&sort=new&limit=10`;
        const response = await fetchWithTimeout(url, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        const children = data?.data?.children || [];
        
        for (const child of children) {
          const post = child.data;
          if (!post?.title) continue;
          
          posts.push({
            platform: 'reddit',
            externalId: `reddit-${post.id}`,
            author: post.author || 'Reddit User',
            content: `${post.title}\n${post.selftext || ''}`.trim().slice(0, 500),
            originalUrl: `https://reddit.com${post.permalink}`,
            imageUrl: post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : undefined,
            likes: post.ups || 0,
            comments: post.num_comments || 0,
            subreddit: `r/${subreddit}`,
            publishedAt: new Date(post.created_utc * 1000),
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Reddit scraping error for r/${subreddit}:`, error);
      }
    }
  } catch (error) {
    console.error('Reddit scraping error:', error);
  }
  
  return posts;
}

export async function scrapeNigerianNews(): Promise<RawPost[]> {
  const posts: RawPost[] = [];
  
  try {
    const url = 'https://nairametrics.com/category/stocks/';
    const response = await fetchWithTimeout(url);
    
    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);
      
      $('article').slice(0, 10).each((_, element) => {
        const $el = $(element);
        const title = $el.find('h2 a, .entry-title a').text().trim();
        const link = $el.find('h2 a, .entry-title a').attr('href');
        const excerpt = $el.find('.entry-summary, .excerpt').text().trim();
        const image = $el.find('img').attr('src');
        const dateStr = $el.find('time, .date').attr('datetime') || $el.find('time, .date').text();
        
        if (title) {
          posts.push({
            platform: 'news',
            externalId: `nm-${Buffer.from(title).toString('base64').slice(0, 20)}`,
            author: 'Nairametrics',
            content: `${title}\n${excerpt}`.trim().slice(0, 500),
            originalUrl: link,
            imageUrl: image,
            publishedAt: dateStr ? new Date(dateStr) : new Date(),
          });
        }
      });
    }
  } catch (error) {
    console.error('News scraping error:', error);
  }
  
  return posts;
}

export async function runCrawler(): Promise<{ success: boolean; postsProcessed: number; errors: string[] }> {
  const errors: string[] = [];
  let postsProcessed = 0;
  
  try {
    await connectToDatabase();
    
    console.log('Starting social media crawler...');
    
    const { crawlXPosts } = await import('./xTwitterCrawler');
    
    const [tradingViewPosts, xCrawlResult, redditPosts, newsPosts] = await Promise.all([
      scrapeTradingViewCommunity().catch(e => { errors.push(`TradingView: ${e.message}`); return []; }),
      crawlXPosts().catch(e => { errors.push(`X/Twitter: ${e.message}`); return { success: false, postsProcessed: 0, errors: [e.message] }; }),
      scrapeReddit().catch(e => { errors.push(`Reddit: ${e.message}`); return []; }),
      scrapeNigerianNews().catch(e => { errors.push(`News: ${e.message}`); return []; }),
    ]);
    
    if (xCrawlResult && typeof xCrawlResult === 'object' && 'postsProcessed' in xCrawlResult) {
      postsProcessed += xCrawlResult.postsProcessed;
      if (xCrawlResult.errors?.length) {
        errors.push(...xCrawlResult.errors);
      }
    }
    
    const twitterPosts: RawPost[] = [];
    
    const allPosts = [...tradingViewPosts, ...twitterPosts, ...redditPosts, ...newsPosts];
    console.log(`Found ${allPosts.length} total posts`);
    
    for (const post of allPosts) {
      try {
        const existing = await SocialPost.findOne({
          externalId: post.externalId,
          platform: post.platform,
        });
        
        if (existing) {
          await SocialPost.updateOne(
            { _id: existing._id },
            { $set: { likes: post.likes, comments: post.comments, shares: post.shares } }
          );
          continue;
        }
        
        const sentiment = await analyzeSentiment(post.content);
        
        await SocialPost.create({
          ...post,
          sentiment: sentiment.sentiment,
          sentimentScore: sentiment.score,
          sentimentReason: sentiment.reason,
          stockMentions: sentiment.stockMentions,
          scrapedAt: new Date(),
          isActive: true,
        });
        
        postsProcessed++;
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        if (!error.message?.includes('duplicate key')) {
          errors.push(`Post ${post.externalId}: ${error.message}`);
        }
      }
    }
    
    console.log(`Crawler complete. Processed ${postsProcessed} new posts.`);
    
    return { success: true, postsProcessed, errors };
  } catch (error: any) {
    console.error('Crawler failed:', error);
    return { success: false, postsProcessed, errors: [...errors, error.message] };
  }
}

export async function getSocialPosts(options: {
  platform?: string;
  limit?: number;
  stockSymbol?: string;
}): Promise<ISocialPost[]> {
  await connectToDatabase();
  
  const query: any = { isActive: true };
  
  if (options.platform && options.platform !== 'all') {
    query.platform = options.platform;
  }
  
  if (options.stockSymbol) {
    query.stockMentions = options.stockSymbol.toUpperCase();
  }
  
  const posts = await SocialPost.find(query)
    .sort({ publishedAt: -1 })
    .limit(options.limit || 20)
    .lean();
  
  return posts as ISocialPost[];
}
