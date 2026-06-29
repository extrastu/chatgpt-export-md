const EXPORT_BTN_CLASS = "chatgpt-export-md-btn";
const EXPORT_BTN_TITLE = "导出为 Markdown";

const EXPORT_SESSION_BTN_CLASS = "chatgpt-export-session-md-btn";
const EXPORT_SESSION_BTN_TITLE = "导出整页会话为 Markdown";

const EXPORT_ICON_SVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M160 213.333333C95.573333 213.333333 42.666667 266.24 42.666667 330.666667v362.666666C42.666667 757.76 95.573333 810.666667 160 810.666667h704c64.426667 0 117.333333-52.906667 117.333333-117.333334v-362.666666c0-64.426667-52.906667-117.333333-117.333333-117.333334h-704z m0 64h704c29.824 0 53.333333 23.509333 53.333333 53.333334v362.666666c0 29.824-23.509333 53.333333-53.333333 53.333334h-704A52.864 52.864 0 0 1 106.666667 693.333333v-362.666666C106.666667 300.842667 130.176 277.333333 160 277.333333z m88.917333 85.333334A56.896 56.896 0 0 0 192 419.584V618.666667a42.666667 42.666667 0 1 0 85.333333 0v-155.413334l54.698667 74.090667a42.666667 42.666667 0 0 0 68.544 0.149333L448 473.92V618.666667a42.666667 42.666667 0 1 0 85.333333 0v-199.082667a56.896 56.896 0 0 0-104.32-31.466667l-62.762666 99.306667-69.76-101.184A56.96 56.96 0 0 0 250.368 362.666667h-1.450667zM725.333333 362.666667a42.666667 42.666667 0 0 0-42.666666 42.666666v106.666667h-31.253334c-27.797333 0-42.730667 32.618667-24.661333 53.717333l71.125333 82.986667a36.181333 36.181333 0 0 0 54.912 0l71.125334-82.986667c18.090667-21.12 3.136-53.717333-24.661334-53.717333H768v-106.666667a42.666667 42.666667 0 0 0-42.666667-42.666666z"/></svg>`;

function setExportButtonIcon(exportBtn, isSession = false) {
  exportBtn.innerHTML = EXPORT_ICON_SVG;
  const title = isSession ? EXPORT_SESSION_BTN_TITLE : EXPORT_BTN_TITLE;
  exportBtn.title = title;
  exportBtn.setAttribute("aria-label", title);
}

function showExportButtonStatus(exportBtn, message, isSession = false) {
  exportBtn.title = message;
  exportBtn.setAttribute("aria-label", message);

  setTimeout(() => {
    setExportButtonIcon(exportBtn, isSession);
  }, 1200);
}

function getActionBars() {
  return document.querySelectorAll('[aria-label="回复操作"], [aria-label="Response actions"]');
}

