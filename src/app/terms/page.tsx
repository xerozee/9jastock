import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - 9jaStocks',
  description: 'Terms of Service for 9jaStocks Nigerian Stock Exchange Tracker',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: January 2026</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using 9jaStocks ("the Service"), you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              9jaStocks is a Nigerian Stock Exchange (NGX) tracking platform that provides real-time stock data, 
              portfolio management, market analysis, and related financial information services. The Service includes 
              both free and premium subscription tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 18 years old to use this Service.</li>
              <li>You may not share your account with others or allow unauthorized access.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Financial Disclaimer</h2>
            <p className="mb-4">
              <strong className="text-yellow-400">Important:</strong> The information provided on 9jaStocks is for 
              informational purposes only and does not constitute financial advice.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not provide investment, legal, or tax advice.</li>
              <li>Stock prices and data are provided "as is" without warranty of accuracy.</li>
              <li>Past performance does not guarantee future results.</li>
              <li>You should consult a qualified financial advisor before making investment decisions.</li>
              <li>We are not responsible for any financial losses incurred from using our Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Subscription and Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Premium subscriptions are billed monthly or annually as selected.</li>
              <li>Payments are processed securely through Stripe.</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
              <li>Refunds are handled on a case-by-case basis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose.</li>
              <li>Attempt to gain unauthorized access to our systems.</li>
              <li>Scrape, copy, or redistribute our data without permission.</li>
              <li>Interfere with the proper functioning of the Service.</li>
              <li>Use automated systems to access the Service excessively.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
            <p>
              All content, trademarks, and data on 9jaStocks are the property of 9jaStocks or its licensors. 
              You may not reproduce, distribute, or create derivative works without our express permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, 9jaStocks shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, including loss of profits, data, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant changes 
              via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:support@9jastocks.app" className="text-emerald-400 hover:text-emerald-300">
                support@9jastocks.app
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
