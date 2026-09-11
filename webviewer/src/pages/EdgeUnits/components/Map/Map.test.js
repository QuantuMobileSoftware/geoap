import { getMapEmptyMessage } from './Map';

jest.mock('lodash-es', () => require('lodash'));

describe('getMapEmptyMessage', () => {
  it('returns null when at least one visible unit has track data', () => {
    const message = getMapEmptyMessage({
      unitCount: 3,
      unitsWithTrackCount: 1,
      rolling: true,
      resolvedDay: '2026-08-26'
    });

    expect(message).toBeNull();
  });

  it('blames the filter when the chip filter matched zero units', () => {
    const message = getMapEmptyMessage({
      unitCount: 0,
      unitsWithTrackCount: 0,
      rolling: true,
      resolvedDay: '2026-08-26'
    });

    expect(message).toBe('No units match this filter.');
  });

  it('reports the rolling window as empty when units exist but none have track data', () => {
    const message = getMapEmptyMessage({
      unitCount: 3,
      unitsWithTrackCount: 0,
      rolling: true,
      resolvedDay: '2026-08-26'
    });

    expect(message).toBe(
      'No telemetry in the last 24 hours. The units may be powered off.'
    );
  });

  it('names the selected day when a specific (non-rolling) day is empty', () => {
    const message = getMapEmptyMessage({
      unitCount: 3,
      unitsWithTrackCount: 0,
      rolling: false,
      resolvedDay: '2026-08-26'
    });

    expect(message).toContain('Nothing recorded on');
  });

  it('prioritizes the filter message even when the window is also empty', () => {
    const message = getMapEmptyMessage({
      unitCount: 0,
      unitsWithTrackCount: 0,
      rolling: false,
      resolvedDay: '2026-08-26'
    });

    expect(message).toBe('No units match this filter.');
  });
});
