// DOM-to-Markdown parser for ChatDown
export function parseNodeToMarkdown(node, exportBtnClass = 'chatgpt-export-md-btn', exportSessionBtnClass = 'chatgpt-export-session-md-btn') {
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
  if (node.classList && (
    node.classList.contains('copy-code-button') || 
    node.classList.contains('sr-only') || 
    node.classList.contains(exportBtnClass) || 
    node.classList.contains(exportSessionBtnClass) ||
    node.classList.contains('chatgpt-export-dropdown')
  )) {
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
          txt += parseNodeToMarkdown(child, exportBtnClass, exportSessionBtnClass);
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
    childrenMarkdown += parseNodeToMarkdown(child, exportBtnClass, exportSessionBtnClass);
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
