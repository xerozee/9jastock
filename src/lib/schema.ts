import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const portfolioItems = pgTable(
  "portfolio_items",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    symbol: varchar("symbol").notNull(),
    addedAt: timestamp("added_at").defaultNow(),
  },
  (table) => [index("IDX_portfolio_user").on(table.userId)]
);

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email").notNull().unique(),
    subscribedAt: timestamp("subscribed_at").defaultNow(),
    isActive: varchar("is_active").default("true"),
  },
  (table) => [index("IDX_newsletter_email").on(table.email)]
);

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

export const newsArticles = pgTable(
  "news_articles",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    title: varchar("title").notNull(),
    summary: varchar("summary"),
    content: varchar("content"),
    url: varchar("url").notNull().unique(),
    source: varchar("source").notNull(),
    category: varchar("category"),
    symbol: varchar("symbol"),
    imageUrl: varchar("image_url"),
    publishedAt: timestamp("published_at"),
    scrapedAt: timestamp("scraped_at").defaultNow(),
  },
  (table) => [
    index("IDX_news_source").on(table.source),
    index("IDX_news_published").on(table.publishedAt),
    index("IDX_news_symbol").on(table.symbol),
  ]
);

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;

export const sentNewsletters = pgTable(
  "sent_newsletters",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    subject: varchar("subject").notNull(),
    content: varchar("content").notNull(),
    recipientCount: varchar("recipient_count"),
    sentAt: timestamp("sent_at").defaultNow(),
    status: varchar("status").default("sent"),
  },
  (table) => [index("IDX_newsletter_sent").on(table.sentAt)]
);

export type SentNewsletter = typeof sentNewsletters.$inferSelect;
export type InsertSentNewsletter = typeof sentNewsletters.$inferInsert;
