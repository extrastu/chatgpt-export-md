import React from "react";
import { createRoot } from "react-dom/client";
import ExportButton from "./components/ExportButton";
import SessionExportButton from "./components/SessionExportButton";
import "./content.css";

function getActionBars() {
  const chatgptBars = Array.from(document.querySelectorAll('[aria-label="回复操作"], [aria-label="Response actions"]'));

  const claudeBars = [];
  const copyButtons = document.querySelectorAll('button[aria-label*="Copy" i], button[aria-label*="复制" i]');
  copyButtons.forEach((btn) => {
    // Avoid code block copy buttons
    if (btn.closest("pre") || btn.closest(".code-block")) return;
    const ariaLabel = (btn.getAttribute("aria-label") || "").toLowerCase();
    if (ariaLabel.includes("code") || ariaLabel.includes("代码")) return;

    const parent = btn.parentElement;
    if (parent && !claudeBars.includes(parent)) {
      claudeBars.push(parent);
    }
  });

  return [...chatgptBars, ...claudeBars];
}

function getSessionHeader() {
  const chatgptHeader = document.getElementById("conversation-header-actions");
  if (chatgptHeader) return chatgptHeader;

  // Claude header or navigation bar at the top of the chat area
  const claudeHeader = document.querySelector("header");
  if (claudeHeader) {
    const rightContainer = claudeHeader.querySelector(".justify-end, .items-center:last-child") || claudeHeader;
    return rightContainer;
  }

  return null;
}

function injectSessionExportButton() {
  const headerActions = getSessionHeader();
  if (!headerActions) return;

  if (headerActions.querySelector(".chatdown-mount-session")) return;

  const mountEl = document.createElement("div");
  mountEl.className = "chatdown-mount-session";
  mountEl.style.display = "inline-flex";
  mountEl.style.alignItems = "center";
  mountEl.style.justifyContent = "center";
  mountEl.style.marginLeft = "8px";

  if (window.location.hostname.includes("claude.ai")) {
    mountEl.style.marginLeft = "0";
    mountEl.style.marginRight = "90px";
  }

  headerActions.appendChild(mountEl);

  const root = createRoot(mountEl);
  root.render(<SessionExportButton />);
}

function injectExportButtons() {
  getActionBars().forEach((actionBar) => {
    if (actionBar.querySelector(".chatdown-mount")) return;

    const mountEl = document.createElement("div");
    mountEl.className = "chatdown-mount";
    mountEl.style.display = "inline-flex";
    mountEl.style.alignItems = "center";
    mountEl.style.justifyContent = "center";

    actionBar.appendChild(mountEl);

    const root = createRoot(mountEl);
    root.render(<ExportButton actionBar={actionBar} />);
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
