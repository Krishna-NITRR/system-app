import { format } from 'date-fns';

export function generateICS(bookingId: string, slotStartISO: string, slotEndISO: string, meetingLink: string | null): string {
  // ICS dates need to be in UTC format: YYYYMMDDTHHmmssZ
  const formatDateForICS = (isoString: string) => {
    const d = new Date(isoString);
    return format(d, "yyyyMMdd'T'HHmmss'Z'");
  };

  const dtStart = formatDateForICS(slotStartISO);
  const dtEnd = formatDateForICS(slotEndISO);
  
  const now = formatDateForICS(new Date().toISOString());

  const location = meetingLink || 'Google Meet link will be shared via email';
  const description = `Booking ref: ${bookingId.slice(0, 8)}\\n\\nPlease prepare your questions in advance. If you need to reschedule, please let me know at least 12 hours before the session.`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Krishna Mahawar//1:1 Mentorship//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `DTSTAMP:${now}`,
    `UID:${bookingId}@krishnamahawar.in`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:1:1 Mentorship Session with Krishna Mahawar`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

export function downloadICS(icsContent: string, filename: string = 'mentorship-session.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
