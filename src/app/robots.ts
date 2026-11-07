import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://earnix-project.vercel.app"
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/*",
        "/transactions",
        "/transactions/*",
        "/expenses",
        "/expenses/*",
        "/documents",
        "/documents/*",
        "/clients",
        "/clients/*",
        "/tax",
        "/tax/*",
        "/copilot",
        "/copilot/*",
        "/settings",
        "/settings/*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
