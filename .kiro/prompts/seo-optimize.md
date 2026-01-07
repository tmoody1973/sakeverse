# SEO Optimization Prompt

Optimize Sakécosm for Google search rankings using SEO best practices.

## Instructions

You are an SEO expert specializing in Next.js applications. Your task is to optimize Sakécosm for maximum search visibility and ranking.

### 1. Analyze Current State

Review these files for SEO opportunities:
- `app/layout.tsx` - Root metadata
- `app/page.tsx` - Homepage
- `app/*/page.tsx` - All route pages
- `public/` - Static assets (robots.txt, sitemap.xml)
- `next.config.js` - SEO configuration

### 2. SEO Checklist

#### **Meta Tags & Metadata**
- [ ] Unique, descriptive title tags (50-60 characters)
- [ ] Compelling meta descriptions (150-160 characters)
- [ ] Open Graph tags for social sharing
- [ ] Twitter Card tags
- [ ] Canonical URLs
- [ ] Language tags (hreflang for Japanese content)
- [ ] Favicon and app icons

#### **Structured Data (Schema.org)**
- [ ] Organization schema
- [ ] WebSite schema with search action
- [ ] BreadcrumbList for navigation
- [ ] Product schema for sake items
- [ ] Course schema for learning content
- [ ] PodcastSeries and PodcastEpisode schema
- [ ] Review/Rating schema
- [ ] FAQPage schema

#### **Content Optimization**
- [ ] Keyword-rich headings (H1, H2, H3)
- [ ] Alt text for all images
- [ ] Descriptive URLs (slugs)
- [ ] Internal linking strategy
- [ ] Content freshness (updated dates)
- [ ] Long-form content (1000+ words for key pages)

#### **Technical SEO**
- [ ] robots.txt configuration
- [ ] XML sitemap generation
- [ ] Page speed optimization
- [ ] Mobile responsiveness
- [ ] Core Web Vitals (LCP, FID, CLS)
- [ ] HTTPS enforcement
- [ ] Structured URLs
- [ ] 404 error handling

#### **Rich Snippets**
- [ ] FAQ snippets
- [ ] How-to snippets
- [ ] Recipe snippets (for sake pairings)
- [ ] Video snippets (for podcasts)
- [ ] Product snippets (for sake catalog)
- [ ] Review snippets

### 3. Target Keywords

**Primary Keywords:**
- "sake discovery"
- "sake sommelier AI"
- "learn about sake"
- "sake recommendations"
- "Japanese sake guide"

**Secondary Keywords:**
- "sake pairing"
- "sake types explained"
- "sake for wine lovers"
- "sake tasting notes"
- "sake brewery map"
- "sake podcast"
- "sake courses online"

**Long-tail Keywords:**
- "how to choose sake for beginners"
- "best sake for wine drinkers"
- "sake and food pairing guide"
- "learn sake online free"
- "AI sake recommendations"

### 4. Implementation Tasks

#### **A. Update Root Metadata** (`app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://sakecosm.app"),
  title: {
    default: "Sakécosm - AI-Powered Sake Discovery & Learning Platform",
    template: "%s | Sakécosm"
  },
  description: "Discover Japanese sake with Kiki, your AI sommelier. Learn sake fundamentals, get personalized recommendations, explore breweries, and master food pairings. Perfect for wine lovers and sake beginners.",
  keywords: [
    "sake",
    "sake discovery",
    "sake AI",
    "sake sommelier",
    "learn sake",
    "sake recommendations",
    "sake pairing",
    "Japanese sake",
    "sake for wine lovers",
    "sake courses",
    "sake podcast",
    "sake map Japan"
  ],
  authors: [{ name: "Sakécosm", url: "https://sakecosm.app" }],
  creator: "Sakécosm",
  publisher: "Sakécosm",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ja_JP"],
    url: "https://sakecosm.app",
    siteName: "Sakécosm",
    title: "Sakécosm - AI-Powered Sake Discovery & Learning",
    description: "Discover Japanese sake with AI-powered recommendations, interactive learning, and expert guidance. Perfect for wine lovers exploring sake.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sakécosm - AI Sake Discovery Platform",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sakecosm",
    creator: "@sakecosm",
    title: "Sakécosm - AI-Powered Sake Discovery",
    description: "Discover Japanese sake with AI-powered recommendations and interactive learning.",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: "https://sakecosm.app",
    languages: {
      "en-US": "https://sakecosm.app",
      "ja-JP": "https://sakecosm.app/ja",
    },
  },
}
```

#### **B. Add Structured Data** (JSON-LD)

Create `app/components/StructuredData.tsx`:

```typescript
export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Sakécosm",
          url: "https://sakecosm.app",
          logo: "https://sakecosm.app/logo.png",
          description: "AI-powered sake discovery and learning platform",
          sameAs: [
            "https://twitter.com/sakecosm",
            "https://instagram.com/sakecosm",
          ],
        }),
      }}
    />
  )
}

