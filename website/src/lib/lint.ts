// Finds likely mistakes in ArchieML, the same checks the app's Issues tab runs.
export type Issue = { line: number; severity: 'error' | 'warning' | 'info'; message: string }

type Block = { type: '[' | '{'; label: string; line: number; keys: Map<string, number>; firstKey: string | null; freeform: boolean; simple: boolean }

const NAME = '[^\\s\\[\\]{}:]'
const KEY = new RegExp(`^\\s*(${NAME}+)[ \\t]*:(.*)$`)
const COMMAND = /^\s*:[ \t]*(endskip|ignore|skip|end)/i
const SCOPE = new RegExp(`^\\s*(\\[|\\{)[ \\t]*([+.]*)[ \\t]*(${NAME}*)[ \\t]*(\\]|\\})`)
const BULLET = /^\s*\*/

export const lint = (input: string): Issue[] => {
  const issues: Issue[] = []
  const lines = input.split(/\r\n|\r|\n/)
  let stack: Block[] = []
  const rootKeys = new Map<string, number>()
  let skipLine: number | null = null
  let hasValue = false
  const add = (line: number, severity: Issue['severity'], message: string) => issues.push({ line, severity, message })
  const closer = (t: '[' | '{') => (t === '[' ? '[]' : '{}')
  const unclosed = (b: Block) => add(b.line, 'warning', `${b.label} is never closed with ${closer(b.type)}`)

  lines.forEach((line, i) => {
    const n = i + 1
    const command = COMMAND.exec(line)
    if (command) {
      const name = command[1].toLowerCase()
      if (name === 'skip') { if (skipLine === null) skipLine = n; hasValue = false }
      else if (name === 'endskip') { if (skipLine === null) add(n, 'warning', ':endskip without a :skip before it'); skipLine = null }
      else if (skipLine === null && name === 'end') { if (!hasValue) add(n, 'warning', ':end has no value above it to close'); hasValue = false }
      return
    }
    if (skipLine !== null) return

    const scope = SCOPE.exec(line)
    if (scope) {
      const type = scope[1] as '[' | '{'
      const flags = scope[2]
      const name = scope[3]
      hasValue = false
      if ((type === '[') !== (scope[4] === ']')) add(n, 'error', `Mismatched brackets: opens with ${type} but closes with ${scope[4]}`)
      if (!name) {
        const open = stack.pop()
        if (!open) add(n, 'warning', `${closer(type)} closes nothing`)
        else if (open.type !== type) add(n, 'error', `${closer(type)} is closing ${open.label} (line ${open.line})`)
        return
      }
      if (!flags.includes('.')) { stack.forEach(unclosed); stack = [] }
      const label = type === '[' ? `[${flags}${name}]` : `{${flags}${name}}`
      const parent = stack[stack.length - 1]
      stack.push({ type, label, line: n, keys: new Map(), firstKey: null, freeform: flags.includes('+') || Boolean(parent?.freeform && type === '{'), simple: false })
      return
    }

    const block = stack[stack.length - 1]
    if (BULLET.test(line) && block?.type === '[' && !block.freeform && block.firstKey === null) { block.simple = true; hasValue = true; return }
    const key = KEY.exec(line)
    if (key && !block?.simple) {
      hasValue = true
      if (block?.freeform) return
      const keys = block ? block.keys : rootKeys
      if (block?.type === '[') {
        if (block.firstKey === null) block.firstKey = key[1]
        else if (key[1] === block.firstKey) keys.clear()
      }
      if (keys.has(key[1])) add(n, 'warning', `Duplicate key "${key[1]}" overwrites line ${keys.get(key[1])}`)
      keys.set(key[1], n)
    }
  })

  if (skipLine !== null) add(skipLine, 'error', ':skip has no :endskip, so everything after it is ignored')
  stack.forEach(unclosed)
  return issues.sort((a, b) => a.line - b.line)
}
