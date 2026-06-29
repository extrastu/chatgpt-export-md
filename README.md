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

## 安装与开发

### 🚀 普通用户（直接安装）
本项目仓库中已预先打包编译好了最新的正式代码，放在了 **`dist`** 文件夹中。您无需在本地编译，可直接进行加载：

1. 下载或克隆本项目到本地。
2. 打开 Chrome / Edge / Arc 等 Chromium 浏览器，进入扩展管理页面（如 Chrome 浏览器在地址栏输入 `chrome://extensions`）。
3. 开启右上角的 **「开发者模式」**。
4. 点击左上角的 **「加载已解压的扩展程序 (Load unpacked)」**。
5. 在弹出的文件选择框中，选择本项目中的 **`dist`** 文件夹即可载入使用！

### 🛠️ 开发者（本地构建）
如果您需要修改源码并重新编译项目（本项目采用 React + Vite + StyleX 现代化前端架构）：

1. 在项目根目录下安装依赖：
   ```bash
   npm install
   ```
2. 运行构建命令：
   ```bash
   npm run build
   ```
3. 重新构建后，在扩展管理页面中点击该扩展的「刷新/重新加载」图标即可应用最新代码。

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

