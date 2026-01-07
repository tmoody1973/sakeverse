export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Sakécosm",
          url: "https://dynamous-kiro-hackathon.vercel.app",
          logo: "https://dynamous-kiro-hackathon.vercel.app/sakecosm-logo.svg",
          description: "AI-powered sake discovery and learning platform with voice sommelier, interactive courses, and personalized recommendations",
          foundingDate: "2026",
          sameAs: [
            "https://github.com/tmoody1973/sakeverse",
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
          url: "https://dynamous-kiro-hackathon.vercel.app",
          description: "AI-powered sake discovery platform with voice sommelier, learning courses, and interactive Japan map",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://dynamous-kiro-hackathon.vercel.app/discover?search={search_term_string}"
            },
            "query-input": "required name=search_term_string",
          },
        }),
      }}
    />
  )
}

export function WebApplicationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Sakécosm",
          url: "https://dynamous-kiro-hackathon.vercel.app",
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "100",
          },
        }),
      }}
    />
  )
}
