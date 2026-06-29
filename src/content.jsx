import React from 'react';
import { createRoot } from 'react-dom/client';
import ExportButton from './components/ExportButton';
import SessionExportButton from './components/SessionExportButton';
import './content.css';

function getActionBars() {
  return document.querySelectorAll('[aria-label="回复操作"], [aria-label="Response actions"]');
}

function injectSessionExportButton() {
  const headerActions = document.getElementById("conversation-header-actions");
  if (!headerActions) return;

  if (headerActions.querySelector('.chatdown-mount-session')) return;

  const mountEl = document.createElement("div");
  mountEl.className = "chatdown-mount-session";
  mountEl.style.display = "inline-flex";
  mountEl.style.alignItems = "center";
  mountEl.style.justifyContent = "center";

  headerActions.appendChild(mountEl);

  const root = createRoot(mountEl);
  root.render(<SessionExportButton />);
}

function injectExportButtons() {
  getActionBars().forEach((actionBar) => {
    if (actionBar.querySelector('.chatdown-mount')) return;

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
