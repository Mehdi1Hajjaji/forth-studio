"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './ServicesMenuButton.module.css';
import Link from 'next/link';

export default function ServicesMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const itemsRef = useRef<HTMLAnchorElement[]>([]);
  const menuId = 'services-menu';

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function focusItem(index: number) {
    const el = itemsRef.current[index];
    if (el) el.focus();
  }

  function handleButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Escape') {
      setIsOpen(false);
      (e.target as HTMLButtonElement).blur();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((v) => !v);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      // wait for open then focus first
      setTimeout(() => focusItem(0), 0);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      setTimeout(() => focusItem(itemsRef.current.length - 1), 0);
    }
  }

  function handleMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = itemsRef.current.findIndex((el) => el === document.activeElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (currentIndex + 1) % itemsRef.current.length;
      focusItem(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (currentIndex - 1 + itemsRef.current.length) % itemsRef.current.length;
      focusItem(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusItem(itemsRef.current.length - 1);
    }
  }

  return (
    <div className={styles.container} ref={ref}>
      <button
        ref={buttonRef}
        className={styles.menuButton}
        onClick={() => setIsOpen((v) => !v)}
        aria-label="More services"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onKeyDown={handleButtonKeyDown}
      >
        <span className={styles.tooltip} role="tooltip">More services</span>
        {/* SVG Grid Lines */}
        <svg className={styles.gridLines} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Horizontal lines */}
          <line x1="15" y1="25" x2="85" y2="25" />
          <line x1="15" y1="50" x2="85" y2="50" />
          <line x1="15" y1="75" x2="85" y2="75" />
          {/* Vertical lines */}
          <line x1="25" y1="15" x2="25" y2="85" />
          <line x1="50" y1="15" x2="50" y2="85" />
          <line x1="75" y1="15" x2="75" y2="85" />
        </svg>

        {/* 3x3 Grid Dots */}
        <div className={styles.gridContainer}>
          {[...Array(9)].map((_, i) => (
            <div key={i} className={styles.gridDot} />
          ))}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={menuId}
          className={styles.dropdown}
          role="menu"
          aria-labelledby={menuId}
          onKeyDown={handleMenuKeyDown}
        >
          <Link
            href="/fail-wall"
            className={styles.dropdownItem}
            role="menuitem"
            ref={(el) => { if (el) itemsRef.current[0] = el; }}
            onClick={() => setIsOpen(false)}
          >
            Fail Wall
          </Link>
          <Link
            href="/code-cry"
            className={styles.dropdownItem}
            role="menuitem"
            ref={(el) => { if (el) itemsRef.current[1] = el; }}
            onClick={() => setIsOpen(false)}
          >
            Code & Cry Sessions
          </Link>
          <Link
            href="/leaderboard/karma"
            className={styles.dropdownItem}
            role="menuitem"
            ref={(el) => { if (el) itemsRef.current[2] = el; }}
            onClick={() => setIsOpen(false)}
          >
            Karma Leaderboard
          </Link>
        </div>
      )}
    </div>
  );
}
