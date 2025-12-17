import type { ConvertHtmlToMarkdown } from '../content/link-preview/deps.js'

const DEFAULT_GATEWAY_MODEL = 'google/gemini-3-flash'
const DEFAULT_GOOGLE_MODEL = 'gemini-3-flash'
const DEFAULT_OPENAI_MODEL = 'gpt-5.2'

const MAX_HTML_INPUT_CHARACTERS = 200_000

function buildHtmlToMarkdownPrompt({
  url,
  title,
  siteName,
  html,
}: {
  url: string
  title: string | null
  siteName: string | null
  html: string
}): { system: string; prompt: string } {
  const system = `You convert HTML into clean GitHub-Flavored Markdown.

Rules:
- Output ONLY Markdown (no JSON, no explanations, no code fences).
- Keep headings, lists, code blocks, blockquotes.
- Preserve links as Markdown links when possible.
- Remove navigation, cookie banners, footers, and unrelated page chrome.
- Do not invent content.`

  const prompt = `URL: ${url}
Site: ${siteName ?? 'unknown'}
Title: ${title ?? 'unknown'}

HTML:
"""
${html}
"""
`

  return { system, prompt }
}

export function createHtmlToMarkdownConverter({
  aiGatewayApiKey,
  googleApiKey,
  openaiApiKey,
  fetchImpl,
}: {
  aiGatewayApiKey: string | null
  googleApiKey: string | null
  openaiApiKey: string | null
  fetchImpl: typeof fetch
}): ConvertHtmlToMarkdown {
  return async ({ url, html, title, siteName, timeoutMs }) => {
    const trimmedHtml =
      html.length > MAX_HTML_INPUT_CHARACTERS ? html.slice(0, MAX_HTML_INPUT_CHARACTERS) : html
    const { system, prompt } = buildHtmlToMarkdownPrompt({
      url,
      title,
      siteName,
      html: trimmedHtml,
    })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const { generateText } = await import('ai')

      if (aiGatewayApiKey) {
        const { createGateway } = await import('ai')
        const gateway = createGateway({ apiKey: aiGatewayApiKey, fetch: fetchImpl })
        const result = await generateText({
          model: gateway(DEFAULT_GATEWAY_MODEL),
          system,
          prompt,
          temperature: 0,
          maxOutputTokens: 8192,
          abortSignal: controller.signal,
        })
        return result.text
      }

      if (googleApiKey) {
        const { createGoogleGenerativeAI } = await import('@ai-sdk/google')
        const google = createGoogleGenerativeAI({ apiKey: googleApiKey, fetch: fetchImpl })
        const result = await generateText({
          model: google(DEFAULT_GOOGLE_MODEL),
          system,
          prompt,
          temperature: 0,
          maxOutputTokens: 8192,
          abortSignal: controller.signal,
        })
        return result.text
      }

      if (openaiApiKey) {
        const { createOpenAI } = await import('@ai-sdk/openai')
        const openai = createOpenAI({ apiKey: openaiApiKey, fetch: fetchImpl })
        const result = await generateText({
          model: openai(DEFAULT_OPENAI_MODEL),
          system,
          prompt,
          temperature: 0,
          maxOutputTokens: 8192,
          abortSignal: controller.signal,
        })
        return result.text
      }

      throw new Error('No LLM API key configured for HTML→Markdown conversion')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('HTML→Markdown conversion timed out')
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }
}
