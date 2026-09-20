import { addDays, set, isBefore, addMinutes, formatISO } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';

export interface AvailabilityRow {
  day_of_week: number;
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  slot_duration: number; // minutes
  buffer_after: number;  // minutes
}

export interface BlockedSlotRow {
  block_date: string; // YYYY-MM-DD
  start_time: string | null;
  end_time: string | null;
}

export interface BookedSlotRow {
  slot_start: string; // ISO string UTC
  slot_end: string;   // ISO string UTC
  booking_status: string;
}

import type { DaySlots, Slot } from '../types/mentorship';

export function generateSlots(
  availabilities: AvailabilityRow[],
  blocked: BlockedSlotRow[],
  booked: BookedSlotRow[],
  bookingHorizonDays: number = 14,
  minAdvanceHours: number = 24
): DaySlots[] {
  const result: DaySlots[] = [];
  const now = new Date();
  const minAdvanceTime = addMinutes(now, minAdvanceHours * 60);
  const SOURCE_TZ = 'Asia/Kolkata';

  for (let i = 0; i <= bookingHorizonDays; i++) {
    const targetDate = addDays(now, i);
    const dayOfWeek = targetDate.getDay();
    
    // Find availability for this day of week
    const availability = availabilities.find(a => a.day_of_week === dayOfWeek);
    if (!availability) continue;

    // We generate slots in the SOURCE_TZ then convert to UTC
    const [startH, startM] = availability.start_time.split(':').map(Number);
    const [endH, endM] = availability.end_time.split(':').map(Number);
    
    // Create start and end boundaries for this specific date in Asia/Kolkata
    // To do this reliably, we format the target date as YYYY-MM-DD in the local timezone, 
    // then parse it as if it was midnight in Asia/Kolkata, then add hours/mins.
    const dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    
    const dayStartZoned = toDate(`${dateString}T${availability.start_time}:00`, { timeZone: SOURCE_TZ });
    const dayEndZoned = toDate(`${dateString}T${availability.end_time}:00`, { timeZone: SOURCE_TZ });

    // Check full-day blocks
    const fullDayBlock = blocked.find(b => b.block_date === dateString && !b.start_time);
    if (fullDayBlock) continue;

    let currentSlotStart = dayStartZoned;
    const daySlots: Slot[] = [];

    while (isBefore(currentSlotStart, dayEndZoned)) {
      const currentSlotEnd = addMinutes(currentSlotStart, availability.slot_duration);
      
      // Stop if the slot ends after the availability window
      if (!isBefore(currentSlotEnd, addMinutes(dayEndZoned, 1))) {
        break;
      }

      // Check min advance time
      if (isBefore(currentSlotStart, minAdvanceTime)) {
        currentSlotStart = addMinutes(currentSlotEnd, availability.buffer_after);
        continue;
      }

      // Convert to ISO string (UTC)
      const slotStartISO = currentSlotStart.toISOString();
      const slotEndISO = currentSlotEnd.toISOString();

      // Check blocked slots (partial day)
      const partialBlock = blocked.find(b => {
        if (b.block_date !== dateString || !b.start_time || !b.end_time) return false;
        const blockStartZoned = toDate(`${dateString}T${b.start_time}:00`, { timeZone: SOURCE_TZ });
        const blockEndZoned = toDate(`${dateString}T${b.end_time}:00`, { timeZone: SOURCE_TZ });
        
        return (isBefore(currentSlotStart, blockEndZoned) && isBefore(blockStartZoned, currentSlotEnd));
      });

      // Check booked slots
      const isBooked = booked.some(b => {
        const bStart = new Date(b.slot_start);
        const bEnd = new Date(b.slot_end);
        return (isBefore(currentSlotStart, bEnd) && isBefore(bStart, currentSlotEnd));
      });

      if (!partialBlock && !isBooked) {
        daySlots.push({
          slotStart: slotStartISO,
          slotEnd: slotEndISO
        });
      }

      currentSlotStart = addMinutes(currentSlotEnd, availability.buffer_after);
    }

    if (daySlots.length > 0) {
      result.push({
        date: dateString,
        slots: daySlots
      });
    }
  }

  return result;
}
