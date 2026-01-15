import { NextResponse } from 'next/server';
import { 
  generateAndSaveNewsletter, 
  getActiveSubscribers, 
  saveNewsletterRecord 
} from '@/lib/newsletterComposer';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured. Please set up Resend API key.',
        message: 'To enable email dispatch, configure the Resend integration.',
      }, { status: 503 });
    }
    
    const newsletter = await generateAndSaveNewsletter();
    const subscribers = await getActiveSubscribers();
    
    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscribers to send newsletter to.',
        subscriberCount: 0,
      });
    }
    
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    for (const email of subscribers) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: '9jaStock <newsletter@9jastock.com>',
            to: [email],
            subject: newsletter.subject,
            html: newsletter.htmlContent,
            text: newsletter.textContent,
          }),
        });
        
        if (response.ok) {
          results.sent++;
        } else {
          results.failed++;
          const errorData = await response.json();
          results.errors.push(`${email}: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${email}: ${error instanceof Error ? error.message : 'Send failed'}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    await saveNewsletterRecord(
      newsletter.subject,
      newsletter.htmlContent,
      results.sent
    );
    
    return NextResponse.json({
      success: true,
      message: `Newsletter dispatched to ${results.sent} of ${subscribers.length} subscribers`,
      results: {
        totalSubscribers: subscribers.length,
        sent: results.sent,
        failed: results.failed,
        articleCount: newsletter.articleCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error dispatching newsletter:', error);
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
    message: 'Newsletter dispatch endpoint. Use POST to send the daily newsletter.',
    usage: 'POST /api/newsletter/dispatch',
    note: 'Requires RESEND_API_KEY to be configured for email sending.',
  });
}
