import OpenAI from 'openai';
import { db } from './db';
import { newsArticles, newsletterSubscribers, sentNewsletters, NewsArticle } from './schema';
import { desc, gte, eq } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface NewsletterContent {
  subject: string;
  htmlContent: string;
  textContent: string;
  articleCount: number;
}

export async function getTopNews(hours = 24, limit = 10): Promise<NewsArticle[]> {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const articles = await db.select()
    .from(newsArticles)
    .where(gte(newsArticles.scrapedAt, cutoffDate))
    .orderBy(desc(newsArticles.scrapedAt))
    .limit(limit);
  
  return articles;
}

export async function composeNewsletter(articles: NewsArticle[]): Promise<NewsletterContent> {
  if (articles.length === 0) {
    return {
      subject: '9jaStock Daily: No New Market Updates',
      htmlContent: '<p>No new market news to report today. Check back tomorrow!</p>',
      textContent: 'No new market news to report today. Check back tomorrow!',
      articleCount: 0,
    };
  }

  const articleSummaries = articles.map((a, i) => 
    `${i + 1}. "${a.title}" (Source: ${a.source}${a.symbol ? `, Stock: ${a.symbol}` : ''})
   Summary: ${a.summary || 'No summary available'}`
  ).join('\n\n');

  const prompt = `You are a professional financial newsletter writer for 9jaStock, a Nigerian Stock Exchange tracker platform.

Create an engaging daily newsletter from these news articles about Nigerian stocks:

${articleSummaries}

Requirements:
1. Write a compelling subject line (max 60 chars) that highlights the most important story
2. Create an HTML newsletter with:
   - A brief market overview paragraph (2-3 sentences)
   - Top 3-5 most important stories with brief analysis
   - Key takeaways for investors
   - A closing note encouraging readers to check the platform
3. Use professional but accessible language
4. Include relevant stock symbols where mentioned
5. Format with proper HTML (h2, p, ul, li tags)
6. Keep total length under 800 words

Respond in JSON format:
{
  "subject": "Your subject line here",
  "htmlContent": "<h2>...</h2><p>...</p>...",
  "textContent": "Plain text version of the newsletter"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional financial newsletter writer. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);
    
    return {
      subject: parsed.subject || '9jaStock Daily Market Update',
      htmlContent: wrapInEmailTemplate(parsed.htmlContent || ''),
      textContent: parsed.textContent || '',
      articleCount: articles.length,
    };
  } catch (error) {
    console.error('Error composing newsletter:', error);
    
    const fallbackHtml = `
      <h2>Today's Nigerian Stock Market News</h2>
      <p>Here are the latest updates from the Nigerian Stock Exchange:</p>
      <ul>
        ${articles.slice(0, 5).map(a => `<li><strong>${a.title}</strong> - ${a.summary || ''}</li>`).join('')}
      </ul>
      <p>Visit 9jaStock for more detailed analysis and real-time data.</p>
    `;
    
    return {
      subject: '9jaStock Daily: Market Updates',
      htmlContent: wrapInEmailTemplate(fallbackHtml),
      textContent: articles.slice(0, 5).map(a => `- ${a.title}`).join('\n'),
      articleCount: articles.length,
    };
  }
}

function wrapInEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>9jaStock Newsletter</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h2 { color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px; }
    h3 { color: #166534; }
    .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 5px 0 0; opacity: 0.9; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
    .stock-tag { display: inline-block; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .source-tag { display: inline-block; background: #f3f4f6; color: #6b7280; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .cta { background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>9jaStock</h1>
    <p>Your Daily Nigerian Stock Market Update</p>
  </div>
  <div class="content">
    ${content}
    <p style="margin-top: 30px;">
      <a href="https://9jastock.replit.app" class="cta">View Live Market Data</a>
    </p>
  </div>
  <div class="footer">
    <p>You're receiving this because you subscribed to 9jaStock Market Updates.</p>
    <p>&copy; ${new Date().getFullYear()} 9jaStock. All rights reserved.</p>
  </div>
</body>
</html>`;
}

export async function getActiveSubscribers(): Promise<string[]> {
  const subscribers = await db.select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.isActive, 'true'));
  
  return subscribers.map(s => s.email);
}

export async function saveNewsletterRecord(
  subject: string,
  content: string,
  recipientCount: number
): Promise<void> {
  await db.insert(sentNewsletters).values({
    subject,
    content,
    recipientCount: recipientCount.toString(),
    status: 'sent',
  });
}

export async function generateAndSaveNewsletter(): Promise<NewsletterContent> {
  const articles = await getTopNews(24, 15);
  const newsletter = await composeNewsletter(articles);
  return newsletter;
}
