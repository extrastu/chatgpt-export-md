import { parseNodeToMarkdown } from './parser';

export function downloadMarkdown(content, customTitle = "") {
  const isClaude = window.location.hostname.includes("claude.ai");
  const defaultTitle = isClaude ? "claude-message" : "chatgpt-message";
  const title =
    (customTitle || document.title)
      ?.replace(/ChatGPT/gi, "")
      ?.replace(/Claude/gi, "")
      ?.replace(/[\\/:*?"<>|]/g, "")
      ?.trim() || defaultTitle;

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

  if (copyBtn) {
    const oldClipboard = await navigator.clipboard.readText().catch(() => "");
    copyBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 300));
    const markdown = await navigator.clipboard.readText().catch(() => "");
    if (markdown && markdown !== oldClipboard) {
      downloadMarkdown(markdown);
      onStatusChange("已导出");
      return;
    }
  }

  // Fallback: DOM parsing
  const turnNode =
    actionBar.closest("[data-message-author-role]") ||
    actionBar.closest("article") ||
    actionBar.closest('div[data-testid*="turn"]') ||
    actionBar.closest(".group\\/conversation-turn") ||
    actionBar.closest('.font-user-message') ||
    actionBar.closest('.font-claude-message') ||
    actionBar.closest('.font-claude-response') ||
    actionBar.closest('[data-testid="user-message"]') ||
    actionBar.closest('[data-testid="bot-message"]') ||
    actionBar.parentElement?.parentElement ||
    actionBar.parentElement;

  if (turnNode) {
    const markdown = parseNodeToMarkdown(turnNode).trim();
    if (markdown) {
      downloadMarkdown(markdown);
      onStatusChange("已导出");
      return;
    }
  }

  onStatusChange("复制失败");
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
  const isClaude = window.location.hostname.includes("claude.ai");
  const defaultTitle = isClaude ? "claude-message" : "chatgpt-message";
  const title =
    document.title
      ?.replace(/ChatGPT/gi, "")
      ?.replace(/Claude/gi, "")
      ?.replace(/[\\/:*?"<>|]/g, "")
      ?.trim() || defaultTitle;
  const filename = `${title}-${Date.now()}.png`;

  renderElementToPng(turnNode, filename, onStatusChange);
}

export function getSessionTurns() {
  const turns = [];

  // 1. Try ChatGPT
  const chatgptTurns = document.querySelectorAll('[data-message-author-role]');
  if (chatgptTurns.length > 0) {
    chatgptTurns.forEach((turn) => {
      const role = turn.getAttribute('data-message-author-role');
      let contentNode = turn.querySelector('.markdown, .prose');
      if (!contentNode) {
        contentNode = turn.querySelector('.whitespace-pre-wrap, [data-message-content], [class*="message-content"]');
      }
      if (!contentNode) {
        contentNode = turn;
      }
      turns.push({
        role: role === 'user' ? 'user' : (role === 'assistant' ? 'assistant' : role),
        node: contentNode,
        originalNode: turn,
      });
    });
    return turns;
  }

  // 2. Try Claude
  const claudeMsgNodes = document.querySelectorAll(
    '.font-user-message, .font-claude-message, .font-claude-response, [data-testid="user-message"], [data-testid="bot-message"]'
  );
  if (claudeMsgNodes.length > 0) {
    claudeMsgNodes.forEach((node) => {
      // Avoid duplicate/nested selections
      const isNested = Array.from(claudeMsgNodes).some(otherNode => otherNode !== node && otherNode.contains(node));
      if (isNested) return;

      const isUser = node.classList.contains('font-user-message') || node.getAttribute('data-testid') === 'user-message';
      
      // Try to find the closest wrapper div for visual fidelity in PNG exports
      let turnNode = node.closest('[data-testid="user-message"]') || node.closest('[data-testid="bot-message"]') || node;
      if (turnNode === node) {
        const parent = node.parentElement;
        if (parent && parent.tagName.toLowerCase() === 'div') {
          turnNode = parent;
        }
      }

      turns.push({
        role: isUser ? 'user' : 'assistant',
        node: node,
        originalNode: turnNode,
      });
    });
    return turns;
  }

  return turns;
}

function getScrollContainer() {
  const selectors = [
    '.overflow-y-auto',
    'main div.overflow-y-auto',
    '.flex-1.overflow-y-auto',
    '[role="presentation"]',
    'header + div',
    '.chat-container'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.scrollHeight > el.clientHeight) {
      return el;
    }
  }

  const messageNode = document.querySelector('.font-user-message, .font-claude-message, .font-claude-response, [data-testid="user-message"], [data-message-author-role]');
  if (messageNode) {
    let parent = messageNode.parentElement;
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      if (parent.scrollHeight > parent.clientHeight && (style.overflowY === 'auto' || style.overflowY === 'scroll')) {
        return parent;
      }
      parent = parent.parentElement;
    }
  }

  return window;
}

