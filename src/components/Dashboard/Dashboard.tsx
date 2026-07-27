import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import type { TripEvent } from '../../types';
import styles from './Dashboard.module.css';

interface DashboardProps {
  events: TripEvent[];
}

export const Dashboard: React.FC<DashboardProps> = ({ events }) => {
  const typeChartRef = useRef<HTMLCanvasElement>(null);
  const statusChartRef = useRef<HTMLCanvasElement>(null);

  const typeChartInstance = useRef<Chart | null>(null);
  const statusChartInstance = useRef<Chart | null>(null);

  // Lấy danh sách sự kiện đang diễn ra
  const currentEvents = useMemo(
    () => events.filter((ev) => ev.status === 'Đang diễn ra'),
    [events]
  );

  // Thống kê theo Loại
  const typeStats = useMemo(() => {
    return events.reduce((acc, ev) => {
      acc[ev.type] = (acc[ev.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [events]);

  // Thống kê theo Trạng thái
  const statusStats = useMemo(() => {
    return events.reduce((acc, ev) => {
      acc[ev.status] = (acc[ev.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [events]);

  useEffect(() => {
    // Colors from CSS variables (since we can't directly use CSS variables in Chart.js easily without getComputedStyle)
    // For simplicity, we hardcode the hex values from design tokens
    const typeColors = {
      'Ăn uống': '#F97316', // orange-500
      'Ngắm cảnh': '#3B82F6', // blue-500
      'Bonding': '#A855F7', // purple-500
      'Khác': '#6B7280', // gray-500
    };

    if (typeChartRef.current) {
      if (typeChartInstance.current) {
        typeChartInstance.current.destroy();
      }

      const labels = Object.keys(typeStats);
      const data = Object.values(typeStats);
      const bgColors = labels.map(l => typeColors[l as keyof typeof typeColors] || '#6B7280');

      typeChartInstance.current = new Chart(typeChartRef.current, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: bgColors,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });
    }

    const statusColors = {
      'Sắp tới': '#3B82F6', // blue-500
      'Đang diễn ra': '#22C55E', // green-500
      'Đã xong': '#6B7280', // gray-500
      'Tạm hoãn': '#F59E0B', // yellow-500 (approx)
      'Hủy': '#EF4444', // red-500
    };

    if (statusChartRef.current) {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }

      const labels = Object.keys(statusStats);
      const data = Object.values(statusStats);
      const bgColors = labels.map(l => statusColors[l as keyof typeof statusColors] || '#6B7280');

      statusChartInstance.current = new Chart(statusChartRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Số lượng',
              data,
              backgroundColor: bgColors,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    }

    return () => {
      if (typeChartInstance.current) typeChartInstance.current.destroy();
      if (statusChartInstance.current) statusChartInstance.current.destroy();
    };
  }, [typeStats, statusStats]);

  return (
    <div className={styles.dashboard}>
      {/* Highlight sự kiện đang diễn ra */}
      {currentEvents.length > 0 && (
        <div className={styles.highlightSection}>
          <h3 className={styles.highlightTitle}>
            <span className={styles.pulseIcon}></span> Đang diễn ra ({currentEvents.length})
          </h3>
          <div className={styles.ongoingList}>
            {currentEvents.map(event => {
              const formatTime = (timeStr: string) => 
                new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={event.id} className={styles.ongoingItem}>
                  <div className={styles.ongoingInfo}>
                    <span className={styles.ongoingName}>{event.title}</span>
                    {event.location && <span className={styles.ongoingLocation}>- 📍 {event.location}</span>}
                  </div>
                  <span className={styles.ongoingTime}>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.chartsContainer}>
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Phân bổ loại hoạt động</h4>
          <div className={styles.canvasWrapper}>
            <canvas ref={typeChartRef}></canvas>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Thống kê trạng thái</h4>
          <div className={styles.canvasWrapper}>
            <canvas ref={statusChartRef}></canvas>
          </div>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className={styles.summaryStats}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Tổng sự kiện</span>
          <span className={styles.statValue}>{events.length}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Đã trải qua</span>
          <span className={styles.statValue}>{statusStats['Đã xong'] || 0}</span>
        </div>
      </div>
    </div>
  );
};
