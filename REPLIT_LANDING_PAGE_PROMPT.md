# Replit Prompt: Build 9jastock Marketing Landing Page

## Overview

Build a high-converting marketing landing page for 9jastock - a Nigerian stock market investment app. The landing page should tell a compelling story: what the app does TODAY and the exciting vision of what it's BECOMING.

**Reference:** See `LANDING_PAGE_CONTENT.md` for all copy, content, and section details.

---

## Technical Requirements

### Stack
- Next.js (existing project)
- Tailwind CSS 4 (existing)
- TypeScript
- Responsive (mobile-first)
- Fast loading (< 3 seconds)

### Route
- Create at `/` or `/landing` (replace current home if needed)
- Unauthenticated users see this page
- Authenticated users redirect to `/stocks` or dashboard

---

## Page Sections to Build

Build these sections in order (all content in `LANDING_PAGE_CONTENT.md`):

### 1. Navigation Bar
- Logo (left)
- Links: Features, Pricing, Roadmap (center/right)
- Buttons: Login, "Start Free Trial" (primary CTA)
- Sticky on scroll
- Mobile: hamburger menu

### 2. Hero Section
- Large headline: "The Smartest Way to Invest in Nigeria's Future"
- Subheadline about real-time data and AI
- Two CTAs: "Start 7-Day Free Trial" (primary), "See What's Coming" (secondary, scrolls to roadmap)
- Trust line: "✓ No payment required to explore ✓ Cancel anytime"
- Hero image: App mockup (use existing screenshots or create placeholder)
- Social proof bar with logos/stats

### 3. Problem Section
- Headline: "Investing in Nigeria is Hard. We're Here to Change That."
- 6 pain point cards in a grid (2x3 desktop, 1x6 mobile)
- Each card: icon, title, description
- Optional quote from a user

### 4. Solution Section (Current Features)
- Headline: "Everything You Need. One Powerful App."
- 5 feature blocks, alternating layout (image left/right)
- Each feature: icon, title, description, bullet points, screenshot
- Features: Real-time Data, AI Analysis, Portfolio Tracking, Price Alerts, Technical Analysis

### 5. Vision Section (Coming Soon) ⭐ IMPORTANT
- Headline: "This is Just the Beginning."
- Subheadline about building the future
- 7 "Coming Soon" feature cards with badges
- Each card: [COMING SOON] or [FUTURE] badge, icon, title, description
- Features: Global Markets, Dividends, Corporate Actions, Economic Dashboard, Goals, Academy, Broker Integration
- CTA at bottom: "Join us on this journey"

### 6. Why Join Now Section
- Headline: "Why Join 9jastock Today?"
- Founding Member benefits box with checkmarks
- Live counter: "🔥 X founding member spots remaining" (can be static for now)
- 3 value proposition cards: Start Small Win Big, Learn As You Go, Grow With Us
- Inspirational quote

### 7. Mission Section
- Headline: "More Than an App. A Movement for Financial Freedom."
- Statistics quote about 3% of Nigerians investing
- Two boxes: "The Problem with Nigeria" and "The 9jastock Mission"
- CTA: "Join the Movement"

### 8. Pricing Section
- Headline: "Simple, Transparent Pricing"
- Subheadline about 7-day free trial
- Two pricing cards side by side:
  - **Premium** (⭐ Most Popular): ₦2,999/month, ₦24,999/year
  - **Pro** (🚀 Full Access): ₦7,999/month, ₦79,999/year
- Feature comparison list in each card
- Link for Institutional pricing
- Trust points below cards

### 9. Testimonials Section
- Headline: "What Nigerian Investors Are Saying"
- 3 testimonial cards with quote, author, title, detail
- Stats bar: Portfolio tracked, Active investors, NGX stocks, Rating
- Carousel on mobile

### 10. FAQ Section
- Headline: "Frequently Asked Questions"
- 8 FAQ items as accordion/collapsible
- Questions from `LANDING_PAGE_CONTENT.md`

### 11. Final CTA Section
- Headline: "Start Your Investment Journey Today."
- Subheadline about joining thousands
- Large CTA button: "Start Your 7-Day Free Trial →"
- Trust line: "No credit card required to explore."

### 12. Footer
- 4 columns: Brand (with social icons), Product, Company, Legal
- Copyright with disclaimers

---

## Design Specifications

### Colors
```css
--primary: #008751;      /* Nigerian green */
--secondary: #FFFFFF;
--accent: #FCD116;       /* Nigerian gold */
--text: #1A1A1A;
--background: #F5F5F5;
--card-bg: #FFFFFF;
```

### Typography
- Headlines: Bold, large (text-4xl to text-6xl)
- Subheadlines: Medium weight (text-xl to text-2xl)
- Body: Regular (text-base to text-lg)
- Use existing font stack or Inter/Poppins

### Spacing
- Sections: py-16 to py-24
- Cards: p-6 to p-8
- Consistent gaps (gap-6, gap-8)

### Components to Create

