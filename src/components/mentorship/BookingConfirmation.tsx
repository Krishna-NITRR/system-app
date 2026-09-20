import { useTimezone } from '../../hooks/useTimezone';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { generateICS, downloadICS } from '../../utils/icsGenerator';

interface Props {
  bookingId: string;
  slotStart: string;
  slotEnd: string;
}

export default function BookingConfirmation({ bookingId, slotStart, slotEnd }: Props) {
  const { timezone } = useTimezone();

  // Zoned times
  const startDateZonedLocal = toZonedTime(new Date(slotStart), timezone);
  const startDateZonedIST = toZonedTime(new Date(slotStart), 'Asia/Kolkata');

  const formattedLocalTime = format(startDateZonedLocal, "EEEE, MMMM d, yyyy 'at' h:mm a");
  const formattedISTTime = format(startDateZonedIST, "EEEE, MMMM d, yyyy 'at' h:mm a");

  const handleDownloadCalendar = () => {
    const icsContent = generateICS(bookingId, slotStart, slotEnd, null);
    downloadICS(icsContent);
  };

  const handleGoogleCalendar = () => {
    const startStr = format(new Date(slotStart), "yyyyMMdd'T'HHmmss'Z'");
    const endStr = format(new Date(slotEnd), "yyyyMMdd'T'HHmmss'Z'");
    const text = encodeURIComponent('1:1 Mentorship Session with Krishna Mahawar');
    const details = encodeURIComponent(`Booking ref: ${bookingId.slice(0, 8)}\n\nPlease prepare your questions in advance.`);
    const location = encodeURIComponent('Google Meet link will be shared via email');

    const gcalUrl = `https://calendar.google.com/calendar/r/eventedit?text=${text}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
    window.open(gcalUrl, '_blank');
  };

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--div)', padding: '40px', textAlign: 'center' }}>
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '50%', 
        background: '#27ae60', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '2rem',
        margin: '0 auto 24px'
      }}>
        ✓
      </div>
      
      <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'var(--text)' }}>Session Confirmed</h2>
      
      <p style={{ color: 'var(--tm)', marginBottom: '32px', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 32px' }}>
        Your payment was successful and your slot is booked. A confirmation email has been sent.
      </p>

      <div style={{ 
        background: 'var(--bg2)', 
        borderRadius: '8px', 
        padding: '24px', 
        marginBottom: '32px',
        textAlign: 'left',
        border: '1px solid var(--div)'
      }}>
        <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--div)', paddingBottom: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--tl)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Your Local Time ({timezone})</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)' }}>
            {formattedLocalTime}
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--tl)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>India Standard Time (IST)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--tm)' }}>
            {formattedISTTime}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
        <button className="btn btn-primary" onClick={handleGoogleCalendar} style={{ padding: '12px 24px' }}>
          Add to Google Calendar
        </button>
        <button className="btn btn-outline" onClick={handleDownloadCalendar} style={{ padding: '12px 24px' }}>
          Download .ics File
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--div)', paddingTop: '32px', textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text)' }}>Next Steps</h4>
        <ul style={{ paddingLeft: '20px', color: 'var(--tm)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li>A Google Meet link will be emailed to you before the session starts.</li>
          <li>Review the answers you submitted in the pre-session form to ensure we stay focused.</li>
          <li>If you need to reschedule, please reply to your confirmation email at least 12 hours in advance.</li>
        </ul>
      </div>
    </div>
  );
}