export function WebSiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Sakécosm",
          url: "https://sakecosm.app",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://sakecosm.app/discover?search={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      }}
    />
  )
}
```

#### **C. Create robots.txt** (`public/robots.txt`)

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /settings/

Sitemap: https://sakecosm.app/sitemap.xml
```

#### **D. Generate Sitemap** (`app/sitemap.ts`)

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sakecosm.app'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/podcasts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Add dynamic routes from database
  ]
}
```

#### **E. Add Page-Specific Metadata**

For each route, add unique metadata:

```typescript
// app/discover/page.tsx
export const metadata: Metadata = {
  title: "Discover Sake - Browse 100+ Premium Japanese Sake",
  description: "Explore our curated collection of premium Japanese sake. Filter by type, region, and price. Get AI-powered recommendations based on your taste preferences.",
  openGraph: {
    title: "Discover Premium Japanese Sake | Sakécosm",
    description: "Browse 100+ premium sake with AI-powered recommendations",
    url: "https://sakecosm.app/discover",
  },
}
```

### 5. Content Strategy

#### **Blog/Content Pages** (Future)
- "Sake 101: Complete Beginner's Guide"
- "Wine Lover's Guide to Sake"
- "Top 10 Sake Pairings for Every Meal"
- "Understanding Sake Labels: A Visual Guide"
- "Regional Sake Styles: A Journey Through Japan"

#### **FAQ Page**
Create `app/faq/page.tsx` with structured data:

```typescript
const faqs = [
  {
    question: "What is sake?",
    answer: "Sake is a traditional Japanese alcoholic beverage made from fermented rice..."
  },
  // Add 10-15 common questions
]

// Add FAQPage schema
```

### 6. Performance Optimization

- [ ] Image optimization (next/image)
- [ ] Font optimization (next/font)
- [ ] Code splitting
- [ ] Lazy loading
- [ ] CDN for static assets
- [ ] Compression (gzip/brotli)

### 7. Monitoring & Analytics

- [ ] Google Search Console setup
- [ ] Google Analytics 4
- [ ] Core Web Vitals monitoring
- [ ] Keyword ranking tracking
- [ ] Backlink monitoring

### 8. Local SEO (if applicable)

- [ ] Google Business Profile
- [ ] Local schema markup
- [ ] NAP consistency

## Usage

```bash
# Initial SEO optimization
@seo-optimize

# After adding new features
@seo-optimize "Update SEO for new podcast feature"

# Regular maintenance
@seo-optimize "Refresh metadata and check for improvements"
```

## Success Metrics

Track these KPIs:
- Organic search traffic
- Keyword rankings (top 10 positions)
- Click-through rate (CTR)
- Bounce rate
- Time on page
- Core Web Vitals scores
- Backlinks acquired

## Notes

- Update sitemap after adding new content
- Refresh metadata quarterly
- Monitor Google Search Console for issues
- Test rich snippets with Google's Rich Results Test
- Keep content fresh with regular updates