```
/components/landing/
├── Navbar.tsx
├── HeroSection.tsx
├── ProblemSection.tsx
├── SolutionSection.tsx
├── VisionSection.tsx (Coming Soon features)
├── WhyJoinSection.tsx
├── MissionSection.tsx
├── PricingSection.tsx
├── TestimonialsSection.tsx
├── FAQSection.tsx
├── FinalCTASection.tsx
├── Footer.tsx
├── PricingCard.tsx
├── FeatureCard.tsx
├── TestimonialCard.tsx
└── FAQItem.tsx
```

---

## Interactive Elements

### Animations (Subtle)
- Fade in sections on scroll (use Intersection Observer or framer-motion)
- Smooth scroll for anchor links
- Hover effects on cards (slight lift/shadow)
- FAQ accordion animation

### Functionality
- "See What's Coming" scrolls to Vision section
- All "Start Free Trial" buttons link to `/signup` or trial flow
- FAQ accordion (one open at a time)
- Mobile menu toggle
- Sticky navbar on scroll (with background change)

---

## Mobile Responsiveness

### Breakpoints
- Mobile: < 640px (single column)
- Tablet: 640px - 1024px (2 columns where appropriate)
- Desktop: > 1024px (full layout)

### Mobile Specifics
- Stack all cards vertically
- Hero image below text
- Hamburger menu
- Testimonials as horizontal carousel
- Pricing cards stack vertically
- Sticky CTA button at bottom (optional)
- Touch-friendly tap targets (min 44px)

---

## Performance Requirements

- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Lazy load images below fold
- Optimize all images (WebP, proper sizing)
- Minimal JavaScript for animations
- No layout shift (reserve space for images)

---

## SEO Requirements

### Meta Tags
```html
<title>9jastock - The Smartest Way to Invest in Nigeria's Future</title>
<meta name="description" content="Track Nigerian stocks, get AI-powered analysis, and build your portfolio with 9jastock. Real-time NGX data, price alerts, and professional tools for every Nigerian investor." />
```

### Open Graph
```html
<meta property="og:title" content="9jastock - Nigerian Stock Investment App" />
<meta property="og:description" content="Real-time NGX data, AI analysis, portfolio tracking. Your complete investment companion." />
<meta property="og:image" content="/og-image.png" />
<meta property="og:url" content="https://9jastock.com" />
```

### Structured Data
- Organization schema
- FAQ schema for FAQ section
- Product schema for pricing

---

## Assets Needed

### Images
- [ ] Hero mockup (app screenshot on phone)
- [ ] Feature screenshots (5)
- [ ] OG image (1200x630)
- [ ] Favicon (if not exists)

### Icons
- Use Lucide icons (already in project)
- Icons needed: chart, robot/AI, briefcase, bell, trending-up, globe, coins, calendar, building, target, graduation-cap, link

---

## Content Reference

All copy, text, and content is in: **`LANDING_PAGE_CONTENT.md`**

Do NOT write new copy. Use exactly what's in that file.

---

## Testing Checklist

Before considering done:

- [ ] All sections render correctly
- [ ] Mobile responsive (test on real device)
- [ ] All links work
- [ ] All CTAs link to signup/trial
- [ ] Dark mode compatible (if app has dark mode)
- [ ] No console errors
- [ ] Fast loading (< 3s)
- [ ] Images optimized
- [ ] FAQ accordion works
- [ ] Smooth scroll works
- [ ] Navbar sticky works
- [ ] Mobile menu works

---

## Priority Order

If time is limited, build in this order:

1. **Must Have (MVP):**
   - Hero Section
   - Solution Section (current features)
   - Pricing Section
   - Final CTA
   - Basic Navbar & Footer

2. **Should Have:**
   - Vision Section (Coming Soon)
   - Problem Section
   - Why Join Now Section
   - FAQ Section

3. **Nice to Have:**
   - Testimonials
   - Mission Section
   - Animations
   - Founding Member counter

---

## Example Component Structure

```tsx
// components/landing/HeroSection.tsx
export function HeroSection() {
  return (
    <section className="py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              The Smartest Way to Invest in Nigeria's Future
            </h1>
            <p className="mt-6 text-xl text-gray-600">
              Real-time NGX data. AI-powered analysis.
              Your complete investment companion - today and tomorrow.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-green-700 hover:bg-green-800">
                  Start 7-Day Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={scrollToVision}>
                See What's Coming →
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              ✓ No payment required to explore  ✓ Cancel anytime
            </p>
          </div>
          {/* Right: Image */}
          <div className="relative">
            <Image
              src="/hero-mockup.png"
              alt="9jastock app"
              width={500}
              height={600}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Questions?

If anything is unclear, refer to:
1. `LANDING_PAGE_CONTENT.md` - All copy and content
2. `ROADMAP.md` - Product vision and features
3. Existing app design - Match the current styling

Build this landing page to convert visitors into trial users. Make it beautiful, fast, and compelling. The story is: start with NGX today, grow to global markets tomorrow.

Good luck! 🚀
