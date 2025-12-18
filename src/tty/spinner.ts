const CLEAR_LINE = '\u001b[2K'

export function startSpinner({
  text,
  enabled,
  write,
}: {
  text: string
  enabled: boolean
  write: (data: string) => void
}): { stop: () => void; setText: (next: string) => void } {
  if (!enabled) {
    return { stop: () => {}, setText: () => {} }
  }

  const frames = ['|', '/', '-', '\\']
  let index = 0
  let currentText = text

  const render = () => {
    const frame = frames[index] ?? '|'
    index = (index + 1) % frames.length
    write(`\r${CLEAR_LINE}${frame} ${currentText}`)
  }

  render()
  const timer = setInterval(render, 90)
  timer.unref?.()

  let stopped = false
  const stop = () => {
    if (stopped) return
    stopped = true
    clearInterval(timer)
    write(`\r${CLEAR_LINE}`)
  }

  const setText = (next: string) => {
    currentText = next
    render()
  }

  return { stop, setText }
}

