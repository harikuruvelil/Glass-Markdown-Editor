# Product Spec: MarkdownView — A Native Markdown Viewer & Editor for Windows

**Version:** 1.0  
**Date:** February 17, 2026  
**Platform:** Windows 10/11 (standalone desktop app)

---

## 1. Overview

**MarkdownView** is a lightweight, standalone Windows desktop application for viewing and editing Markdown (.md) files. It renders Markdown in its proper formatted form — no raw syntax symbols visible to the user. The app should feel like a modern, premium notes app (comparable to Windows Notepad / Apple Notes) but purpose-built for Markdown files.

The visual design should follow an **Apple-inspired "Liquid Glass" aesthetic** — translucent panels, soft depth, smooth animations, vibrant yet tasteful accent colors, and rounded UI elements.

---

## 2. Goals

- **Primary:** Let users open any `.md` file on Windows and immediately see it rendered beautifully — no raw `#`, `*`, `>`, etc.
- **Secondary:** Allow inline editing that preserves the underlying Markdown format. Users type in a rich-text-like view, and the file saves as valid `.md`.
- **Tertiary:** Match the simplicity and reliability of Windows Notepad, but with a visually elevated, modern interface.

---

## 3. Target User

- Windows users who encounter Markdown files (READMEs, docs, notes) and want to read them without installing a full IDE or code editor.
- Users who want a beautiful, simple notes-like app that happens to work with Markdown.
- Non-technical users who don't want to see or understand Markdown syntax.

---

## 4. Core Features

### 4.1 File Handling

| Feature | Details |
|---|---|
| **Open files** | Open `.md` and `.markdown` files via double-click (file association), File > Open, or drag-and-drop onto the window. |
| **Save** | Ctrl+S saves in-place. File always saves as valid Markdown (`.md`). |
| **Save As** | Ctrl+Shift+S to save a copy with a new name/location. |
| **New file** | Ctrl+N creates a blank Markdown document. |
| **Recent files** | Track and display recently opened files in the File menu and/or a start screen. |
| **Auto-save** | Optional auto-save with a configurable interval (default: 30 seconds). Unsaved changes indicated with a dot or marker in the title bar. |
| **File association** | On install, offer to register as the default app for `.md` and `.markdown` files. |
| **Drag & drop** | Drag a file onto the app window or icon to open it. |

### 4.2 Rendered View (Default)

The default and primary view. Markdown is rendered into styled, formatted content — the user never sees raw syntax unless they choose to.

**Supported Markdown elements:**

- **Headings** (H1–H6) — rendered with appropriate font sizes, weights, and spacing
- **Bold**, *italic*, ~~strikethrough~~, `inline code`
- Ordered and unordered lists (including nested lists)
- Checklists / task lists (`- [ ]` / `- [x]`)
- Blockquotes
- Code blocks with syntax highlighting (language-aware)
- Horizontal rules
- Links (clickable, open in default browser)
- Images (rendered inline; support both local paths and URLs)
- Tables (rendered as styled HTML-like tables)
- Footnotes
- Math/LaTeX (optional, nice-to-have via KaTeX or similar)

### 4.3 WYSIWYG Editing

Users can click into the rendered view and edit directly. Their edits are translated back into valid Markdown on save.

| Behavior | Details |
|---|---|
| **Inline editing** | Click anywhere in the rendered view to place a cursor and type. Text input is interpreted contextually (e.g., typing inside a bold section keeps the text bold). |
| **Formatting toolbar** | A minimal floating or top-bar toolbar appears on text selection with options: Bold, Italic, Strikethrough, Code, Heading level, Link, List type. |
| **Keyboard shortcuts** | Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (insert link), Ctrl+Shift+K (code), Tab (indent list), Shift+Tab (outdent list), etc. |
| **Undo/Redo** | Ctrl+Z / Ctrl+Y with full undo history for the session. |
| **Markdown integrity** | All edits produce clean, standard Markdown. No proprietary formatting. The `.md` file should remain perfectly valid and portable. |

### 4.4 Raw Markdown View (Toggle)

- A secondary toggle to show the raw Markdown source in a monospaced editor.
- Ctrl+Shift+M or a toggle button to switch between Rendered and Raw views.
- Syntax highlighting in raw view (headings, bold, links, etc. colorized).
- Edits in raw view are reflected in rendered view and vice versa.

### 4.5 Notepad-Parity Features

Match the everyday utility of Windows Notepad:

- **Find & Replace** — Ctrl+F / Ctrl+H with match case and whole word options
- **Word wrap** — Toggleable, on by default
- **Zoom** — Ctrl+Scroll or Ctrl+Plus/Minus to zoom the rendered view (persist per-session)
- **Line/word count** — Shown in the status bar
- **Character encoding** — UTF-8 by default; handle other encodings gracefully
- **Print** — Ctrl+P to print the rendered (formatted) view
- **Status bar** — Show word count, character count, line count, cursor position, and encoding

---

## 5. User Interface & Visual Design

### 5.1 Design Language: Liquid Glass

The UI should evoke Apple's "Liquid Glass" design language adapted for Windows:

