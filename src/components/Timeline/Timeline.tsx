import React from 'react';
import type { TripEvent } from '../../types';
import { EventCard } from '../EventCard/EventCard';
import styles from './Timeline.module.css';

interface TimelineProps {
  events: TripEvent[];
  onEditEvent: (event: TripEvent) => void;
  onSwapEvents: (event1: TripEvent, event2: TripEvent) => void;
  onChangeEventStatus: (event: TripEvent, status: TripEvent['status']) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ events, onEditEvent, onSwapEvents, onChangeEventStatus }) => {
  // Sắp xếp các sự kiện theo thời gian bắt đầu
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const handleMoveUp = (event: TripEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const index = sortedEvents.findIndex((ev) => ev.id === event.id);
    if (index > 0) {
      onSwapEvents(event, sortedEvents[index - 1]);
    }
  };

  const handleMoveDown = (event: TripEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const index = sortedEvents.findIndex((ev) => ev.id === event.id);
    if (index < sortedEvents.length - 1) {
      onSwapEvents(event, sortedEvents[index + 1]);
    }
  };

  if (events.length === 0) {
    return <div className={styles.empty}>Chưa có sự kiện nào trong lịch trình.</div>;
  }

  return (
    <div className={styles.timeline}>
      {sortedEvents.map((event, index) => (
        <div key={event.id} className={styles.timelineItem}>
          <div className={styles.timelineLine}>
            <div className={styles.timelineDot} />
          </div>
          <div className={styles.timelineContent}>
            <EventCard
              event={event}
              onClick={onEditEvent}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onChangeEventStatus={onChangeEventStatus}
              isFirst={index === 0}
              isLast={index === sortedEvents.length - 1}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
