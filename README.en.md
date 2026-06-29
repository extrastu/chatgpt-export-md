# ChatDown

Save single ChatGPT messages or entire conversation sessions as Markdown (.md) files or rich-text PNG (.png) images with one click.

## Screenshots

### Single Message Export

![Single Message Export](images/chatgpt-export-md.png)

### Entire Session Export

![Entire Session Export](images/chatgpt-export-session-md.png)

## Features

- **Multi-Format Export**: Clicking the export button displays a sleek glassmorphic dropdown menu to choose between **Markdown (.md)** files or high-resolution **Rich-Text Images (.png)**.
- **Export Single Message**: Injects an export button into the action bar below each response.
- **Export Entire Session**: Injects a global export button into the top header actions bar (`#conversation-header-actions`) to save the entire conversation history.
- **High-Fidelity DOM Parser**: Includes a built-in, lightweight HTML-to-Markdown engine that supports paragraphs, headings, blockquotes, lists (ordered/unordered), code blocks, GFM tables, and KaTeX mathematical formulas (automatically retaining original LaTeX math syntax).
- **High-Quality Image Rendering**: Powered by `html2canvas-pro`, it strips redundant UI overlays (such as copy/export buttons), supports both light and dark mode styles, and renders a clean, subtle `ChatDown` watermark at the bottom of the exported image.
- **Multilingual UI Support** (`chatgpt.com` / `chat.openai.com`).

## Development & Installation

This project has been refactored into a React + Vite + StyleX architecture. You need to build the project before loading it into your browser:

1. Clone or download this repository.
2. Install dependencies in the project root:
   ```bash
   npm install
   ```
3. Run the build script:
   ```bash
   npm run build
   ```
4. Open your Chromium-based browser (Chrome, Edge, Arc, etc.) and navigate to the extensions page (`chrome://extensions`).
5. Enable **Developer mode** in the top right corner.
6. Click **Load unpacked** and select the **`dist`** directory (the built production asset folder) in the project.

## Project Structure

```
chatdown/
├── dist/                  # Built assets (select this folder when loading unpacked)
├── manifest.json          # Extension manifest configuration
├── vite.config.js         # Vite bundling configuration
├── package.json           # NPM package configuration and scripts
├── icons/                 # Extension icons
├── lib/                   # Dependency libraries (html2canvas-pro)
├── src/                   # React source code
│   ├── content.jsx        # Content script injection and mounting logic
│   ├── content.css        # Main stylesheet & StyleX compilation hook
│   ├── components/        # React components (ExportDropdown, ExportButton, etc.)
│   └── utils/             # Markdown parsers and file saving utilities
└── scripts/
    └── generate-icons.mjs # Generate PNG icons from SVG
```

## Permissions

| Permission       | Purpose                                                             |
| ---------------- | ------------------------------------------------------------------- |
| `clipboardWrite` | Used with the copy flow to read Markdown content from the clipboard |

## License

MIT - extrastu

