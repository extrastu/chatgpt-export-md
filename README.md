# ChatGPT Message Markdown Exporter

为 ChatGPT 每条回复的操作栏添加 Markdown 导出按钮，一键将单条消息保存为 `.md` 文件。

## 功能

- 在每条 ChatGPT 回复的操作栏中注入 Markdown 导出图标
- 复用 ChatGPT 原生「复制」能力，导出内容与复制到剪贴板的内容一致
- 自动以当前对话标题 + 时间戳命名文件
- 支持中英文界面（`chatgpt.com` / `chat.openai.com`）

## 安装

1. 克隆或下载本项目
2. 打开 Chrome / Edge / Arc 等 Chromium 浏览器，进入扩展管理页：
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」，选择本项目根目录

## 使用

1. 打开 [ChatGPT](https://chatgpt.com) 并进入任意对话
2. 在每条回复下方的操作栏中，找到 Markdown 图标按钮
3. 点击按钮，浏览器会自动下载对应的 `.md` 文件

悬停按钮可查看提示；导出成功、失败或未找到复制按钮时，会通过 tooltip 给出反馈。

## 工作原理

扩展通过 Content Script 监听页面 DOM 变化，在回复操作栏中插入导出按钮。点击后会：

1. 触发 ChatGPT 自带的复制按钮
2. 从剪贴板读取 Markdown 内容
3. 生成 Blob 并触发本地下载

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

| 权限 | 用途 |
|------|------|
| `clipboardWrite` | 配合复制流程读取剪贴板中的 Markdown 内容 |

## 兼容性

- Manifest V3
- 支持 `https://chatgpt.com/*` 与 `https://chat.openai.com/*`

## License

ISC
