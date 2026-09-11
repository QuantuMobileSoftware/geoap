import { computeFleetStatus, getFleetStatusCopy } from './useFleetStatus';

jest.mock('lodash-es', () => require('lodash'));

const OK_ALERT = {
  rule: 'ok',
  severity: 'ok',
  copy: 'Everything looks normal for this unit.'
};
const NOT_REPORTING_ALERT = { rule: 'not_reporting', severity: 'high', copy: '' };
const LATE_ALERT = { rule: 'late', severity: 'medium', copy: '' };

const unit = unitId => ({ unit_id: unitId, machine_label: unitId });

const telemetryUnit = (
  unitId,
  { messages = 1, lastAt = '2026-08-26T12:00:00Z', alerts = [OK_ALERT] } = {}
) => ({
  unit_id: unitId,
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
  },
  alerts
});

const runFleetStatus = computeFleetStatus;

describe('computeFleetStatus', () => {
  it('reads live/late/silent straight off the alerts array when the window has data', () => {
    const units = [unit('A'), unit('B'), unit('C')];
    const telemetry = [
      telemetryUnit('A', { alerts: [OK_ALERT] }),
      telemetryUnit('B', { alerts: [LATE_ALERT] }),
      telemetryUnit('C', { alerts: [NOT_REPORTING_ALERT] })
    ];

    const status = runFleetStatus(units, telemetry);

    expect(status.stateByUnitId).toEqual({ A: 'live', B: 'late', C: 'silent' });
    expect(status.counts).toEqual({ all: 3, live: 1, late: 1, silent: 1 });
    expect(status.worstState).toBe('silent');
  });

  it('forces silent when the window has zero messages, even if alerts came back clean', () => {
    const units = [unit('A')];
    // A live unit on an empty past day: backend still returns [OK_ALERT].
    const telemetry = [
      telemetryUnit('A', { messages: 0, lastAt: null, alerts: [OK_ALERT] })
    ];

    const status = runFleetStatus(units, telemetry);

    expect(status.stateByUnitId.A).toBe('silent');
    expect(status.hasDataThisWindow).toBe(false);
  });

  it('treats a unit missing from the telemetry response as silent', () => {
    const status = runFleetStatus([unit('A')], []);

    expect(status.stateByUnitId.A).toBe('silent');
  });
});

describe('getFleetStatusCopy', () => {
  const now = new Date('2026-08-26T12:05:00Z');

  it('reports "no telemetry for this day" when nothing was recorded in the window', () => {
    const status = runFleetStatus(
      [unit('A')],
      [telemetryUnit('A', { messages: 0, lastAt: null })]
    );

    expect(getFleetStatusCopy(status, now)).toBe(
      'No telemetry for this day. Nothing was recorded in the selected window.'
    );
  });

  it('singular fleet, all good', () => {
    const status = runFleetStatus([unit('A')], [telemetryUnit('A')]);

    expect(getFleetStatusCopy(status, now)).toBe(
      'Your unit is reporting. Last message 5 min ago.'
    );
  });

  it('two-unit fleet, all bad', () => {
    const units = [unit('A'), unit('B')];
    const telemetry = [
      telemetryUnit('A', { alerts: [NOT_REPORTING_ALERT] }),
      telemetryUnit('B', { alerts: [NOT_REPORTING_ALERT] })
    ];
    const status = runFleetStatus(units, telemetry);

    expect(getFleetStatusCopy(status, now)).toBe(
      'No units have reported recently. Last message 5 min ago.'
    );
  });

  it('3+ fleet, mixed', () => {
    const units = [unit('A'), unit('B'), unit('C')];
    const telemetry = [
      telemetryUnit('A', { alerts: [OK_ALERT] }),
      telemetryUnit('B', { alerts: [OK_ALERT] }),
      telemetryUnit('C', { alerts: [NOT_REPORTING_ALERT] })
    ];
    const status = runFleetStatus(units, telemetry);

    expect(getFleetStatusCopy(status, now)).toBe(
      '1 of 3 units needs attention. Newest message 5 min ago.'
    );
  });

  it('past day, unit reported: says so plainly, no "ago"', () => {
    const status = runFleetStatus(
      [unit('A')],
      [telemetryUnit('A', { alerts: [NOT_REPORTING_ALERT] })]
    );

    expect(getFleetStatusCopy(status, now, false)).toBe(
      'Your unit reported on this day.'
    );
  });

  it('past day, only some units reported', () => {
    const units = [unit('A'), unit('B')];
    const telemetry = [
      telemetryUnit('A', { alerts: [NOT_REPORTING_ALERT] }),
      telemetryUnit('B', { messages: 0, lastAt: null, alerts: [OK_ALERT] })
    ];
    const status = runFleetStatus(units, telemetry);

    expect(getFleetStatusCopy(status, now, false)).toBe(
      '1 of 2 units reported on this day.'
    );
  });
});
