import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  password: { type: String, select: false },
  firstName: { type: String },
  lastName: { type: String },
  profileImageUrl: { type: String },
  oauthId: { type: String, unique: true, sparse: true },
  oauthProvider: { type: String },
  emailVerified: { type: Date },
  shareId: { type: String, unique: true, sparse: true },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bio: { type: String },
  investmentGoal: { type: String, enum: ['wealth-building', 'retirement', 'passive-income', 'short-term-gains', 'learning'] },
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
  riskTolerance: { type: String, enum: ['conservative', 'moderate', 'aggressive'] },
  investmentHorizon: { type: String, enum: ['less-than-1-year', '1-3-years', '3-5-years', '5-10-years', '10-plus-years'] },
  interestedSectors: [{ type: String }],
  onboardingCompleted: { type: Boolean, default: false },
  stripeCustomerId: { type: String, sparse: true },
  subscriptionStatus: { type: String, enum: ['free', 'active', 'canceled', 'past_due', 'trialing'], default: 'free' },
  subscriptionId: { type: String },
  subscriptionPriceId: { type: String },
  subscriptionCurrentPeriodEnd: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  sid: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const portfolioItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
});

portfolioItemSchema.index({ userId: 1 });
portfolioItemSchema.index({ userId: 1, symbol: 1 }, { unique: true });

const holdingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  shares: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  purchaseDate: { type: Date, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

holdingSchema.index({ userId: 1 });
holdingSchema.index({ symbol: 1 });

const newsArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String },
  content: { type: String },
  url: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  category: { type: String },
  symbol: { type: String },
  imageUrl: { type: String },
  publishedAt: { type: Date },
  scrapedAt: { type: Date, default: Date.now },
});

newsArticleSchema.index({ source: 1 });
newsArticleSchema.index({ publishedAt: -1 });
newsArticleSchema.index({ symbol: 1 });
newsArticleSchema.index({ title: 'text', summary: 'text' });

const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const sentNewsletterSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  recipientCount: { type: Number },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, default: 'sent' },
});

sentNewsletterSchema.index({ sentAt: -1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export const PortfolioItem = mongoose.models.PortfolioItem || mongoose.model('PortfolioItem', portfolioItemSchema);
export const Holding = mongoose.models.Holding || mongoose.model('Holding', holdingSchema);
export const NewsArticle = mongoose.models.NewsArticle || mongoose.model('NewsArticle', newsArticleSchema);
export const NewsletterSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
export const SentNewsletter = mongoose.models.SentNewsletter || mongoose.model('SentNewsletter', sentNewsletterSchema);

export type IUser = {
  _id: mongoose.Types.ObjectId;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  oauthId?: string;
  oauthProvider?: string;
  emailVerified?: Date;
  shareId?: string;
  referralCode?: string;
  referredBy?: mongoose.Types.ObjectId;
  bio?: string;
  investmentGoal?: 'wealth-building' | 'retirement' | 'passive-income' | 'short-term-gains' | 'learning';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon?: 'less-than-1-year' | '1-3-years' | '3-5-years' | '5-10-years' | '10-plus-years';
  interestedSectors?: string[];
  onboardingCompleted?: boolean;
  stripeCustomerId?: string;
  subscriptionStatus?: 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
  subscriptionId?: string;
  subscriptionPriceId?: string;
  subscriptionCurrentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ISession = {
  _id: mongoose.Types.ObjectId;
  sid: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
};

export type IPortfolioItem = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  symbol: string;
  addedAt: Date;
};

export type IHolding = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  symbol: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: Date;
  notes?: string;
  createdAt: Date;
};

export type INewsArticle = {
  _id: mongoose.Types.ObjectId;
  title: string;
  summary?: string;
  content?: string;
  url: string;
  source: string;
  category?: string;
  symbol?: string;
  imageUrl?: string;
  publishedAt?: Date;
  scrapedAt: Date;
};

export type INewsletterSubscriber = {
  _id: mongoose.Types.ObjectId;
  email: string;
  subscribedAt: Date;
  isActive: boolean;
};

export type ISentNewsletter = {
  _id: mongoose.Types.ObjectId;
  subject: string;
  content: string;
  recipientCount?: number;
  sentAt: Date;
  status: string;
};

// Social Post Schema for Market Buzz feed
const socialPostSchema = new mongoose.Schema({
  platform: { type: String, enum: ['reddit', 'tradingview', 'twitter', 'news'], required: true },
  externalId: { type: String, required: true },
  author: { type: String, required: true },
  authorHandle: { type: String },
  authorAvatar: { type: String },
  content: { type: String, required: true },
  originalUrl: { type: String },
  imageUrl: { type: String },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  subreddit: { type: String },
  stockMentions: [{ type: String }],
  sentiment: { type: String, enum: ['bullish', 'bearish', 'neutral', 'mixed'] },
  sentimentScore: { type: Number, min: -1, max: 1 },
  sentimentReason: { type: String },
  publishedAt: { type: Date, required: true },
  scrapedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

socialPostSchema.index({ platform: 1 });
socialPostSchema.index({ publishedAt: -1 });
socialPostSchema.index({ stockMentions: 1 });
socialPostSchema.index({ externalId: 1, platform: 1 }, { unique: true });
socialPostSchema.index({ content: 'text' });

export const SocialPost = mongoose.models.SocialPost || mongoose.model('SocialPost', socialPostSchema);

export type ISocialPost = {
  _id: mongoose.Types.ObjectId;
  platform: 'reddit' | 'tradingview' | 'twitter' | 'news';
  externalId: string;
  author: string;
  authorHandle?: string;
  authorAvatar?: string;
  content: string;
  originalUrl?: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  verified: boolean;
  subreddit?: string;
  stockMentions: string[];
  sentiment?: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  sentimentScore?: number;
  sentimentReason?: string;
  publishedAt: Date;
  scrapedAt: Date;
  isActive: boolean;
};
