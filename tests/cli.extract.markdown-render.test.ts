import { Writable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'

import type { ExecFileFn } from '../src/markitdown.js'
import { runCli } from '../src/run.js'

describe('cli --extract markdown render', () => {
  it('renders markdown to ANSI when stdout is a TTY (default --render auto)', async () => {
    const html =
      '<!doctype html><html><head><title>Ok</title></head>' +
      '<body><article><h1>Title</h1><p>Hello</p></article></body></html>'

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.url
      if (url === 'https://example.com') {
        return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } })
      }
      throw new Error(`Unexpected fetch call: ${url}`)
    })

    const execFileMock = vi.fn((_file, _args, _opts, cb) => {
      cb(null, '# Title\n\n[A](https://example.com)\n', '')
    })

    let stdoutText = ''
    const stdout = new Writable({
      write(chunk, _encoding, callback) {
        stdoutText += chunk.toString()
        callback()
      },
    })
    ;(stdout as unknown as { isTTY?: boolean; columns?: number }).isTTY = true
    ;(stdout as unknown as { columns?: number }).columns = 80

    await runCli(['--extract', '--timeout', '2s', 'https://example.com'], {
      env: { UVX_PATH: 'uvx', TERM: 'xterm-256color' },
      fetch: fetchMock as unknown as typeof fetch,
      execFile: execFileMock as unknown as ExecFileFn,
      stdout,
      stderr: new Writable({
        write(_chunk, _encoding, callback) {
          callback()
        },
      }),
    })

    expect(stdoutText).toContain('\u001b]8;;https://example.com')
  })
})

