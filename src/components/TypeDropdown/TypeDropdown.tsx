import React, { useState, useRef, useEffect } from 'react';
import type { EventType } from '../../types';
import { ChevronDown } from 'lucide-react';
import styles from './TypeDropdown.module.css';

interface TypeDropdownProps {
  value: EventType;
  onChange: (value: EventType) => void;
}

const TYPE_OPTIONS: EventType[] = ['Ăn uống', 'Ngắm cảnh', 'Bonding', 'Khác'];

const getTypeBadgeClass = (type: EventType) => {
  switch (type) {
    case 'Ăn uống': return styles.badgeOrange;
    case 'Ngắm cảnh': return styles.badgeBlue;
    case 'Bonding': return styles.badgePurple;
    case 'Khác': return styles.badgeGray;
    default: return '';
  }
};

export const TypeDropdown: React.FC<TypeDropdownProps> = ({ value, onChange }) => {
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
        setActiveIndex(TYPE_OPTIONS.indexOf(value));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % TYPE_OPTIONS.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + TYPE_OPTIONS.length) % TYPE_OPTIONS.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(TYPE_OPTIONS[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (type: EventType) => {
    onChange(type);
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
          <span className={`${styles.badge} ${getTypeBadgeClass(value)}`}>
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
          {TYPE_OPTIONS.map((type, index) => (
            <li key={type} role="presentation">
              <button
                type="button"
                className={`${styles.dropdownItem} ${index === activeIndex ? styles.itemActive : ''} ${value === type ? styles.itemSelected : ''}`}
                role="option"
                aria-selected={value === type}
                onClick={(e) => {
                  handleRipple(e);
                  setTimeout(() => handleSelect(type), 200);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className={`${styles.badge} ${getTypeBadgeClass(type)}`}>
                  {type}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
