import React, { useState, useRef, useEffect } from 'react';
import type { EventStatus } from '../../types';
import { ChevronDown } from 'lucide-react';
import styles from './StatusDropdown.module.css';

interface StatusDropdownProps {
  value: EventStatus;
  onChange: (value: EventStatus) => void;
}

const STATUS_OPTIONS: EventStatus[] = ['Sắp tới', 'Đang diễn ra', 'Đã xong', 'Tạm hoãn', 'Hủy'];

const getStatusBadgeClass = (status: EventStatus) => {
  switch (status) {
    case 'Sắp tới': return styles.badgeBlue;
    case 'Đang diễn ra': return styles.badgeGreen;
    case 'Tạm hoãn': return styles.badgeYellow;
    case 'Hủy': return styles.badgeRed;
    case 'Đã xong': return styles.badgeGray;
    default: return '';
  }
};

export const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(STATUS_OPTIONS.indexOf(value));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % STATUS_OPTIONS.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(STATUS_OPTIONS[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (status: EventStatus) => {
    onChange(status);
    setIsOpen(false);
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add(styles.ripple);

    const existingRipple = button.querySelector(`.${styles.ripple}`);
    if (existingRipple) {
      existingRipple.remove();
    }

    button.appendChild(circle);
  };

  return (
    <div 
      className={styles.dropdownContainer} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={styles.dropdownTrigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles.triggerContent}>
          <span className={`${styles.badge} ${getStatusBadgeClass(value)}`}>
            {value}
          </span>
        </div>
        <ChevronDown 
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} 
          size={16} 
        />
      </button>

      {isOpen && (
        <ul 
          className={styles.dropdownMenu}
          role="listbox"
        >
          {STATUS_OPTIONS.map((status, index) => (
            <li key={status} role="presentation">
              <button
                type="button"
                className={`${styles.dropdownItem} ${index === activeIndex ? styles.itemActive : ''} ${value === status ? styles.itemSelected : ''}`}
                role="option"
                aria-selected={value === status}
                onClick={(e) => {
                  handleRipple(e);
                  setTimeout(() => handleSelect(status), 200);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className={`${styles.badge} ${getStatusBadgeClass(status)}`}>
                  {status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
