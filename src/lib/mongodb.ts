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

const pushSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  preferences: {
    priceAlerts: { type: Boolean, default: true },
    dailySummary: { type: Boolean, default: true },
    breakingNews: { type: Boolean, default: true },
    watchlistUpdates: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

pushSubscriptionSchema.index({ userId: 1 });
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });

export const PushSubscription = mongoose.models.PushSubscription || mongoose.model('PushSubscription', pushSubscriptionSchema);

const priceAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  condition: { type: String, enum: ['above', 'below'], required: true },
  isActive: { type: Boolean, default: true },
  triggered: { type: Boolean, default: false },
  triggeredAt: { type: Date },
  triggeredPrice: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

priceAlertSchema.index({ userId: 1 });
priceAlertSchema.index({ symbol: 1, isActive: 1 });
priceAlertSchema.index({ isActive: 1, triggered: 1 });

export const PriceAlert = mongoose.models.PriceAlert || mongoose.model('PriceAlert', priceAlertSchema);

export type IPushSubscription = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  preferences: {
    priceAlerts: boolean;
    dailySummary: boolean;
    breakingNews: boolean;
    watchlistUpdates: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type IPriceAlert = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  triggered: boolean;
  triggeredAt?: Date;
  triggeredPrice?: number;
  createdAt: Date;
};

const referralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'rewarded', 'expired'], 
    default: 'pending' 
  },
  referredUserSubscriptionStatus: { 
    type: String, 
    enum: ['free', 'active', 'canceled', 'past_due', 'trialing'],
    default: 'free'
  },
  rewardType: { type: String, enum: ['free_month', 'discount', 'credits', 'none'], default: 'none' },
  rewardAmount: { type: Number, default: 0 },
  rewardClaimed: { type: Boolean, default: false },
  rewardClaimedAt: { type: Date },
  conversionDate: { type: Date },
  expiresAt: { type: Date },
  metadata: {
    signupSource: { type: String },
    signupDevice: { type: String },
    signupCountry: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

referralSchema.index({ referrerId: 1 });
referralSchema.index({ referredUserId: 1 }, { unique: true });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ createdAt: -1 });

const referralRewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralId: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral', required: true },
  rewardType: { type: String, enum: ['free_month', 'discount', 'credits'], required: true },
  rewardAmount: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'applied', 'expired'], default: 'pending' },
  appliedAt: { type: Date },
  expiresAt: { type: Date },
  stripePromotionId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

referralRewardSchema.index({ userId: 1 });
referralRewardSchema.index({ status: 1 });

const referralStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalReferrals: { type: Number, default: 0 },
  pendingReferrals: { type: Number, default: 0 },
  convertedReferrals: { type: Number, default: 0 },
  totalRewardsEarned: { type: Number, default: 0 },
  freeMonthsEarned: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  lastReferralAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
});

referralStatsSchema.index({ tier: 1 });
referralStatsSchema.index({ totalReferrals: -1 });

export const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);
export const ReferralReward = mongoose.models.ReferralReward || mongoose.model('ReferralReward', referralRewardSchema);
export const ReferralStats = mongoose.models.ReferralStats || mongoose.model('ReferralStats', referralStatsSchema);

export type IReferral = {
  _id: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  referralCode: string;
  status: 'pending' | 'completed' | 'rewarded' | 'expired';
  referredUserSubscriptionStatus: 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
  rewardType: 'free_month' | 'discount' | 'credits' | 'none';
  rewardAmount: number;
  rewardClaimed: boolean;
  rewardClaimedAt?: Date;
  conversionDate?: Date;
  expiresAt?: Date;
  metadata?: {
    signupSource?: string;
    signupDevice?: string;
    signupCountry?: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type IReferralReward = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  referralId: mongoose.Types.ObjectId;
  rewardType: 'free_month' | 'discount' | 'credits';
  rewardAmount: number;
  description?: string;
  status: 'pending' | 'applied' | 'expired';
  appliedAt?: Date;
  expiresAt?: Date;
  stripePromotionId?: string;
  createdAt: Date;
};

export type IReferralStats = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  totalRewardsEarned: number;
  freeMonthsEarned: number;
  currentStreak: number;
  longestStreak: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lastReferralAt?: Date;
  updatedAt: Date;
};

const companyProfileSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  sector: { type: String },
  industry: { type: String },
  founded: { type: Number },
  headquarters: { type: String },
  ceo: { type: String },
  employees: { type: Number },
  website: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  registrationNumber: { type: String },
  listingDate: { type: Date },
  stockExchange: { type: String, default: 'NGX' },
  isin: { type: String },
  fiscalYearEnd: { type: String },
  auditor: { type: String },
  registrar: { type: String },
  businessSummary: { type: String },
  keyProducts: [{ type: String }],
  competitors: [{ type: String }],
  subsidiaries: [{ type: String }],
  boardOfDirectors: [{
    name: { type: String },
    position: { type: String },
    since: { type: Number }
  }],
  lastUpdated: { type: Date, default: Date.now },
  dataSource: { type: String },
  isVerified: { type: Boolean, default: false },
});

companyProfileSchema.index({ sector: 1 });
companyProfileSchema.index({ industry: 1 });
companyProfileSchema.index({ name: 'text', description: 'text' });

export const CompanyProfile = mongoose.models.CompanyProfile || mongoose.model('CompanyProfile', companyProfileSchema);

const dividendHistorySchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  declarationDate: { type: Date },
  exDividendDate: { type: Date },
  recordDate: { type: Date },
  paymentDate: { type: Date },
  dividendAmount: { type: Number, required: true },
  dividendType: { type: String, enum: ['interim', 'final', 'special', 'bonus'], default: 'final' },
  currency: { type: String, default: 'NGN' },
  dividendYield: { type: Number },
  fiscalYear: { type: Number },
  fiscalQuarter: { type: Number },
  qualificationDate: { type: Date },
  closureStart: { type: Date },
  closureEnd: { type: Date },
  source: { type: String },
  sourceUrl: { type: String },
  scrapedAt: { type: Date, default: Date.now },
});

dividendHistorySchema.index({ paymentDate: -1 });
dividendHistorySchema.index({ symbol: 1, paymentDate: -1 });
dividendHistorySchema.index({ fiscalYear: 1 });

export const DividendHistory = mongoose.models.DividendHistory || mongoose.model('DividendHistory', dividendHistorySchema);

export type ICompanyProfile = {
  _id: mongoose.Types.ObjectId;
  symbol: string;
  name: string;
  description?: string;
  sector?: string;
  industry?: string;
  founded?: number;
  headquarters?: string;
  ceo?: string;
  employees?: number;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  registrationNumber?: string;
  listingDate?: Date;
  stockExchange: string;
  isin?: string;
  fiscalYearEnd?: string;
  auditor?: string;
  registrar?: string;
  businessSummary?: string;
  keyProducts?: string[];
  competitors?: string[];
  subsidiaries?: string[];
  boardOfDirectors?: Array<{
    name: string;
    position: string;
    since?: number;
  }>;
  lastUpdated: Date;
  dataSource?: string;
  isVerified: boolean;
};

export type IDividendHistory = {
  _id: mongoose.Types.ObjectId;
  symbol: string;
  declarationDate?: Date;
  exDividendDate?: Date;
  recordDate?: Date;
  paymentDate?: Date;
  dividendAmount: number;
  dividendType: 'interim' | 'final' | 'special' | 'bonus';
  currency: string;
  dividendYield?: number;
  fiscalYear?: number;
  fiscalQuarter?: number;
  qualificationDate?: Date;
  closureStart?: Date;
  closureEnd?: Date;
  source?: string;
  sourceUrl?: string;
  scrapedAt: Date;
};

// African Financials Report Schema - stores annual/interim reports
const financialReportSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  companyName: { type: String, required: true },
  reportType: { type: String, enum: ['annual', 'interim', 'quarterly', 'abridged'], required: true },
  reportTitle: { type: String, required: true },
  reportUrl: { type: String, required: true },
  documentUrl: { type: String },
  year: { type: Number, required: true },
  period: { type: String }, // Q1, Q2, Q3, Q4, HY, FY
  publishedAt: { type: Date },
  highlights: {
    revenue: { type: Number },
    profit: { type: Number },
    profitBeforeTax: { type: Number },
    totalAssets: { type: Number },
    eps: { type: Number },
    dividend: { type: Number },
    dividendPerShare: { type: Number },
    grossEarnings: { type: Number },
    operatingProfit: { type: Number },
  },
  source: { type: String, default: 'africanfinancials.com' },
  scrapedAt: { type: Date, default: Date.now },
});

