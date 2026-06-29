import { parseNodeToMarkdown } from './parser';

export function downloadMarkdown(content, customTitle = "") {
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

export function downloadPng(canvas, filename) {
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

export function findCopyButton(actionBar) {
  return (
    actionBar.querySelector('button[data-testid="copy-turn-action-button"]') ||
    actionBar.querySelector('button[aria-label*="复制"]') ||
    actionBar.querySelector('button[aria-label*="Copy"]')
  );
}

export async function exportMarkdown(actionBar, onStatusChange) {
  const copyBtn = findCopyButton(actionBar);

  if (!copyBtn) {
    onStatusChange("未找到复制");
    return;
  }

  const oldClipboard = await navigator.clipboard.readText().catch(() => "");

  copyBtn.click();

  await new Promise((resolve) => setTimeout(resolve, 300));

  const markdown = await navigator.clipboard.readText().catch(() => "");

  if (!markdown || markdown === oldClipboard) {
    onStatusChange("复制失败");
    return;
  }

  downloadMarkdown(markdown);
  onStatusChange("已导出");
}

export function renderElementToPng(elementToRender, filename, onStatusChange) {
  onStatusChange("正在生成...");

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
    .chatgpt-export-md-btn,
    .chatgpt-export-session-md-btn,
    .chatgpt-export-dropdown,
    button,
    [role="button"],
    [aria-label*="Copy"],
    [aria-label*="复制"],
    .sr-only,
    .chatdown-mount
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
    window.html2canvas(container, {
      useCORS: true,
      scale: 2,
      backgroundColor: container.style.backgroundColor,
      logging: false
    }).then((canvas) => {
      downloadPng(canvas, filename);
      onStatusChange("已导出");
      container.remove();
    }).catch((err) => {
      console.error("html2canvas failed:", err);
      onStatusChange("导出失败");
      container.remove();
    });
  }, 200);
}

export function exportMessagePng(turnNode, onStatusChange) {
  const title =
    document.title
      ?.replace(/ChatGPT/gi, "")
      ?.replace(/[\\/:*?"<>|]/g, "")
      ?.trim() || "chatgpt-message";
  const filename = `${title}-${Date.now()}.png`;

  renderElementToPng(turnNode, filename, onStatusChange);
}

export function exportSessionMarkdown(onStatusChange) {
  const turns = document.querySelectorAll('[data-message-author-role]');
  if (turns.length === 0) {
    onStatusChange("未找到会话");
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
  onStatusChange("已导出");
}

export function exportSessionPng(onStatusChange) {
  const turns = document.querySelectorAll('[data-message-author-role]');
  if (turns.length === 0) {
    onStatusChange("未找到会话");
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
      .chatgpt-export-md-btn,
      .chatgpt-export-session-md-btn,
      .chatgpt-export-dropdown,
      button,
      [role="button"],
      [aria-label*="Copy"],
      [aria-label*="复制"],
      .sr-only,
      .chatdown-mount
    `).forEach(el => el.remove());
    sessionWrapper.appendChild(clone);
  });

  renderElementToPng(sessionWrapper, filename, onStatusChange);
}
