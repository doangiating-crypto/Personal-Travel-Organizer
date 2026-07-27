export type EventType = 'Ăn uống' | 'Ngắm cảnh' | 'Bonding' | 'Khác';
export type EventStatus = 'Sắp tới' | 'Đang diễn ra' | 'Đã xong' | 'Hủy' | 'Tạm hoãn';

export interface TripEvent {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO string format for Date
  endTime: string;   // ISO string format for Date
  location: string;
  type: EventType;
  status: EventStatus;
  isCompleted: boolean;
}