financialReportSchema.index({ symbol: 1, year: -1 });
financialReportSchema.index({ reportType: 1 });
financialReportSchema.index({ year: -1 });
financialReportSchema.index({ symbol: 1, reportUrl: 1 }, { unique: true });

// Company Financial Data Cache - stores aggregated data per company
const companyFinancialDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  companyName: { type: String },
  africanFinancialsUrl: { type: String },
  reportsCount: { type: Number, default: 0 },
  latestReportYear: { type: Number },
  latestReportType: { type: String },
  dividendsCount: { type: Number, default: 0 },
  latestDividendYear: { type: Number },
  lastUpdated: { type: Date, default: Date.now },
  lastScrapedAt: { type: Date },
  scrapeStatus: { type: String, enum: ['success', 'failed', 'pending', 'not_found'], default: 'pending' },
  scrapeError: { type: String },
});

companyFinancialDataSchema.index({ lastUpdated: -1 });
companyFinancialDataSchema.index({ scrapeStatus: 1 });

export const FinancialReport = mongoose.models.FinancialReport || mongoose.model('FinancialReport', financialReportSchema);
export const CompanyFinancialData = mongoose.models.CompanyFinancialData || mongoose.model('CompanyFinancialData', companyFinancialDataSchema);

export type IFinancialReport = {
  _id: mongoose.Types.ObjectId;
  symbol: string;
  companyName: string;
  reportType: 'annual' | 'interim' | 'quarterly' | 'abridged';
  reportTitle: string;
  reportUrl: string;
  documentUrl?: string;
  year: number;
  period?: string;
  publishedAt?: Date;
  highlights?: {
    revenue?: number;
    profit?: number;
    profitBeforeTax?: number;
    totalAssets?: number;
    eps?: number;
    dividend?: number;
    dividendPerShare?: number;
    grossEarnings?: number;
    operatingProfit?: number;
  };
  source: string;
  scrapedAt: Date;
};

export type ICompanyFinancialData = {
  _id: mongoose.Types.ObjectId;
  symbol: string;
  companyName?: string;
  africanFinancialsUrl?: string;
  reportsCount: number;
  latestReportYear?: number;
  latestReportType?: string;
  dividendsCount: number;
  latestDividendYear?: number;
  lastUpdated: Date;
  lastScrapedAt?: Date;
  scrapeStatus: 'success' | 'failed' | 'pending' | 'not_found';
  scrapeError?: string;
};

