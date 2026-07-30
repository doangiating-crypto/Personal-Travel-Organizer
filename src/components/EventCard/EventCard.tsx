import React from 'react';
import type { TripEvent } from '../../types';
import { Tag } from '../Tag/Tag';
import { XCircle, PauseCircle } from 'lucide-react';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: TripEvent;
  onClick?: (event: TripEvent) => void;
  onMoveUp?: (event: TripEvent, e: React.MouseEvent) => void;
  onMoveDown?: (event: TripEvent, e: React.MouseEvent) => void;
  onChangeEventStatus?: (event: TripEvent, status: TripEvent['status']) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const calculateStatus = (start: string, end: string): TripEvent['status'] => {
  const now = new Date().getTime();
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (now >= startTime && now < endTime) return 'Đang diễn ra';
  if (now >= endTime) return 'Đã xong';
  return 'Sắp tới';
};

const getBadgeClass = (status: TripEvent['status']) => {
  switch (status) {
    case 'Sắp tới': return styles.statusUpcoming;
    case 'Đang diễn ra': return styles.statusOngoing;
    case 'Đã xong': return styles.statusCompleted;
    case 'Hủy': return styles.statusCancelled;
    case 'Tạm hoãn': return styles.statusPostponed;
    default: return '';
  }
};

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, onMoveUp, onMoveDown, onChangeEventStatus, isFirst, isLast }) => {
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
      <div className={styles.cardContent}>
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
          {onChangeEventStatus && (
            <>
              <button 
                className={`${styles.iconBtn} ${event.status === 'Tạm hoãn' ? styles.iconActive : ''}`} 
                onClick={(e) => {
                  e.stopPropagation();
                  if (event.status === 'Tạm hoãn') {
                    onChangeEventStatus(event, calculateStatus(event.startTime, event.endTime));
                  } else {
                    onChangeEventStatus(event, 'Tạm hoãn');
                  }
                }} 
                title={event.status === 'Tạm hoãn' ? "Bỏ Tạm hoãn" : "Tạm hoãn"}
              >
                <PauseCircle size={22} />
              </button>
              <button 
                className={`${styles.iconBtn} ${event.status === 'Hủy' ? styles.iconActive : ''}`} 
                onClick={(e) => {
                  e.stopPropagation();
                  if (event.status === 'Hủy') {
                    onChangeEventStatus(event, calculateStatus(event.startTime, event.endTime));
                  } else {
                    onChangeEventStatus(event, 'Hủy');
                  }
                }} 
                title={event.status === 'Hủy' ? "Bỏ Hủy sự kiện" : "Hủy sự kiện"}
              >
                <XCircle size={22} />
              </button>
            </>
          )}
        </div>
        <span className={`${styles.statusBadge} ${getBadgeClass(event.status)}`}>
          {event.status}
        </span>
      </div>
      </div>

      {(onMoveUp || onMoveDown) && (
        <div className={styles.moveControls}>
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
      )}
    </div>
  );
};
