import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  dropdown: {
    position: 'absolute',
    zIndex: 99999,
    background: 'var(--chatdown-dropdown-bg, rgba(240, 245, 255, 0.75))',
    border: '1px solid var(--chatdown-dropdown-border, rgba(180, 200, 240, 0.4))',
    borderRadius: '8px',
    boxShadow: 'var(--chatdown-dropdown-shadow, 0 8px 32px rgba(0, 40, 120, 0.08))',
    backdropFilter: 'blur(12px) saturate(1.25)',
    padding: '4px',
    minWidth: '180px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'inherit',
    fontSize: '14px',
    color: 'var(--chatdown-dropdown-text, #1e293b)',
    opacity: 0,
    transform: 'scale(0.95)',
    transition: 'opacity 0.15s ease, transform 0.15s ease',
  },
  dropdownShow: {
    opacity: 1,
    transform: 'scale(1)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'inherit',
    transition: 'background-color 0.1s ease',
  },
  svg: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
  }
});

export default function ExportDropdown({ triggerRect, onClose, onExportMarkdown, onExportPng }) {
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isRendered, setIsRendered] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(() => {
    if (!dropdownRef.current) return;

    const dropdownWidth = dropdownRef.current.offsetWidth;
    const dropdownHeight = dropdownRef.current.offsetHeight;

    let top = triggerRect.bottom + window.scrollY + 6;
    let left = triggerRect.left + window.scrollX;

    if (triggerRect.bottom + dropdownHeight > window.innerHeight + window.scrollY) {
      top = triggerRect.top + window.scrollY - dropdownHeight - 6;
    }
    if (left + dropdownWidth > window.innerWidth + window.scrollX) {
      left = triggerRect.right + window.scrollX - dropdownWidth;
    }

    setCoords({ top, left });
    setIsRendered(true);

    // Click outside handler
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Use capturing phase to prevent instant close from trigger click
    document.addEventListener('click', handleOutsideClick, true);
    return () => {
      document.removeEventListener('click', handleOutsideClick, true);
    };
  }, [triggerRect, onClose]);

  const dropdownProps = stylex.props(styles.dropdown, isRendered && styles.dropdownShow);
  const item1Props = stylex.props(styles.item, hoverIdx === 0 && { backgroundColor: 'var(--chatdown-dropdown-hover-bg, rgba(59, 130, 246, 0.08))' });
  const item2Props = stylex.props(styles.item, hoverIdx === 1 && { backgroundColor: 'var(--chatdown-dropdown-hover-bg, rgba(59, 130, 246, 0.08))' });

  return createPortal(
    <div
      ref={dropdownRef}
      className={`chatgpt-export-dropdown ${dropdownProps.className || ''}`}
      style={{
        ...dropdownProps.style,
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        display: 'flex',
      }}
    >
      <div
        onMouseEnter={() => setHoverIdx(0)}
        onMouseLeave={() => setHoverIdx(null)}
        onClick={(e) => {
          e.stopPropagation();
          onExportMarkdown();
          onClose();
        }}
        className={`chatgpt-export-dropdown-item ${item1Props.className || ''}`}
        style={item1Props.style}
      >
        <svg viewBox="0 0 24 24" {...stylex.props(styles.svg)}>
          <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
        <span>导出为 Markdown (.md)</span>
      </div>

      <div
        onMouseEnter={() => setHoverIdx(1)}
        onMouseLeave={() => setHoverIdx(null)}
        onClick={(e) => {
          e.stopPropagation();
          onExportPng();
          onClose();
        }}
        className={`chatgpt-export-dropdown-item ${item2Props.className || ''}`}
        style={item2Props.style}
      >
        <svg viewBox="0 0 24 24" {...stylex.props(styles.svg)}>
          <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
        <span>导出为图片 (.png)</span>
      </div>
    </div>,
    document.body
  );
}
