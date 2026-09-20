import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { generateSlots, AvailabilityRow, BlockedSlotRow, BookedSlotRow } from '../utils/slotGenerator';
import type { DaySlots } from '../types/mentorship';

export function useAvailableSlots() {
  const [slots, setSlots] = useState<DaySlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSlots() {
      try {
        setLoading(true);
        setError(null);

        // Fetch availability
        const { data: availData, error: availError } = await supabase
          .from('mentorship_availability')
          .select('*')
          .eq('is_active', true);
        
        if (availError) throw availError;

        // Fetch blocked slots (from today onwards)
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: blockedData, error: blockedError } = await supabase
          .from('mentorship_blocked_slots')
          .select('*')
          .gte('block_date', todayStr);
          
        if (blockedError) throw blockedError;

        // Fetch bookings (active ones only)
        const { data: bookedData, error: bookedError } = await supabase
          .from('mentorship_bookings')
          .select('slot_start, slot_end, booking_status')
          .in('booking_status', ['payment_pending', 'confirmed']);
          
        if (bookedError) throw bookedError;

        // Ensure proper types
        const availabilityRows: AvailabilityRow[] = availData || [];
        const blockedRows: BlockedSlotRow[] = blockedData || [];
        const bookedRows: BookedSlotRow[] = bookedData || [];

        // Generate slots locally
        const daySlots = generateSlots(availabilityRows, blockedRows, bookedRows);

        if (mounted) {
          setSlots(daySlots);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching slots:', err);
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    }

    fetchSlots();

    return () => {
      mounted = false;
    };
  }, []);

  return { slots, loading, error };
}