export async function collectAllTurns(onProgress) {
  const container = getScrollContainer();
  if (!container) return getSessionTurns();

  const isWindow = container === window;
  const getScrollTop = () => isWindow ? window.scrollY : container.scrollTop;
  const setScrollTop = (val) => isWindow ? window.scrollTo(0, val) : (container.scrollTop = val);
  const getScrollHeight = () => isWindow ? document.documentElement.scrollHeight : container.scrollHeight;
  const getClientHeight = () => isWindow ? window.innerHeight : container.clientHeight;

  const originalScrollTop = getScrollTop();
  const collectedTurns = [];
  const processedSignatures = new Set();

  onProgress("同步会话中...");

  setScrollTop(0);
  await new Promise(resolve => setTimeout(resolve, 200));

  let lastScrollTop = -1;
  let maxScrolls = 80;
  let scrollCount = 0;

  while (getScrollTop() !== lastScrollTop && scrollCount < maxScrolls) {
    lastScrollTop = getScrollTop();
    scrollCount++;

    const currentTurns = getSessionTurns();
    currentTurns.forEach(turn => {
      const text = turn.node.textContent || "";
      const signature = `${turn.role}_${text.trim()}`;
      if (!processedSignatures.has(signature)) {
        processedSignatures.add(signature);
        
        const clonedNode = turn.node.cloneNode(true);
        const clonedOriginalNode = turn.originalNode.cloneNode(true);
        
        collectedTurns.push({
          role: turn.role,
          node: clonedNode,
          originalNode: clonedOriginalNode
        });
      }
    });

    setScrollTop(getScrollTop() + getClientHeight() * 0.8);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  setScrollTop(originalScrollTop);
  return collectedTurns;
}

export async function exportSessionMarkdown(onStatusChange) {
  const turns = await collectAllTurns(onStatusChange);
  if (turns.length === 0) {
    onStatusChange("未找到会话");
    return;
  }

  let sessionMarkdown = '';

  const titleEl = document.querySelector('h1:not([class*="hidden"])') || document.querySelector('[data-testid*="conversation-title"]');
  const isClaude = window.location.hostname.includes("claude.ai");
  const defaultTitle = isClaude ? "claude-session" : "chatgpt-session";
  const chatTitle = titleEl ? titleEl.textContent.trim() : (document.title?.replace(/ChatGPT/gi, "")?.replace(/Claude/gi, "")?.trim() || defaultTitle);

  sessionMarkdown += `# ${chatTitle}\n\n`;

  turns.forEach((turn) => {
    const role = turn.role;
    const contentMd = parseNodeToMarkdown(turn.node).trim();
    if (!contentMd) return;

    const formattedRole = role === 'user' ? 'User' : (role === 'assistant' ? (isClaude ? 'Claude' : 'ChatGPT') : role.charAt(0).toUpperCase() + role.slice(1));
    sessionMarkdown += `**${formattedRole}**:\n${contentMd}\n\n---\n\n`;
  });

  sessionMarkdown = sessionMarkdown.replace(/\n\n---\n\n$/, '\n');

  downloadMarkdown(sessionMarkdown, chatTitle);
  onStatusChange("已导出");
}

export async function exportSessionPng(onStatusChange) {
  const turns = await collectAllTurns(onStatusChange);
  if (turns.length === 0) {
    onStatusChange("未找到会话");
    return;
  }

  const titleEl = document.querySelector('h1:not([class*="hidden"])') || document.querySelector('[data-testid*="conversation-title"]');
  const isClaude = window.location.hostname.includes("claude.ai");
  const defaultTitle = isClaude ? "claude-session" : "chatgpt-session";
  const chatTitle = titleEl ? titleEl.textContent.trim() : (document.title?.replace(/ChatGPT/gi, "")?.replace(/Claude/gi, "")?.trim() || defaultTitle);
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
    const clone = turn.originalNode.cloneNode(true);
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
