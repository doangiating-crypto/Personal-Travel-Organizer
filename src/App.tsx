import { useState } from 'react';
import type { TripEvent } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useRealtimeEngine } from './hooks/useRealtimeEngine';
import { Timeline } from './components/Timeline/Timeline';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Modal } from './components/Modal/Modal';
import { EventForm } from './components/EventForm/EventForm';
import { Map, BarChart3, Search } from 'lucide-react';
import styles from './App.module.css';

function App() {
  const [events, setEvents] = useLocalStorage<TripEvent[]>('trip_events', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TripEvent | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'manage' | 'stats'>('manage');
  const [searchQuery, setSearchQuery] = useState('');

  // Hook realtime engine
  useRealtimeEngine(events, setEvents);

  const handleOpenAddModal = () => {
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: TripEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(undefined);
  };

  const handleSaveEvent = (savedEvent: Omit<TripEvent, 'id'> | TripEvent) => {
    if ('id' in savedEvent && savedEvent.id) {
      // Sửa
      setEvents(events.map(ev => ev.id === savedEvent.id ? savedEvent as TripEvent : ev));
    } else {
      // Thêm mới
      const newEvent: TripEvent = {
        ...savedEvent,
        id: crypto.randomUUID(),
      } as TripEvent;
      setEvents([...events, newEvent]);
    }
    handleCloseModal();
  };

  const handleSwapEvents = (event1: TripEvent, event2: TripEvent) => {
    // Đổi thứ tự thực tế là đổi startTime và endTime cho nhau
    const updatedEvents = events.map(ev => {
      if (ev.id === event1.id) {
        return { ...ev, startTime: event2.startTime, endTime: event2.endTime };
      }
      if (ev.id === event2.id) {
        return { ...ev, startTime: event1.startTime, endTime: event1.endTime };
      }
      return ev;
    });
    setEvents(updatedEvents);
  };

  const handleChangeEventStatus = (event: TripEvent, status: TripEvent['status']) => {
    setEvents(events.map(ev => ev.id === event.id ? { ...ev, status } : ev));
  };

  const filteredEvents = events.filter(ev => 
    ev.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img src="/logo.jpg" alt="Logo" className={styles.logo} />
          <h1 className={styles.sidebarTitle}>Personal Trip Organizer</h1>
        </div>
        <nav className={styles.sidebarNav}>
          <button 
            className={activeTab === 'manage' ? styles.navItemActive : styles.navItem} 
            onClick={() => setActiveTab('manage')}
          >
            <Map className={styles.navIcon} />
            Quản lý
          </button>
          <button 
            className={activeTab === 'stats' ? styles.navItemActive : styles.navItem} 
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 className={styles.navIcon} />
            Thống kê
          </button>
        </nav>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div>
            <h2 className={styles.pageTitle}>{activeTab === 'manage' ? 'Quản lý lịch trình' : 'Thống kê'}</h2>
            <p className={styles.subtitle}>
              {activeTab === 'manage' ? 'Sắp xếp và theo dõi chuyến đi của bạn' : 'Phân tích các hoạt động trong chuyến đi'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Tìm sự kiện..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === 'manage' && (
              <button className={styles.btnAdd} onClick={handleOpenAddModal}>
                + Thêm sự kiện
              </button>
            )}
          </div>
        </header>

        <main className={styles.main}>
          {activeTab === 'manage' ? (
            <div className={styles.timelineSection}>
              <Timeline
                events={filteredEvents}
                onEditEvent={handleEditEvent}
                onSwapEvents={handleSwapEvents}
                onChangeEventStatus={handleChangeEventStatus}
              />
            </div>
          ) : (
            <div className={styles.dashboardSection}>
              <div className={styles.card}>
                <Dashboard events={filteredEvents} />
              </div>
            </div>
          )}
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEvent ? 'Sửa sự kiện' : 'Thêm sự kiện mới'}
      >
        <EventForm
          existingEvents={events}
          initialData={editingEvent}
          onSubmit={handleSaveEvent}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}

export default App;
