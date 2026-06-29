# ChatGPT Message Markdown Exporter

为 ChatGPT 回复操作栏和页面顶部操作栏添加 Markdown 导出按钮，一键将单条消息或整页对话会话保存为 `.md` 文件。

## 截图

### 单条消息导出

![单条消息导出](images/chatgpt-export-md.png)

### 整页会话导出

![整页会话导出](images/chatgpt-export-session-md.png)

## 功能

- **导出单条回复**：在每条 ChatGPT 回复的操作栏中注入 Markdown 导出图标，复用 ChatGPT 原生「复制」能力，确保格式精准。
- **导出整页会话**：在页面顶部操作栏（`#conversation-header-actions`）中注入全局导出图标，一键导出全部对话。
- **内置高保真解析**：内置纯 JavaScript 实现的 HTML-to-Markdown 解析器，完美支持标题、列表、引用、表格、代码块以及 KaTeX 数学公式。
- **智能命名**：自动以当前对话标题 + 时间戳命名下载文件。
- **支持中英文界面**（`chatgpt.com` / `chat.openai.com`）。

## 安装

1. 克隆或下载本项目
2. 打开 Chrome / Edge / Arc 等 Chromium 浏览器，进入扩展管理页：
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」，选择本项目根目录

## 使用

1. 打开 [ChatGPT](https://chatgpt.com) 并进入任意对话
2. **导出单条消息**：在单条回复下方的操作栏中，找到并点击 Markdown 图标按钮。
3. **导出整页会话**：在页面顶部操作栏右上角（分享按钮旁边），找到并点击全局 Markdown 图标按钮。
4. 浏览器会自动下载对应的 `.md` 文件。

悬停按钮可查看提示；导出成功或失败时，会通过 tooltip 给出即时反馈。

## 工作原理

扩展通过 Content Script 监听页面 DOM 变化，动态注入导出按钮。点击后的导出流程为：

- **单条消息导出**：
  1. 触发 ChatGPT 该消息自带的复制按钮
  2. 从系统剪贴板读取导出的 Markdown 文本内容
  3. 生成 Blob 并触发本地下载
- **整页会话导出**：
  1. 遍历当前页面的所有对话 turns（包含 user 与 assistant 角色）
  2. 使用内置高保真解析算法，递归将会话 DOM 结构（含段落、代码块、列表、表格及 LaTeX 公式等）转化为标准 GFM 格式 Markdown
  3. 合并全文本，生成 Blob 并触发下载（此导出不经过系统剪贴板，不影响用户剪贴板数据）

## 项目结构

```
chatgpt-export-md/
├── manifest.json          # 扩展配置
├── content.js             # 注入按钮与导出逻辑
├── style.css              # 按钮样式
├── icons/                 # 扩展图标
│   ├── icon.svg
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── scripts/
    └── generate-icons.mjs # 从 SVG 生成 PNG 图标
```

## 开发

重新生成图标（需先安装依赖）：

```bash
npm install sharp
node scripts/generate-icons.mjs
```

修改代码后，在扩展管理页点击「重新加载」即可生效。

## 权限说明

| 权限             | 用途                                     |
| ---------------- | ---------------------------------------- |
| `clipboardWrite` | 配合复制流程读取剪贴板中的 Markdown 内容 |

## 兼容性

- Manifest V3
- 支持 `https://chatgpt.com/*` 与 `https://chat.openai.com/*`

## License

ISC
