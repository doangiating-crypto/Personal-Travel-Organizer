import React, { useState, useEffect, useRef } from 'react';
import type { TripEvent, EventType, EventStatus } from '../../types';
import { TypeDropdown } from '../TypeDropdown/TypeDropdown';
import styles from './EventForm.module.css';

interface EventFormProps {
  existingEvents: TripEvent[];
  initialData?: TripEvent;
  onSubmit: (event: Omit<TripEvent, 'id'> | TripEvent) => void;
  onCancel: () => void;
}

const getInitialStartTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const getInitialEndTime = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export const EventForm: React.FC<EventFormProps> = ({
  existingEvents,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startTime, setStartTime] = useState(initialData?.startTime || getInitialStartTime());
  const [endTime, setEndTime] = useState(initialData?.endTime || getInitialEndTime());
  const [location, setLocation] = useState(initialData?.location || '');
  const [type, setType] = useState<EventType>(initialData?.type || 'Khác');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const checkOverlap = (start: string, end: string) => {
    if (!start || !end) return false;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();

    return existingEvents.some((ev) => {
      // Bỏ qua event đang edit
      if (initialData && ev.id === initialData.id) return false;
      const evS = new Date(ev.startTime).getTime();
      const evE = new Date(ev.endTime).getTime();
      
      // Chỉ không cho phép nếu 2 event trùng hoàn toàn khung giờ với nhau
      return s === evS && e === evE;
    });
  };

  const errors: { title?: boolean; time?: boolean; overlap?: boolean } = {};
  if (!title.trim()) errors.title = true;
  
  if (startTime && endTime) {
    if (new Date(endTime) <= new Date(startTime)) {
      errors.time = true;
    }
    if (checkOverlap(startTime, endTime)) {
      errors.overlap = true;
    }
  }

  const isFormReady = title.trim().length > 0 && startTime && endTime;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    if (Object.keys(errors).length > 0 || !isFormReady) return;

    let computedStatus: EventStatus = 'Sắp tới';
    const now = new Date().getTime();
    const startT = new Date(startTime).getTime();
    const endT = new Date(endTime).getTime();
    
    if (now >= startT && now < endT) {
      computedStatus = 'Đang diễn ra';
    } else if (now >= endT) {
      computedStatus = 'Đã xong';
    }

    if (initialData && (initialData.status === 'Hủy' || initialData.status === 'Tạm hoãn')) {
       if (initialData.startTime === startTime && initialData.endTime === endTime) {
           computedStatus = initialData.status;
       }
    }

    onSubmit({
      ...(initialData ? { id: initialData.id } : {}),
      title,
      description,
      startTime,
      endTime,
      location,
      type,
      status: computedStatus,
      isCompleted: initialData?.isCompleted || false,
    } as TripEvent);
  };

  const showTitleError = (touched.title || isSubmitted) && errors.title;
  const showTimeError = (touched.time || isSubmitted) && errors.time;
  const showOverlapError = (touched.time || isSubmitted) && errors.overlap;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Tên sự kiện <span className={styles.required}>*</span></label>
        <input
          ref={titleInputRef}
          type="text"
          className={`${styles.input} ${showTitleError ? styles.inputError : ''}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleBlur('title')}
          placeholder="Ví dụ: Ăn tối cùng mẹ Yamal"
        />
        {showTitleError && <span className={styles.errorText}>Tên sự kiện không được để trống</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Bắt đầu <span className={styles.required}>*</span></label>
          <input
            type="datetime-local"
            className={`${styles.input} ${(showTimeError || showOverlapError) ? styles.inputError : ''}`}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            onBlur={() => handleBlur('time')}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Kết thúc <span className={styles.required}>*</span></label>
          <input
            type="datetime-local"
            className={`${styles.input} ${(showTimeError || showOverlapError) ? styles.inputError : ''}`}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            onBlur={() => handleBlur('time')}
          />
        </div>
      </div>
      
      {showTimeError && <span className={styles.errorText}>Giờ kết thúc phải lớn hơn giờ bắt đầu</span>}
      {showOverlapError && <span className={styles.errorText}>Khung giờ trùng hoàn toàn với một sự kiện khác</span>}

      <div className={styles.formGroup}>
        <label className={styles.label}>Địa điểm</label>
        <input
          type="text"
          className={styles.input}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="B8.04, tòa B, Đại học Công nghệ Thông Tin, ĐHQG TP.HCM"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Loại hoạt động</label>
        <TypeDropdown 
          value={type} 
          onChange={(val) => setType(val)} 
        />
      </div>
      


      <div className={styles.formGroup}>
        <label className={styles.label}>Mô tả</label>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ghi chú thêm..."
          rows={3}
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btnCancel} onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className={styles.btnSave} disabled={!isFormReady || Object.keys(errors).length > 0}>
          Lưu
        </button>
      </div>
    </form>
  );
};
