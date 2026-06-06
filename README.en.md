# ChatGPT Message Markdown Exporter

Adds a Markdown export button to the action bar of every ChatGPT response, so you can save a single message as a `.md` file with one click.

## Features

- Injects a Markdown export icon into each ChatGPT response action bar
- Reuses ChatGPT's native **Copy** action, so exported content matches what gets copied to the clipboard
- Names files automatically using the current conversation title plus a timestamp
- Supports both Chinese and English UI (`chatgpt.com` / `chat.openai.com`)

## Installation

1. Clone or download this repository
2. Open your Chromium-based browser (Chrome, Edge, Arc, etc.) and go to the extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the project root directory

## Usage

1. Open [ChatGPT](https://chatgpt.com) and go to any conversation
2. Find the Markdown icon button in the action bar below each response
3. Click the button to download the corresponding `.md` file

Hover over the button for a tooltip. Success, failure, and missing-copy-button states are also shown via the tooltip.

## How It Works

The extension uses a content script to watch DOM changes and inject an export button into each response action bar. When clicked, it:

1. Triggers ChatGPT's built-in copy button
2. Reads the Markdown content from the clipboard
3. Creates a Blob and starts a local download

## Project Structure

```
chatgpt-export-md/
├── manifest.json          # Extension configuration
├── content.js             # Button injection and export logic
├── style.css              # Button styles
├── icons/                 # Extension icons
│   ├── icon.svg
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── scripts/
    └── generate-icons.mjs # Generate PNG icons from SVG
```

## Development

Regenerate icons (install dependencies first):

```bash
npm install sharp
node scripts/generate-icons.mjs
```

After changing code, click **Reload** on the extensions page to apply updates.

## Permissions

| Permission | Purpose |
|------------|---------|
| `clipboardWrite` | Used with the copy flow to read Markdown content from the clipboard |

## Compatibility

- Manifest V3
- Supports `https://chatgpt.com/*` and `https://chat.openai.com/*`

## License

ISC
