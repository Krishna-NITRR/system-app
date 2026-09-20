import { useState } from 'react';
import { useTimezone } from '../../hooks/useTimezone';
import { useAvailableSlots } from '../../hooks/useAvailableSlots';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { Slot } from '../../types/mentorship';

interface Props {
  onSelectSlot: (slot: Slot) => void;
  selectedSlot: Slot | null;
}

export default function SlotPicker({ onSelectSlot, selectedSlot }: Props) {
  const { timezone } = useTimezone();
  const { slots, loading, error } = useAvailableSlots();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--tm)' }}>Loading available slots...</div>;
  }

  if (error) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#e74c3c' }}>Unable to load calendar. Please try again later.</div>;
  }

  if (slots.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--tm)' }}>No slots available right now. Please check back later.</div>;
  }

  // Auto-select first date if none selected
  if (!selectedDate && slots.length > 0) {
    setSelectedDate(slots[0].date);
  }

  const currentDaySlots = slots.find(s => s.date === selectedDate)?.slots || [];

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--div)', padding: '24px' }}>
      <div className="slot-picker-header">
        <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text)' }}>Select a time</h3>
        <div style={{ fontSize: '0.82rem', color: 'var(--tm)', background: 'var(--bg2)', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
          Times shown in <strong>{timezone}</strong>
        </div>
      </div>

      {/* Date selector (horizontal scroll) */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        overflowX: 'auto', 
        paddingBottom: '16px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--div)',
        scrollbarWidth: 'none'
      }}>
        {slots.map(day => {
          const dateObj = new Date(day.date + 'T12:00:00Z'); // stable parse
          const isSelected = selectedDate === day.date;
          return (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              style={{
                flexShrink: 0,
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${isSelected ? 'var(--purple)' : 'var(--div)'}`,
                background: isSelected ? 'var(--purple-light)' : 'transparent',
                color: isSelected ? 'var(--purple)' : 'var(--text)',
                cursor: 'pointer',
                textAlign: 'center',
                minWidth: '80px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                {format(dateObj, 'EEE')}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {format(dateObj, 'd')}
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                {format(dateObj, 'MMM')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Time slots grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
        gap: '12px' 
      }}>
        {currentDaySlots.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--tm)', padding: '24px 0' }}>
            No slots available on this date.
          </div>
        ) : (
          currentDaySlots.map((slot) => {
            const isSelected = selectedSlot?.slotStart === slot.slotStart;
            // Format time in user timezone
            const zonedTime = toZonedTime(new Date(slot.slotStart), timezone);
            const timeString = format(zonedTime, 'h:mm a');

            return (
              <button
                key={slot.slotStart}
                onClick={() => onSelectSlot(slot)}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: `1px solid ${isSelected ? 'var(--purple)' : 'var(--div)'}`,
                  background: isSelected ? 'var(--purple)' : 'transparent',
                  color: isSelected ? 'white' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
              >
                {timeString}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
