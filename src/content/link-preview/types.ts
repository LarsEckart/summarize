export type TranscriptSource =
  | 'youtubei'
  | 'captionTracks'
  | 'yt-dlp'
  | 'apify'
  | 'html'
  | 'unavailable'
  | 'unknown'

export interface TranscriptDiagnostics {
  textProvided: boolean
  provider: TranscriptSource | null
  attemptedProviders: TranscriptSource[]
  notes?: string | null
}

export interface FirecrawlDiagnostics {
  attempted: boolean
  used: boolean
  notes?: string | null
}

export interface MarkdownDiagnostics {
  requested: boolean
  used: boolean
  provider: 'firecrawl' | 'llm' | null
  notes?: string | null
}

export interface ContentFetchDiagnostics {
  strategy: 'firecrawl' | 'html'
  firecrawl: FirecrawlDiagnostics
  markdown: MarkdownDiagnostics
  transcript: TranscriptDiagnostics
}

export interface TranscriptResolution {
  text: string | null
  source: TranscriptSource | null
  diagnostics?: TranscriptDiagnostics
}
