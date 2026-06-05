const EXPORT_BTN_CLASS = "chatgpt-export-md-btn";
const EXPORT_BTN_TITLE = "导出为 Markdown";

const EXPORT_ICON_SVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M160 213.333333C95.573333 213.333333 42.666667 266.24 42.666667 330.666667v362.666666C42.666667 757.76 95.573333 810.666667 160 810.666667h704c64.426667 0 117.333333-52.906667 117.333333-117.333334v-362.666666c0-64.426667-52.906667-117.333333-117.333333-117.333334h-704z m0 64h704c29.824 0 53.333333 23.509333 53.333333 53.333334v362.666666c0 29.824-23.509333 53.333333-53.333333 53.333334h-704A52.864 52.864 0 0 1 106.666667 693.333333v-362.666666C106.666667 300.842667 130.176 277.333333 160 277.333333z m88.917333 85.333334A56.896 56.896 0 0 0 192 419.584V618.666667a42.666667 42.666667 0 1 0 85.333333 0v-155.413334l54.698667 74.090667a42.666667 42.666667 0 0 0 68.544 0.149333L448 473.92V618.666667a42.666667 42.666667 0 1 0 85.333333 0v-199.082667a56.896 56.896 0 0 0-104.32-31.466667l-62.762666 99.306667-69.76-101.184A56.96 56.96 0 0 0 250.368 362.666667h-1.450667zM725.333333 362.666667a42.666667 42.666667 0 0 0-42.666666 42.666666v106.666667h-31.253334c-27.797333 0-42.730667 32.618667-24.661333 53.717333l71.125333 82.986667a36.181333 36.181333 0 0 0 54.912 0l71.125334-82.986667c18.090667-21.12 3.136-53.717333-24.661334-53.717333H768v-106.666667a42.666667 42.666667 0 0 0-42.666667-42.666666z"/></svg>`;

function setExportButtonIcon(exportBtn) {
  exportBtn.innerHTML = EXPORT_ICON_SVG;
  exportBtn.title = EXPORT_BTN_TITLE;
  exportBtn.setAttribute("aria-label", EXPORT_BTN_TITLE);
}

function showExportButtonStatus(exportBtn, message) {
  exportBtn.title = message;
  exportBtn.setAttribute("aria-label", message);

  setTimeout(() => {
    setExportButtonIcon(exportBtn);
  }, 1200);
}

function getActionBars() {
  return document.querySelectorAll('[aria-label="回复操作"], [aria-label="Response actions"]');
}

function downloadMarkdown(content) {
  const title =
    document.title
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

function createExportButton(actionBar) {
  const btn = document.createElement("button");

  btn.className = EXPORT_BTN_CLASS;
  btn.type = "button";
  setExportButtonIcon(btn);

  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    exportMarkdown(actionBar, btn);
  });

  return btn;
}

function injectExportButtons() {
  getActionBars().forEach((actionBar) => {
    if (actionBar.querySelector(`.${EXPORT_BTN_CLASS}`)) return;

    const btn = createExportButton(actionBar);
    actionBar.appendChild(btn);
  });
}

const observer = new MutationObserver(() => {
  injectExportButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

injectExportButtons();
