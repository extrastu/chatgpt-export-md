# ChatDown

一键将 ChatGPT 单条消息或整页对话会话保存为 Markdown (.md) 文件或富文本 PNG (.png) 图片。

## 截图

### 单条消息导出

![单条消息导出](images/chatgpt-export-md.png)

### 整页会话导出

![整页会话导出](images/chatgpt-export-session-md.png)

## 功能

- **多格式导出**：点击导出按钮显示精致毛玻璃下拉菜单，支持选择导出为 **Markdown (.md)** 文件或高分辨率 **富文本图片 (.png)**。
- **导出单条回复**：在每条回复的操作栏中注入导出按钮。
- **导出整页会话**：在页面顶部操作栏（`#conversation-header-actions`）中注入全局导出按钮，一键导出全部对话。
- **内置高保真解析**：内置纯 JavaScript 实现的 HTML-to-Markdown 解析器，完美支持标题、列表、引用、表格、代码块以及 KaTeX 数学公式（自动保留 LaTeX 源码）。
- **高品质图片截图**：采用 `html2canvas-pro` 技术，自动去除冗余的 UI 元素，适配亮色与暗色主题，并在底端添加优雅的 `ChatDown` 水印。
- **支持中英文界面**（`chatgpt.com` / `chat.openai.com`）。

## 开发与安装

本项目已重构为 React + Vite + StyleX 现代前端架构。在载入 Chrome 之前需要先执行编译：

1. 克隆或下载本项目
2. 在项目根目录下安装依赖：
   ```bash
   npm install
   ```
3. 运行构建命令：
   ```bash
   npm run build
   ```
4. 打开 Chrome / Edge / Arc 等 Chromium 浏览器，进入扩展管理页（`chrome://extensions`）
5. 开启右上角的「开发者模式」
6. 点击「加载已解压的扩展程序」，选择本项目中的 **`dist`** 目录（构建生成的产物目录）

## 项目结构

```
chatdown/
├── dist/                  # 编译输出目录（加载扩展程序时选择此目录）
├── manifest.json          # 扩展清单配置
├── vite.config.js         # Vite 编译配置文件
├── package.json           # 项目配置与依赖管理
├── icons/                 # 扩展图标
├── lib/                   # 依赖库（html2canvas-pro）
├── src/                   # React 源代码
│   ├── content.jsx        # 挂载挂接入口
│   ├── content.css        # 主样式与 StyleX 混合点
│   ├── components/        # React 组件 (ExportDropdown, ExportButton, etc.)
│   └── utils/             # 高精解析及导出工具包
└── scripts/
    └── generate-icons.mjs # 从 SVG 生成 PNG 图标
```

## 权限说明

| 权限             | 用途                                     |
| ---------------- | ---------------------------------------- |
| `clipboardWrite` | 配合复制流程读取剪贴板中的 Markdown 内容 |

## License

MIT - extrastu

