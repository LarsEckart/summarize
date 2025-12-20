import fs from 'node:fs/promises'
import { performance } from 'node:perf_hooks'
import { countTokens } from 'gpt-tokenizer'

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node scripts/bench-tokenization.mjs <file>')
  process.exit(1)
}

const text = await fs.readFile(filePath, 'utf8')
const runs = 5

const estimateTokens = Math.ceil(text.length / 4)
console.log(`File: ${filePath}`)
console.log(`Chars: ${text.length.toLocaleString('en-US')}`)
console.log(`Estimate tokens (chars/4): ${estimateTokens.toLocaleString('en-US')}`)

let tokenCount = 0
let totalMs = 0
for (let i = 0; i < runs; i += 1) {
  const start = performance.now()
  tokenCount = countTokens(text)
  totalMs += performance.now() - start
}

console.log(`GPT tokens: ${tokenCount.toLocaleString('en-US')}`)
console.log(`GPT tokenizer avg (${runs}x): ${(totalMs / runs).toFixed(1)}ms`)
