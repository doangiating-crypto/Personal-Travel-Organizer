import React from 'react';
import type { TripEvent } from '../../types';
import { Tag } from '../Tag/Tag';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: TripEvent;
  onClick?: (event: TripEvent) => void;
  onMoveUp?: (event: TripEvent, e: React.MouseEvent) => void;
  onMoveDown?: (event: TripEvent, e: React.MouseEvent) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const isOngoing = event.status === 'Đang diễn ra';
  const isCancelledOrDelayed = event.status === 'Hủy' || event.status === 'Tạm hoãn';
  const isCompleted = event.status === 'Đã xong' || event.isCompleted;

  let statusClass = '';
  if (isOngoing) statusClass = styles.ongoing;
  else if (isCancelledOrDelayed) statusClass = styles.dimmed;
  else if (isCompleted) statusClass = styles.completed;

  return (
    <div
      className={`${styles.card} ${statusClass}`}
      onClick={() => onClick?.(event)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.header}>
        <h3 className={`${styles.title} ${isCancelledOrDelayed ? styles.strikethrough : ''}`}>
          {event.title}
        </h3>
        <Tag type={event.type} />
      </div>
      
      <div className={styles.timeLocation}>
        <div className={styles.time}>
          <span className={styles.icon}>🕒</span>
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </div>
        <div className={styles.location}>
          <span className={styles.icon}>📍</span>
          {event.location}
        </div>
      </div>
      
      {event.description && (
        <p className={styles.description}>{event.description}</p>
      )}

      <div className={styles.footer}>
        <div className={styles.actions}>
          {onMoveUp && !isFirst && (
            <button className={styles.iconBtn} onClick={(e) => onMoveUp(event, e)} title="Di chuyển lên">
              ↑
            </button>
          )}
          {onMoveDown && !isLast && (
            <button className={styles.iconBtn} onClick={(e) => onMoveDown(event, e)} title="Di chuyển xuống">
              ↓
            </button>
          )}
        </div>
        <span className={`${styles.statusBadge} ${styles[event.status === 'Sắp tới' ? 'upcoming' : 'defaultStatus']}`}>
          {event.status}
        </span>
      </div>
    </div>
  );
};
