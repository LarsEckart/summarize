export interface FirecrawlScrapeResult {
  markdown: string
  html?: string | null
  metadata?: Record<string, unknown> | null
}

export type ScrapeWithFirecrawl = (
  url: string,
  options?: { timeoutMs?: number }
) => Promise<FirecrawlScrapeResult | null>

export type ConvertHtmlToMarkdown = (args: {
  url: string
  html: string
  title: string | null
  siteName: string | null
  timeoutMs: number
}) => Promise<string>

export interface LinkPreviewDeps {
  fetch: typeof fetch
  scrapeWithFirecrawl: ScrapeWithFirecrawl | null
  apifyApiToken: string | null
  convertHtmlToMarkdown: ConvertHtmlToMarkdown | null
}
