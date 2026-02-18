# MarkdownView - A Beautiful Markdown Viewer & Editor for Windows

A lightweight, standalone Windows desktop application for viewing and editing Markdown files with an Apple-inspired "Liquid Glass" aesthetic.

## Features

### Core Functionality
- **WYSIWYG Editing**: Edit Markdown in a rich-text-like view with real-time rendering
- **Raw Markdown View**: Toggle between rendered and raw Markdown views
- **File Operations**: Open, save, save as, new file with drag-and-drop support
- **Auto-save**: Configurable auto-save with unsaved changes indicator
- **Recent Files**: Track and quickly access recently opened files

### Markdown Support
- Headings (H1-H6)
- **Bold**, *italic*, ~~strikethrough~~, `inline code`
- Ordered and unordered lists (including nested)
- **Checklists/Task Lists**: Click checkboxes to toggle and auto-save
- Blockquotes
- Code blocks with syntax highlighting
- Links (clickable, open in default browser)
- **Images**: Renders inline with placeholder for broken images
- Tables
- Horizontal rules

### UI/UX Features
- **Liquid Glass Design**: Translucent panels, smooth animations, rounded corners
- **Light/Dark/System Themes**: Automatic theme switching
- **Outline Sidebar**: Auto-generated from document headings
- **Formatting Toolbar**: Floating toolbar appears on text selection
- **Status Bar**: Word count, line count, character count, encoding info

### Notepad-Parity Features
- Find & Replace (Ctrl+F / Ctrl+H)
- Word wrap toggle
- Zoom in/out (Ctrl+Plus/Minus, Ctrl+0 to reset)
- Print support (Ctrl+P)
- Keyboard shortcuts for all common operations

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New file |
| Ctrl+O | Open file |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save As |
| Ctrl+P | Print |
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
| F5 | Toggle word wrap |

## Tech Stack

- **Framework**: Tauri 2.x (Rust backend, Web frontend)
- **Frontend**: React 18 + TypeScript
- **WYSIWYG Editor**: TipTap
- **Markdown Parser**: markdown-it
- **Syntax Highlighting**: Shiki
- **Styling**: Tailwind CSS with custom glass morphism utilities
- **State Management**: Zustand

## Development

### Prerequisites
- Node.js 18+
- Rust (for Tauri backend)
- npm or yarn

### Setup
```bash
npm install
```

### Development
```bash
npm run tauri:dev
```

### Build
```bash
npm run tauri:build
```

## Project Structure

```
markdown-notes-app/
├── src-tauri/          # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs     # Tauri entry point
│   │   └── commands.rs # File I/O commands
│   └── tauri.conf.json
├── src/                # React frontend
│   ├── components/     # UI components
│   ├── stores/         # Zustand stores
│   ├── utils/          # Utilities
│   ├── hooks/          # React hooks
│   └── styles/         # Global styles
└── package.json
```

## License

ISC
