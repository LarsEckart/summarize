import { describe, expect, it, vi } from 'vitest'
import { createLinkPreviewClient } from '../src/content/index.js'

const htmlResponse = (html: string, status = 200) =>
  new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html' },
  })

describe('link preview extraction (readability preference)', () => {
  it('prefers readability text over noisy nav content', async () => {
    const articleText = 'A'.repeat(400)
    const html = `<!doctype html><html><head><title>Episode</title></head><body>
      <nav><ul><li>Nav Item</li><li>Another</li></ul></nav>
      <article><p>${articleText}</p></article>
    </body></html>`

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.url
      if (url === 'https://example.com') return htmlResponse(html)
      throw new Error(`Unexpected fetch call: ${url}`)
    })

    const client = createLinkPreviewClient({
      fetch: fetchMock as unknown as typeof fetch,
    })

    const result = await client.fetchLinkContent('https://example.com', {
      timeoutMs: 2000,
      firecrawl: 'off',
      format: 'text',
    })

    expect(result.content).toContain(articleText)
    expect(result.content).not.toContain('Nav Item')
  })
})
