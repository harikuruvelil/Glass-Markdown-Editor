import TurndownService from 'turndown'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
})

// Configure turndown to handle task lists properly
turndownService.addRule('taskListItems', {
  filter: function (node) {
    return node.nodeName === 'LI' && node.querySelector('input[type="checkbox"]') !== null
  },
  replacement: function (content, node: any) {
    const checkbox = node.querySelector('input[type="checkbox"]')
    const checked = checkbox && checkbox.checked ? 'x' : ' '
    const text = content.trim().replace(/^\[(?:\s|x|X)\]\s*/, '')
    return `- [${checked}] ${text}\n`
  },
})

// Convert Markdown to HTML for TipTap
export function markdownToHtml(markdown: string): string {
  return md.render(markdown)
}

// Convert HTML from TipTap to Markdown
export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html)
}