function downloadMarkdown(content, customTitle = "") {
  const title =
    (customTitle || document.title)
      ?.replace(/ChatGPT/gi, "")
      ?.replace(/[\\/:*?"<>|]/g, "")
      ?.trim() || "chatgpt-message";

  const filename = `${title}-${Date.now()}.md`;

  const blob = new Blob([content], {
    type: "text/markdown;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function findCopyButton(actionBar) {
  return (
    actionBar.querySelector('button[data-testid="copy-turn-action-button"]') ||
    actionBar.querySelector('button[aria-label*="复制"]') ||
    actionBar.querySelector('button[aria-label*="Copy"]')
  );
}

async function exportMarkdown(actionBar, exportBtn) {
  const copyBtn = findCopyButton(actionBar);

  if (!copyBtn) {
    showExportButtonStatus(exportBtn, "未找到复制");
    return;
  }

  const oldClipboard = await navigator.clipboard.readText().catch(() => "");

  copyBtn.click();

  await new Promise((resolve) => setTimeout(resolve, 300));

  const markdown = await navigator.clipboard.readText().catch(() => "");

  if (!markdown || markdown === oldClipboard) {
    showExportButtonStatus(exportBtn, "复制失败");
    return;
  }

  downloadMarkdown(markdown);
  showExportButtonStatus(exportBtn, "已导出");
}

function showExportDropdown(event, triggerBtn, onExportMarkdown, onExportPng) {
  event.preventDefault();
  event.stopPropagation();

  closeAllDropdowns();

  const dropdown = document.createElement("div");
  dropdown.className = "chatgpt-export-dropdown";

  const mdOption = document.createElement("div");
  mdOption.className = "chatgpt-export-dropdown-item";
  mdOption.innerHTML = `
    <svg viewBox="0 0 24 24" class="icon-md"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
    <span>导出为 Markdown (.md)</span>
  `;
  mdOption.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.remove();
    onExportMarkdown();
  });

  const pngOption = document.createElement("div");
  pngOption.className = "chatgpt-export-dropdown-item";
  pngOption.innerHTML = `
    <svg viewBox="0 0 24 24" class="icon-png"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
    <span>导出为图片 (.png)</span>
  `;
  pngOption.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.remove();
    onExportPng();
  });

  dropdown.appendChild(mdOption);
  dropdown.appendChild(pngOption);

  document.body.appendChild(dropdown);

  const rect = triggerBtn.getBoundingClientRect();
  
  // Initially show to get dimensions
  dropdown.style.display = "flex";
  dropdown.style.left = "0px";
  dropdown.style.top = "0px";
  
  const dropdownWidth = dropdown.offsetWidth;
  const dropdownHeight = dropdown.offsetHeight;
  
  let top = rect.bottom + window.scrollY + 6;
  let left = rect.left + window.scrollX;

  if (rect.bottom + dropdownHeight > window.innerHeight + window.scrollY) {
    top = rect.top + window.scrollY - dropdownHeight - 6;
  }
  if (left + dropdownWidth > window.innerWidth + window.scrollX) {
    left = rect.right + window.scrollX - dropdownWidth;
  }

  dropdown.style.top = `${top}px`;
  dropdown.style.left = `${left}px`;
  
  // Trigger transition
  requestAnimationFrame(() => {
    dropdown.style.opacity = "1";
    dropdown.style.transform = "scale(1)";
  });

  setTimeout(() => {
    document.addEventListener("click", closeAllDropdowns);
  }, 0);
}

function closeAllDropdowns() {
  document.querySelectorAll(".chatgpt-export-dropdown").forEach(el => el.remove());
  document.removeEventListener("click", closeAllDropdowns);
}

