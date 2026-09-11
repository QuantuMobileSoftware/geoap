import { cardDataForUnit } from './UnitCards';

jest.mock('lodash-es', () => require('lodash'));

const telemetryUnit = ({ messages = 1, lastAt = '2026-08-26T12:00:00Z' } = {}) => ({
  unit_id: 'SS-0142',
  track: [],
  buckets: [],
  totals: {
    messages,
    distance_km: 0,
    images: 0,
    detections: 0,
    first_at: null,
    last_at: lastAt,
    gap_minutes: 0
  }
});

describe('cardDataForUnit', () => {
  const now = new Date('2026-08-26T12:05:00Z');

  it('reads the window-scoped last message time and count when there is data', () => {
    const result = cardDataForUnit(telemetryUnit(), now);

    expect(result).toEqual({ lastMessageText: '5 min ago', messageCount: 1 });
  });

  it('shows "no data" when the window has zero messages', () => {
    const result = cardDataForUnit(telemetryUnit({ messages: 0, lastAt: null }), now);

    expect(result).toEqual({ lastMessageText: 'no data', messageCount: 0 });
  });

  it('shows "no data" when the unit is entirely absent from the telemetry response', () => {
    const result = cardDataForUnit(undefined, now);

    expect(result).toEqual({ lastMessageText: 'no data', messageCount: 0 });
  });
});
