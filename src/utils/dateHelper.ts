/**
 * Returns today's date formatted according to the format style
 */
export function getTodayFormatted(format: 'ISO' | 'US' | 'EU' | 'LONG' = 'ISO'): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case 'ISO':
      return `${year}-${month}-${day}`;
    case 'US':
      return `${month}/${day}/${year}`;
    case 'EU':
      return `${day}/${month}/${year}`;
    case 'LONG':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Standardizes a date string or returns today's date
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return getTodayFormatted('ISO');
  
  // If already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }
  return dateStr;
}
