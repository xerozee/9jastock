import { NextResponse } from 'next/server';
import { generateAndSaveNewsletter, getActiveSubscribers } from '@/lib/newsletterComposer';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const newsletter = await generateAndSaveNewsletter();
    const subscribers = await getActiveSubscribers();
    
    return NextResponse.json({
      success: true,
      newsletter: {
        subject: newsletter.subject,
        articleCount: newsletter.articleCount,
        previewHtml: newsletter.htmlContent.substring(0, 500) + '...',
      },
      subscriberCount: subscribers.length,
      message: 'Newsletter composed successfully. Ready for dispatch.',
    });
  } catch (error) {
    console.error('Error composing newsletter:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Newsletter compose endpoint. Use POST to generate a newsletter.',
    usage: 'POST /api/newsletter/compose',
  });
}