function downloadPng(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function renderElementToPng(elementToRender, filename, exportBtn, isSession = false) {
  showExportButtonStatus(exportBtn, "正在生成...", isSession);

  const container = document.createElement("div");
  container.className = "chatgpt-export-temp-container " + document.documentElement.className + " " + document.body.className;
  
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.padding = "40px";
  container.style.boxSizing = "border-box";
  
  const bodyBg = window.getComputedStyle(document.body).backgroundColor;
  container.style.backgroundColor = bodyBg || (document.documentElement.classList.contains("dark") ? "#212121" : "#ffffff");
  
  const clone = elementToRender.cloneNode(true);
  
  clone.querySelectorAll(`
    .${EXPORT_BTN_CLASS},
    .${EXPORT_SESSION_BTN_CLASS},
    .chatgpt-export-dropdown,
    button,
    [role="button"],
    [aria-label*="Copy"],
    [aria-label*="复制"],
    .sr-only
  `).forEach(el => el.remove());
  
  container.appendChild(clone);

  // Add watermark at the bottom of the container
  const watermark = document.createElement("div");
  watermark.style.display = "flex";
  watermark.style.justifyContent = "center";
  watermark.style.alignItems = "center";
  watermark.style.marginTop = "32px";
  watermark.style.paddingTop = "16px";
  watermark.style.borderTop = "1px solid rgba(127, 127, 127, 0.15)";
  watermark.style.fontSize = "12px";
  watermark.style.color = "rgba(127, 127, 127, 0.6)";
  watermark.style.fontFamily = "inherit";
  watermark.innerHTML = `Exported via &nbsp;<strong>ChatDown</strong>`;
  container.appendChild(watermark);

  document.body.appendChild(container);
  
  setTimeout(() => {
    html2canvas(container, {
      useCORS: true,
      scale: 2,
      backgroundColor: container.style.backgroundColor,
      logging: false
    }).then((canvas) => {
      downloadPng(canvas, filename);
      showExportButtonStatus(exportBtn, "已导出", isSession);
      container.remove();
    }).catch((err) => {
      console.error("html2canvas failed:", err);
      showExportButtonStatus(exportBtn, "导出失败", isSession);
      container.remove();
    });
  }, 200);
}

function exportMessagePng(turnNode, exportBtn) {
  const title =
    document.title
      ?.replace(/ChatGPT/gi, "")
      ?.replace(/[\\/:*?"<>|]/g, "")
      ?.trim() || "chatgpt-message";
  const filename = `${title}-${Date.now()}.png`;

  renderElementToPng(turnNode, filename, exportBtn, false);
}

function exportSessionPng(exportBtn) {
  const turns = document.querySelectorAll('[data-message-author-role]');
  if (turns.length === 0) {
    showExportButtonStatus(exportBtn, "未找到会话", true);
    return;
  }

  const titleEl = document.querySelector('h1:not([class*="hidden"])') || document.querySelector('[data-testid*="conversation-title"]');
  const chatTitle = titleEl ? titleEl.textContent.trim() : (document.title?.replace(/ChatGPT/gi, "")?.trim() || "chatgpt-session");
  const filename = `${chatTitle.replace(/[\\/:*?"<>|]/g, "")}-${Date.now()}.png`;

  const sessionWrapper = document.createElement("div");
  sessionWrapper.style.display = "flex";
  sessionWrapper.style.flexDirection = "column";
  sessionWrapper.style.gap = "24px";
  
  const header = document.createElement("div");
  header.style.borderBottom = "1px solid rgba(127, 127, 127, 0.2)";
  header.style.paddingBottom = "16px";
  header.style.marginBottom = "8px";
  
  const titleText = document.createElement("h1");
  titleText.textContent = chatTitle;
  titleText.style.fontSize = "28px";
  titleText.style.fontWeight = "bold";
  titleText.style.margin = "0 0 8px 0";
  titleText.style.color = "var(--text-primary, inherit)";
  
  const footerText = document.createElement("p");
  footerText.textContent = `ChatDown 会话导出 • ${new Date().toLocaleString()}`;
  footerText.style.fontSize = "12px";
  footerText.style.margin = "0";
  footerText.style.color = "var(--text-secondary, rgba(127, 127, 127, 0.7))";
  
  header.appendChild(titleText);
  header.appendChild(footerText);
  sessionWrapper.appendChild(header);

  turns.forEach((turn) => {
    const clone = turn.cloneNode(true);
    clone.querySelectorAll(`
      .${EXPORT_BTN_CLASS},
      .${EXPORT_SESSION_BTN_CLASS},
      .chatgpt-export-dropdown,
      button,
      [role="button"],
      [aria-label*="Copy"],
      [aria-label*="复制"],
      .sr-only
    `).forEach(el => el.remove());
    sessionWrapper.appendChild(clone);
  });

  renderElementToPng(sessionWrapper, filename, exportBtn, true);
}

function createExportButton(actionBar) {
  const btn = document.createElement("button");

  btn.className = EXPORT_BTN_CLASS;
  btn.type = "button";
  setExportButtonIcon(btn);

  btn.addEventListener("click", (event) => {
    const turnNode = actionBar.closest('[data-message-author-role]') ||
                     actionBar.closest('article') ||
                     actionBar.closest('div[data-testid*="turn"]') ||
                     actionBar.closest('.group\\/conversation-turn');

    showExportDropdown(
      event,
      btn,
      () => exportMarkdown(actionBar, btn),
      () => {
        const targetNode = turnNode || actionBar.parentElement?.parentElement || actionBar.parentElement;
        exportMessagePng(targetNode, btn);
      }
    );
  });

  return btn;
}

function parseNodeToMarkdown(node) {
  if (node.nodeType === 3) { // Node.TEXT_NODE
    return node.textContent;
  }
  if (node.nodeType !== 1) { // Node.ELEMENT_NODE
    return '';
  }

  const tagName = node.tagName.toLowerCase();

  // If this element has class "katex", parse its LaTeX formula
  if ((node.classList && node.classList.contains('katex')) || tagName === 'math') {
    const annotation = node.querySelector('annotation[encoding="application/x-tex"]');
    if (annotation) {
      const tex = annotation.textContent;
      const isDisplay = node.closest('.katex-display') !== null;
      return isDisplay ? `\n$$\n${tex}\n$$\n` : `$${tex}$`;
    }
  }

  // If it's a code block
  if (tagName === 'pre') {
    const codeEl = node.querySelector('code');
    if (codeEl) {
      let lang = '';
      for (const cls of codeEl.classList) {
        if (cls.startsWith('language-')) {
          lang = cls.replace('language-', '');
          break;
        }
      }
      const codeText = codeEl.textContent || '';
      return `\n\`\`\`${lang}\n${codeText.trimEnd()}\n\`\`\`\n`;
    }
  }

  // Skip buttons, SVGs, or specific UI components
  if (['button', 'svg', 'style', 'script'].includes(tagName)) {
    return '';
  }
  if (node.classList && (node.classList.contains('copy-code-button') || node.classList.contains('sr-only') || node.classList.contains(EXPORT_BTN_CLASS) || node.classList.contains(EXPORT_SESSION_BTN_CLASS))) {
    return '';
  }

  // Handle tables
  if (tagName === 'table') {
    const tableRows = [];
    const collectRows = (current) => {
      if (current.tagName === 'TR') {
        tableRows.push(current);
      } else {
        for (const child of current.childNodes) {
          if (child.nodeType === 1) collectRows(child);
        }
      }
    };
    collectRows(node);

    if (tableRows.length === 0) return '';

    let tableMd = '\n';
    tableRows.forEach((row, rowIndex) => {
      const cells = Array.from(row.childNodes).filter(child => child.nodeType === 1 && (child.tagName === 'TH' || child.tagName === 'TD'));
      const cellTexts = cells.map(cell => {
        let txt = '';
        for (const child of cell.childNodes) {
          txt += parseNodeToMarkdown(child);
        }
        return txt.trim().replace(/\n/g, ' ');
      });

      tableMd += `| ${cellTexts.join(' | ')} |\n`;

      const isHeader = row.parentNode?.tagName.toUpperCase() === 'THEAD' || rowIndex === 0;
      if (isHeader) {
        const separator = cells.map(() => '---').join(' | ');
        tableMd += `| ${separator} |\n`;
      }
    });
    return tableMd + '\n';
  }

  // Recurse children
  let childrenMarkdown = '';
  for (const child of node.childNodes) {
    childrenMarkdown += parseNodeToMarkdown(child);
  }

  // Handle tags
  switch (tagName) {
    case 'p':
      return `\n\n${childrenMarkdown.trim()}\n\n`;
    case 'h1':
      return `\n\n# ${childrenMarkdown.trim()}\n\n`;
    case 'h2':
      return `\n\n## ${childrenMarkdown.trim()}\n\n`;
    case 'h3':
      return `\n\n### ${childrenMarkdown.trim()}\n\n`;
    case 'h4':
      return `\n\n#### ${childrenMarkdown.trim()}\n\n`;
    case 'h5':
      return `\n\n##### ${childrenMarkdown.trim()}\n\n`;
    case 'h6':
      return `\n\n###### ${childrenMarkdown.trim()}\n\n`;
    case 'strong':
    case 'b':
      return `**${childrenMarkdown}**`;
    case 'em':
    case 'i':
      return `*${childrenMarkdown}*`;
    case 'code':
      return `\`${childrenMarkdown}\``;
    case 'a':
      const href = node.getAttribute('href');
      return `[${childrenMarkdown}](${href || ''})`;
    case 'li':
      const parent = node.parentNode;
      const parentTag = parent ? parent.tagName.toLowerCase() : 'ul';
      if (parentTag === 'ol') {
        const lis = Array.from(parent.childNodes).filter(el => el.nodeType === 1 && el.tagName === 'LI');
        const index = lis.indexOf(node) + 1;
        return `\n${index}. ${childrenMarkdown.trim()}`;
      } else {
        return `\n- ${childrenMarkdown.trim()}`;
      }
    case 'ul':
    case 'ol':
      return `\n${childrenMarkdown}\n`;
    case 'br':
      return '\n';
    case 'blockquote':
      return `\n> ${childrenMarkdown.trim().replace(/\n/g, '\n> ')}\n\n`;
    default:
      return childrenMarkdown;
  }
}

function exportSessionMarkdown(exportBtn) {
  const turns = document.querySelectorAll('[data-message-author-role]');
  if (turns.length === 0) {
    showExportButtonStatus(exportBtn, "未找到会话内容", true);
    return;
  }

  let sessionMarkdown = '';

  const titleEl = document.querySelector('h1:not([class*="hidden"])') || document.querySelector('[data-testid*="conversation-title"]');
  const chatTitle = titleEl ? titleEl.textContent.trim() : (document.title?.replace(/ChatGPT/gi, "")?.trim() || "chatgpt-session");

  sessionMarkdown += `# ${chatTitle}\n\n`;

  turns.forEach((turn) => {
    const role = turn.getAttribute('data-message-author-role');
    if (!role) return;

    let contentNode = turn.querySelector('.markdown, .prose');
    if (!contentNode) {
      contentNode = turn.querySelector('.whitespace-pre-wrap, [data-message-content], [class*="message-content"]');
    }
    if (!contentNode) {
      contentNode = turn;
    }

    const contentMd = parseNodeToMarkdown(contentNode).trim();
    if (!contentMd) return;

    const formattedRole = role === 'user' ? 'User' : (role === 'assistant' ? 'ChatGPT' : role.charAt(0).toUpperCase() + role.slice(1));
    sessionMarkdown += `**${formattedRole}**:\n${contentMd}\n\n---\n\n`;
  });

  sessionMarkdown = sessionMarkdown.replace(/\n\n---\n\n$/, '\n');

  downloadMarkdown(sessionMarkdown, chatTitle);
  showExportButtonStatus(exportBtn, "会话已导出", true);
}

function injectSessionExportButton() {
  const headerActions = document.getElementById("conversation-header-actions");
  if (!headerActions) return;

  if (headerActions.querySelector(`.${EXPORT_SESSION_BTN_CLASS}`)) return;

  const btn = document.createElement("button");
  btn.className = EXPORT_SESSION_BTN_CLASS;
  btn.type = "button";
  setExportButtonIcon(btn, true);

  btn.addEventListener("click", (event) => {
    showExportDropdown(
      event,
      btn,
      () => exportSessionMarkdown(btn),
      () => exportSessionPng(btn)
    );
  });

  headerActions.appendChild(btn);
}

function injectExportButtons() {
  getActionBars().forEach((actionBar) => {
    if (actionBar.querySelector(`.${EXPORT_BTN_CLASS}`)) return;

    const btn = createExportButton(actionBar);
    actionBar.appendChild(btn);
  });

  injectSessionExportButton();
}

const observer = new MutationObserver(() => {
  injectExportButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

injectExportButtons();