| Element | Treatment |
|---|---|
| **Window chrome** | Translucent/frosted glass title bar and sidebar. Subtle blur effect on the background behind the app window (if the OS supports it, e.g., Windows Mica/Acrylic material). |
| **Background** | A soft, light off-white or very pale gradient as the default canvas. Dark mode uses a deep charcoal with subtle translucency. |
| **Panels & cards** | Rounded corners (12–16px radius). Subtle drop shadows. Semi-transparent backgrounds with blur. |
| **Accent colors** | A refined, muted palette — soft blues, teals, lavenders. Used sparingly for links, active states, selection highlights, and toolbar icons. |
| **Typography** | Clean sans-serif for UI elements (e.g., Segoe UI Variable or Inter). Rendered Markdown uses a highly readable serif or sans-serif body font (configurable). Code blocks use a quality monospace font (e.g., Cascadia Code, JetBrains Mono, or Fira Code). |
| **Animations** | Smooth, subtle transitions for panel switches, toolbar appearance, hover states. No jarring or abrupt UI changes. Ease-in-out curves, 150–250ms duration. |
| **Icons** | Rounded, line-style icons (SF Symbols–like). Consistent stroke weight. |
| **Scrollbar** | Thin, rounded, auto-hiding scrollbar that appears on hover/scroll. |
| **Toolbar** | Floating or top-anchored with pill-shaped buttons, slight glass effect behind it. |
| **Sidebar (optional)** | If a file browser or outline sidebar is included, it should be a frosted glass panel that slides in/out smoothly. |

### 5.2 Layout

```
┌──────────────────────────────────────────────────────┐
│  [Icon] MarkdownView — filename.md        [─ □ ✕]   │  ← Frosted glass title bar
├────────┬─────────────────────────────────────────────┤
│        │                                             │
│  Out-  │   Rendered Markdown Content Area            │  ← Main canvas
│  line  │                                             │
│  Side  │   # Heading                                 │
│  bar   │   Paragraph text with **bold** rendered.    │
│  (opt) │                                             │
│        │   - List item one                           │
│        │   - List item two                           │
│        │                                             │
│        │   > Blockquote styled nicely                │
│        │                                             │
├────────┴─────────────────────────────────────────────┤
│  Words: 342 | Lines: 28 | UTF-8 | Ln 12, Col 4      │  ← Status bar
└──────────────────────────────────────────────────────┘
```

### 5.3 Theming

- **Light mode** (default): Soft white/cream canvas, dark text, muted accent colors.
- **Dark mode**: Deep charcoal/near-black canvas, light text, same accent palette adjusted for contrast.
- **System-follow**: Automatically match the Windows system theme.
- Theme toggle accessible via settings or a quick-access button in the title bar.

---

## 6. Outline Sidebar (Optional but Recommended)

- Auto-generated from headings in the document.
- Clicking a heading scrolls the rendered view to that section.
- Collapsible. Hidden by default; toggled via Ctrl+Shift+O or a button.
- Frosted glass background, matching the Liquid Glass aesthetic.

---

## 7. Settings / Preferences

Accessible via a gear icon or File > Preferences:

| Setting | Options |
|---|---|
| **Theme** | Light / Dark / System |
| **Font family** | Dropdown for body text font |
| **Font size** | Slider or input (default: 16px) |
| **Code font** | Dropdown for monospace font |
| **Auto-save** | On/Off + interval |
| **Default view** | Rendered / Raw |
| **Spell check** | On/Off |
| **Word wrap** | On/Off |
| **File associations** | Register/unregister as default for `.md` |

---

## 8. Keyboard Shortcuts Summary

| Shortcut | Action |
|---|---|
| Ctrl+N | New file |
| Ctrl+O | Open file |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save As |
| Ctrl+P | Print |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+K | Insert link |
| Ctrl+Shift+K | Inline code |
| Ctrl+F | Find |
| Ctrl+H | Find & Replace |
| Ctrl+Shift+M | Toggle Rendered / Raw view |
| Ctrl+Shift+O | Toggle outline sidebar |
| Ctrl+Plus/Minus | Zoom in/out |
| Ctrl+0 | Reset zoom |

---

## 9. Technical Considerations

### 9.1 Framework Suggestions

- **Electron** or **Tauri** for cross-platform packaging as a standalone `.exe` / MSIX installer.
  - Tauri preferred for smaller bundle size and native performance.
- **Rendering engine:** Use a proven Markdown parser (e.g., `markdown-it`, `remark`, or `unified`) with a WYSIWYG editing layer (e.g., ProseMirror, TipTap, or Milkdown).
- **Syntax highlighting:** Use `highlight.js` or `Shiki` for code blocks.
- **Glass effects:** Use Windows Mica/Acrylic APIs (via Tauri or Electron plugins) for native translucency. Fallback to CSS `backdrop-filter: blur()` if needed.

### 9.2 Installer & Distribution

- Ship as a standalone `.exe` installer or `.msix` package.
- No account required. No cloud. Fully offline.
- First-run wizard offering file association setup.
- Minimal install footprint (target: < 100 MB).

### 9.3 Performance

- Instant startup (< 2 seconds to usable window).
- Handle large Markdown files (10,000+ lines) without lag.
- Smooth scrolling and real-time rendering during edits.

---

## 10. Out of Scope (v1)

These are explicitly not included in v1 to keep scope tight:

- Multi-tab or multi-window editing (single document at a time is fine)
- Cloud sync or accounts
- Collaboration / real-time co-editing
- Plugin or extension system
- Export to PDF/HTML/DOCX (nice-to-have for v2)
- Mobile or macOS versions
- Markdown-specific templates or boilerplate generators
- Version history / Git integration

---

## 11. Success Criteria

- A user can double-click any `.md` file on Windows and see it rendered beautifully within 2 seconds.
- A user can edit the rendered content, save, and reopen the file in any other Markdown editor with zero formatting loss.
- The app feels as simple as Notepad but looks as polished as a modern macOS/iOS app.
- No learning curve — anyone who can use a text editor can use this app immediately.

---

## 12. Summary

MarkdownView is a dead-simple, beautiful, standalone Windows app for reading and editing Markdown files. It hides the syntax, shows the formatted result, and lets users edit in-place — all while saving as standard `.md`. The interface draws from Apple's Liquid Glass design language to deliver a premium, modern feel on Windows. Nothing more, nothing less.
