import { formatRelativeTime } from './relativeTime.utils';

const NOW = new Date('2026-08-26T12:00:00Z');

describe('formatRelativeTime', () => {
  it('formats sub-minute gaps in seconds', () => {
    expect(formatRelativeTime(new Date('2026-08-26T11:59:45Z'), NOW)).toBe('15 s ago');
  });

  it('formats sub-hour gaps in minutes', () => {
    expect(formatRelativeTime(new Date('2026-08-26T11:45:00Z'), NOW)).toBe('15 min ago');
  });

  it('formats sub-day gaps in hours and minutes', () => {
    expect(formatRelativeTime(new Date('2026-08-26T09:30:00Z'), NOW)).toBe(
      '2 h 30 min ago'
    );
  });

  it('formats gaps of a day or more in days', () => {
    expect(formatRelativeTime(new Date('2026-08-23T12:00:00Z'), NOW)).toBe('3 days ago');
  });

  it('never returns a negative duration for a timestamp at or after now', () => {
    expect(formatRelativeTime(new Date('2026-08-26T12:00:05Z'), NOW)).toBe('0 s ago');
  });
});
