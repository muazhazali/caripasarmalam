import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://pasarmalam.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api"],
    },
    sitemap: `${base}/sitemap.xml`,
    // Cloudflare Content-signal directives (commented to avoid Google Search Console errors)
    // Content-signal: search=yes,ai-train=no
    // These directives are for Cloudflare's AI training policies
    // and are not part of the standard robots.txt specification
  };
}
