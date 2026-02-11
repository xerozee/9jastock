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
  companyName: { type: String },
  period: { type: String },
  declarationDate: { type: Date },
  exDividendDate: { type: Date },
  recordDate: { type: Date },
  paymentDate: { type: Date },
  agmDate: { type: Date },
  dividendAmount: { type: Number, required: true },
  dividendType: { type: String, enum: ['interim', 'final', 'special', 'bonus'], default: 'final' },
  currency: { type: String, default: 'NGN' },
  dividendYield: { type: Number },
  bonusShares: { type: String },
  fiscalYear: { type: Number },
  fiscalQuarter: { type: Number },
  qualificationDate: { type: Date },
  closureStart: { type: Date },
  closureEnd: { type: Date },
  eDividendRegistrationUrl: { type: String },
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
  companyName?: string;
  period?: string;
  declarationDate?: Date;
  exDividendDate?: Date;
  recordDate?: Date;
  paymentDate?: Date;
  agmDate?: Date;
  dividendAmount: number;
  dividendType: 'interim' | 'final' | 'special' | 'bonus';
  currency: string;
  dividendYield?: number;
  bonusShares?: string;
  fiscalYear?: number;
  fiscalQuarter?: number;
  qualificationDate?: Date;
  closureStart?: Date;
  closureEnd?: Date;
  eDividendRegistrationUrl?: string;
  source?: string;
  sourceUrl?: string;
  scrapedAt: Date;
};

const financialDocumentSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  companyName: { type: String, required: true },
  documentType: { 
    type: String, 
    required: true,
    enum: ['annual_report', 'interim_report', 'abridged_report', 'presentation', 'circular', 'prospectus']
  },
  year: { type: Number, required: true, index: true },
  period: { type: String, enum: ['FY', 'HY', 'Q1', 'Q2', 'Q3', 'Q4'] },
  title: { type: String, required: true },
  summary: { type: String },
  documentUrl: { type: String, required: true, unique: true },
  sourceUrl: { type: String },
  publishedDate: { type: Date, required: true, index: true },
  
  extractedMetrics: {
    revenue: { type: Number },
    revenueChange: { type: Number },
    operatingProfit: { type: Number },
    operatingProfitChange: { type: Number },
    profitAfterTax: { type: Number },
    profitAfterTaxChange: { type: Number },
    earningsPerShare: { type: Number },
    earningsPerSharePrior: { type: Number },
    totalAssets: { type: Number },
    totalEquity: { type: Number },
    dividendPerShare: { type: Number },
    returnOnEquity: { type: Number },
  },
  
  scrapedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

financialDocumentSchema.index({ symbol: 1, year: -1, documentType: 1 });
financialDocumentSchema.index({ publishedDate: -1 });

export const FinancialDocument = mongoose.models.FinancialDocument || mongoose.model('FinancialDocument', financialDocumentSchema);

const financialDocSyncSchema = new mongoose.Schema({
  syncId: { type: String, default: 'main', unique: true },
  status: { 
    type: String, 
    enum: ['idle', 'running', 'completed', 'error'],
    default: 'idle'
  },
  totalStocks: { type: Number, default: 0 },
  processedStocks: { type: Number, default: 0 },
  successfulStocks: { type: Number, default: 0 },
  failedStocks: { type: Number, default: 0 },
  totalDocuments: { type: Number, default: 0 },
  currentSymbol: { type: String, default: '' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastUpdated: { type: Date, default: Date.now },
  syncErrors: [{ type: String }],
  stocksWithDocs: [{ type: String }],
});

export const FinancialDocSync = mongoose.models.FinancialDocSync || mongoose.model('FinancialDocSync', financialDocSyncSchema);

const afCompanyData2Schema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, index: true },
  originalSymbol: { type: String },
  url: { type: String },
  profile: { type: mongoose.Schema.Types.Mixed },
  dividends: { type: mongoose.Schema.Types.Mixed },
  documents: { type: mongoose.Schema.Types.Mixed },
  found: { type: Boolean, default: true },
  scrapedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
}, { strict: false, timestamps: true });

afCompanyData2Schema.index({ scrapedAt: -1 });
afCompanyData2Schema.index({ originalSymbol: 1 });

export const AFCompanyData2 = mongoose.models.AFCompanyData2 || mongoose.model('AFCompanyData2', afCompanyData2Schema);

export type IFinancialDocument = {
  _id: mongoose.Types.ObjectId;
  symbol: string;
  companyName: string;
  documentType: 'annual_report' | 'interim_report' | 'abridged_report' | 'presentation' | 'circular' | 'prospectus';
  year: number;
  period?: 'FY' | 'HY' | 'Q1' | 'Q2' | 'Q3' | 'Q4';
  title: string;
  summary?: string;
  documentUrl: string;
  sourceUrl?: string;
  publishedDate: Date;
  extractedMetrics?: {
    revenue?: number;
    revenueChange?: number;
    operatingProfit?: number;
    operatingProfitChange?: number;
    profitAfterTax?: number;
    profitAfterTaxChange?: number;
    earningsPerShare?: number;
    earningsPerSharePrior?: number;
    totalAssets?: number;
    totalEquity?: number;
    dividendPerShare?: number;
    returnOnEquity?: number;
  };
  scrapedAt: Date;
  lastUpdated: Date;
};
