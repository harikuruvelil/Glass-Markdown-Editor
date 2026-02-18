import MarkdownIt from 'markdown-it'
import { getHighlighter } from 'shiki'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

// Initialize Shiki highlighter
let highlighter: Awaited<ReturnType<typeof getHighlighter>> | null = null

export async function initHighlighter() {
  if (!highlighter) {
    highlighter = await getHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'python', 'rust', 'go', 'java', 'cpp', 'c', 'html', 'css', 'json', 'markdown', 'bash', 'shell', 'yaml', 'toml'],
    })
  }
  return highlighter
}

export function renderMarkdown(content: string): string {
  return md.render(content)
}

export async function renderMarkdownWithHighlighting(content: string, theme: 'light' | 'dark' = 'light'): Promise<string> {
  const hl = await initHighlighter()
  
  // Custom renderer for code blocks
  const originalCode = md.renderer.rules.code_block || ((tokens, idx) => {
    const token = tokens[idx]
    return `<pre><code>${md.utils.escapeHtml(token.content)}</code></pre>`
  })
  
  md.renderer.rules.code_block = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const info = token.info ? token.info.trim() : ''
    const lang = info ? info.split(/\s+/g)[0] : ''
    
    if (lang) {
      try {
        const code = hl.codeToHtml(token.content, {
          lang,
          theme: theme === 'dark' ? 'github-dark' : 'github-light',
        })
        return `<div class="code-block-wrapper">${code}</div>`
      } catch {
        // Fallback to plain code if language not supported
        return `<pre><code class="language-${lang}">${md.utils.escapeHtml(token.content)}</code></pre>`
      }
    }
    
    return originalCode(tokens, idx, options, env, self)
  }
  
  // Custom renderer for inline code
  const originalCodeInline = md.renderer.rules.code_inline || ((tokens, idx) => {
    const token = tokens[idx]
    return `<code>${md.utils.escapeHtml(token.content)}</code>`
  })
  
  md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
    return originalCodeInline(tokens, idx, options, env, self)
  }
  
  return md.render(content)
}

export function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = []
  const idCounts = new Map<string, number>()
  const lines = content.split(/\r?\n/)
  let inCodeFence = false
  let fenceMarker = ''

  for (const line of lines) {
    const trimmed = line.trimStart()

    const fenceOpen = trimmed.match(/^(```+|~~~+)/)
    if (fenceOpen) {
      const marker = fenceOpen[1].startsWith('`') ? '```' : '~~~'
      if (!inCodeFence) {
        inCodeFence = true
        fenceMarker = marker
      } else if (fenceMarker === marker) {
        inCodeFence = false
        fenceMarker = ''
      }
      continue
    }

    if (inCodeFence) {
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,6})[ \t]+(.+?)\s*#*\s*$/)
    if (!headingMatch) {
      continue
    }

    const level = headingMatch[1].length
    const text = headingMatch[2].trim()
    if (!text) {
      continue
    }

    const baseId =
      text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') || `heading-${headings.length + 1}`
    const idCount = (idCounts.get(baseId) || 0) + 1
    idCounts.set(baseId, idCount)
    const id = idCount === 1 ? baseId : `${baseId}-${idCount}`
    headings.push({ level, text, id })
  }

  return headings
}
