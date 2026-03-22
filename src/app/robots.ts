import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapstandard.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/contact", "/terms", "/privacy"],
        disallow: ["/dashboard", "/login", "/register", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
