import React from 'react';
import styles from './Tag.module.css';
import type { EventType } from '../../types';

interface TagProps {
  type: EventType;
}

export const Tag: React.FC<TagProps> = ({ type }) => {
  let colorClass = '';

  switch (type) {
    case 'Ăn uống':
      colorClass = styles.orange;
      break;
    case 'Ngắm cảnh':
      colorClass = styles.blue;
      break;
    case 'Bonding':
      colorClass = styles.purple;
      break;
    case 'Khác':
    default:
      colorClass = styles.gray;
      break;
  }

  return (
    <span className={`${styles.tag} ${colorClass}`}>
      {type}
    </span>
  );
};