// Sync Job Schema - tracks batch sync operations
const syncJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  source: { type: String, required: true, default: 'africanfinancials' },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'cancelled'], default: 'pending' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  scheduledFor: { type: Date },
  totalSymbols: { type: Number, default: 0 },
  processedSymbols: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  reportsFound: { type: Number, default: 0 },
  batchSize: { type: Number, default: 20 },
  currentBatch: { type: Number, default: 0 },
  totalBatches: { type: Number, default: 0 },
  symbolsToProcess: [{ type: String }],
  processedSymbolsList: [{ type: String }],
  errors: [{
    symbol: { type: String },
    error: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
  metadata: {
    triggeredBy: { type: String }, // 'scheduler', 'manual', 'api'
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

syncJobSchema.index({ status: 1 });
syncJobSchema.index({ source: 1 });
syncJobSchema.index({ createdAt: -1 });
syncJobSchema.index({ scheduledFor: 1, status: 1 });

// Sync History Schema - tracks individual symbol sync results
const syncHistorySchema = new mongoose.Schema({
  jobId: { type: String, required: true, index: true },
  symbol: { type: String, required: true },
  source: { type: String, required: true, default: 'africanfinancials' },
  status: { type: String, enum: ['success', 'failed', 'skipped'], required: true },
  reportsFound: { type: Number, default: 0 },
  reportsUpdated: { type: Number, default: 0 },
  reportsCreated: { type: Number, default: 0 },
  duration: { type: Number }, // milliseconds
  error: { type: String },
  highlights: {
    latestReportYear: { type: Number },
    latestReportType: { type: String },
    hasFinancialHighlights: { type: Boolean },
  },
  syncedAt: { type: Date, default: Date.now },
});

syncHistorySchema.index({ symbol: 1, syncedAt: -1 });
syncHistorySchema.index({ syncedAt: -1 });
syncHistorySchema.index({ status: 1 });

// Sync Schedule Schema - for configuring automated sync schedules
const syncScheduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  source: { type: String, required: true, default: 'africanfinancials' },
  isActive: { type: Boolean, default: true },
  cronExpression: { type: String }, // e.g., "0 */3 * * *" for every 3 hours
  intervalHours: { type: Number, default: 3 },
  batchSize: { type: Number, default: 20 },
  symbolFilter: {
    sectors: [{ type: String }], // Only sync specific sectors
    symbols: [{ type: String }], // Only sync specific symbols
    excludeSymbols: [{ type: String }], // Exclude specific symbols
  },
  lastRunAt: { type: Date },
  nextRunAt: { type: Date },
  runCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

syncScheduleSchema.index({ isActive: 1, nextRunAt: 1 });

// Data Source Registry Schema - for tracking multiple data sources
const dataSourceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  baseUrl: { type: String, required: true },
  type: { type: String, enum: ['scraper', 'api', 'rss'], required: true },
  isActive: { type: Boolean, default: true },
  rateLimit: {
    requestsPerMinute: { type: Number, default: 10 },
    requestsPerHour: { type: Number, default: 100 },
  },
  lastHealthCheck: { type: Date },
  healthStatus: { type: String, enum: ['healthy', 'degraded', 'down', 'unknown'], default: 'unknown' },
  supportedSymbols: [{ type: String }],
  config: { type: mongoose.Schema.Types.Mixed }, // Source-specific configuration
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const SyncJob = mongoose.models.SyncJob || mongoose.model('SyncJob', syncJobSchema);
export const SyncHistory = mongoose.models.SyncHistory || mongoose.model('SyncHistory', syncHistorySchema);
export const SyncSchedule = mongoose.models.SyncSchedule || mongoose.model('SyncSchedule', syncScheduleSchema);
export const DataSource = mongoose.models.DataSource || mongoose.model('DataSource', dataSourceSchema);

export type ISyncJob = {
  _id: mongoose.Types.ObjectId;
  jobId: string;
  source: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  scheduledFor?: Date;
  totalSymbols: number;
  processedSymbols: number;
  successCount: number;
  failureCount: number;
  reportsFound: number;
  batchSize: number;
  currentBatch: number;
  totalBatches: number;
  symbolsToProcess: string[];
  processedSymbolsList: string[];
  errors: Array<{ symbol: string; error: string; timestamp: Date }>;
  metadata: {
    triggeredBy?: string;
    priority: 'low' | 'normal' | 'high';
    retryCount: number;
    maxRetries: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type ISyncHistory = {
  _id: mongoose.Types.ObjectId;
  jobId: string;
  symbol: string;
  source: string;
  status: 'success' | 'failed' | 'skipped';
  reportsFound: number;
  reportsUpdated: number;
  reportsCreated: number;
  duration?: number;
  error?: string;
  highlights?: {
    latestReportYear?: number;
    latestReportType?: string;
    hasFinancialHighlights?: boolean;
  };
  syncedAt: Date;
};

export type ISyncSchedule = {
  _id: mongoose.Types.ObjectId;
  name: string;
  source: string;
  isActive: boolean;
  cronExpression?: string;
  intervalHours: number;
  batchSize: number;
  symbolFilter: {
    sectors?: string[];
    symbols?: string[];
    excludeSymbols?: string[];
  };
  lastRunAt?: Date;
  nextRunAt?: Date;
  runCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type IDataSource = {
  _id: mongoose.Types.ObjectId;
  name: string;
  displayName: string;
  baseUrl: string;
  type: 'scraper' | 'api' | 'rss';
  isActive: boolean;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  lastHealthCheck?: Date;
  healthStatus: 'healthy' | 'degraded' | 'down' | 'unknown';
  supportedSymbols: string[];
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};
