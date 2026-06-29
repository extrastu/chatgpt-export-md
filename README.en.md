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

## Installation & Development

### 🚀 Regular Users (Direct Installation)
The latest production build is pre-compiled and tracked under the **`dist`** directory in this repository. You do not need to compile it yourself:

1. Download or clone this repository to your local machine.
2. Open your Chromium-based browser (Chrome, Edge, Arc, etc.) and navigate to the extensions management page (e.g. type `chrome://extensions` in Chrome's address bar).
3. Enable **"Developer mode"** in the top right corner.
4. Click **"Load unpacked"** in the top left corner.
5. In the file selection pop-up, select the **`dist`** folder of this project to load and activate the extension!

### 🛠️ Developers (Local Building)
If you wish to modify the source code and rebuild the project (which is built using React + Vite + StyleX):

1. Install dependencies in the project root:
   ```bash
   npm install
   ```
2. Run the build script:
   ```bash
   npm run build
   ```
3. After building, click the **Reload/Refresh** icon on the extension card in the extensions page to apply the latest changes.

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

