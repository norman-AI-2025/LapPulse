/**
 * Time and slot calculation utilities for FCSIT LabPulse
 */

/**
 * Parse time strings like "08:00 am", "08:30 pm", "14:00", "03:00 pm - 04:00 pm", "10:00 - 12:00"
 * into minutes from midnight (0 to 1439).
 */
export const parseTimeToMinutes = (tStr: string): number => {
  try {
    const clean = tStr.trim().toLowerCase();
    const isPM = clean.includes('pm');
    const isAM = clean.includes('am');
    // Extract the first HH:mm occurrence
    const match = clean.match(/(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  } catch {
    return 0;
  }
};

/**
 * Checks if a booking date and slot start time is within 2 hours from current system time.
 * Users must book at least 2 hours in advance from the current time.
 * If date is in the past: true (cannot book past dates).
 * If date is today and slot starts in < 120 minutes from now: true (too soon).
 * If date is today and slot starts in >= 120 minutes from now: false (allowed).
 * If date is in future: false (allowed).
 */
export const isSlotWithin2Hours = (dateStr: string, slotStr: string): boolean => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (dateStr < todayStr) return true; // Past date
  if (dateStr > todayStr) return false; // Future date is >= 2 hours away

  // Date is today
  const slotStartMinutes = parseTimeToMinutes(slotStr.split('-')[0]);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const minNoticeMinutes = currentMinutes + 120; // 2 hours in advance

  return slotStartMinutes < minNoticeMinutes;
};

/**
 * Returns formatted string of the earliest available time today (2 hours from now),
 * e.g. "5:00 PM" if currently 3:00 PM.
 */
export const getEarliestBookingTimeStr = (): string => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const earliestMin = currentMinutes + 120;
  const hours = Math.floor(earliestMin / 60);
  const mins = earliestMin % 60;
  const ampm = hours >= 12 && hours < 24 ? 'PM' : 'AM';
  let displayHour = hours % 12;
  if (displayHour === 0) displayHour = 12;
  return `${displayHour}:${String(mins).padStart(2, '0')} ${ampm}`;
};

