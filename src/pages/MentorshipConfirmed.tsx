import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import PageLayout from '../components/PageLayout';
import BookingConfirmation from '../components/mentorship/BookingConfirmation';

export default function MentorshipConfirmed() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<{ slot_start: string; slot_end: string } | null>(null);

  useEffect(() => {
    if (!bookingId) {
      navigate('/mentorship');
      return;
    }

    async function fetchBooking() {
      // Fetch booking details using anon key (read allowed via RLS if confirmed)
      const { data, error } = await supabase
        .from('mentorship_bookings')
        .select('slot_start, slot_end, booking_status')
        .eq('id', bookingId)
        .single();

      if (error || !data || data.booking_status !== 'confirmed') {
        console.error('Failed to load confirmed booking:', error);
        navigate('/mentorship');
      } else {
        setBooking(data);
      }
      setLoading(false);
    }

    fetchBooking();
  }, [bookingId, navigate]);

  return (
    <PageLayout>
      <section className="sec" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap fade vis" style={{ width: '100%', maxWidth: '700px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--tm)', padding: '60px' }}>Loading confirmation...</div>
          ) : booking && bookingId ? (
            <>
              <BookingConfirmation 
                bookingId={bookingId} 
                slotStart={booking.slot_start} 
                slotEnd={booking.slot_end} 
              />
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link to="/" style={{ color: 'var(--tm)', textDecoration: 'none' }}>← Return to Homepage</Link>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </PageLayout>
  );
}
