/**
 * STYLEORA — Centralized Date & Time Formatting Utilities
 *
 * Provides customer-facing and atelier ledger datetime formatting in Indian Standard Time (IST, Asia/Kolkata).
 * Output adheres strictly to the luxury editorial format: "Thu Sep 17, 02:26am".
 */

/**
 * Formats an ISO 8601 or UTC datetime string into a customer-facing IST string.
 *
 * Example:
 *   formatDateTime('2026-09-16T20:56:00Z') -> 'Thu Sep 17, 02:26am'
 *   formatDateTime('2026-09-17T18:15:00Z') -> 'Thu Sep 17, 11:45pm'
 *   formatDateTime('2026-09-18T03:35:00Z') -> 'Fri Sep 18, 09:05am'
 *
 * @param {string | Date} dateInput - ISO timestamp string or Date object
 * @param {string} [timeZone='Asia/Kolkata'] - Target IANA timezone (defaults to Asia/Kolkata)
 * @returns {string} Formatted timestamp string e.g. "Thu Sep 17, 02:26am", or empty string if input is empty/invalid
 */
export function formatDateTime(dateInput, timeZone = 'Asia/Kolkata') {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return String(dateInput || '');
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const parts = formatter.formatToParts(date);
    let weekday = '';
    let month = '';
    let day = '';
    let hour = '';
    let minute = '';
    let dayPeriod = '';

    for (const part of parts) {
      if (part.type === 'weekday') weekday = part.value;
      else if (part.type === 'month') month = part.value;
      else if (part.type === 'day') day = part.value;
      else if (part.type === 'hour') hour = part.value;
      else if (part.type === 'minute') minute = part.value;
      else if (part.type === 'dayPeriod') dayPeriod = part.value.toLowerCase();
    }

    const paddedHour = hour.padStart(2, '0');
    return `${weekday} ${month} ${day}, ${paddedHour}:${minute}${dayPeriod}`;
  } catch (err) {
    console.error('Error formatting datetime:', err);
    return date.toISOString();
  }
}
