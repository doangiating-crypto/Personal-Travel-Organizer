import { useEffect } from 'react';
import type { TripEvent } from '../types';

export const useRealtimeEngine = (
  events: TripEvent[],
  updateEvents: (events: TripEvent[]) => void
) => {
  useEffect(() => {
    // Chạy kiểm tra realtime mỗi 60 giây
    const interval = setInterval(() => {
      const now = new Date().getTime();
      let hasChanges = false;

      const updatedEvents = events.map((event) => {
        // Bỏ qua các sự kiện Hủy hoặc Tạm hoãn
        if (event.status === 'Hủy' || event.status === 'Tạm hoãn') {
          return event;
        }

        const startTime = new Date(event.startTime).getTime();
        const endTime = new Date(event.endTime).getTime();

        let newStatus = event.status;

        // Thuật toán kiểm tra thời gian
        if (now >= startTime && now < endTime) {
          newStatus = 'Đang diễn ra';
        } else if (now >= endTime) {
          newStatus = 'Đã xong';
        } else if (now < startTime) {
          newStatus = 'Sắp tới'; // Trở lại sắp tới nếu thời gian thay đổi hoặc lý do nào đó
        }

        if (newStatus !== event.status) {
          hasChanges = true;
          return { ...event, status: newStatus };
        }

        return event;
      });

      // Chỉ gọi hàm cập nhật nếu thực sự có sự thay đổi về state để tránh re-render không cần thiết
      if (hasChanges) {
        updateEvents(updatedEvents);
      }
    }, 60000); // 60 giây

    // Chạy ngay lần đầu khi mount
    const timeout = setTimeout(() => {
      // Logic kiểm tra ngay lần đầu
      const now = new Date().getTime();
      let hasChanges = false;
      const updatedEvents = events.map((event) => {
        if (event.status === 'Hủy' || event.status === 'Tạm hoãn') return event;
        const startTime = new Date(event.startTime).getTime();
        const endTime = new Date(event.endTime).getTime();
        let newStatus = event.status;
        if (now >= startTime && now < endTime) newStatus = 'Đang diễn ra';
        else if (now >= endTime) newStatus = 'Đã xong';
        else if (now < startTime) newStatus = 'Sắp tới';

        if (newStatus !== event.status) {
          hasChanges = true;
          return { ...event, status: newStatus };
        }
        return event;
      });
      if (hasChanges) updateEvents(updatedEvents);
    }, 0);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [events, updateEvents]);
};
