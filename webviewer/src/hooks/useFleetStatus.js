import { useMemo } from 'react';
import { formatRelativeTime } from 'utils';

const stateFromAlerts = alerts => {
  if (alerts?.some(alert => alert.rule === 'not_reporting')) return 'silent';
  if (alerts?.some(alert => alert.rule === 'late')) return 'late';
  return 'live';
};

// Backend alerts ignore the selected window for not_reporting/late, so a live
// unit can look "fine" on a day with zero data. Force silent in that case.
const stateForUnit = telemetryUnit => {
  if (!telemetryUnit || !(telemetryUnit.totals?.messages > 0)) return 'silent';
  return stateFromAlerts(telemetryUnit.alerts);
};

export const computeFleetStatus = (units = [], telemetryUnits = []) => {
  const telemetryByUnitId = new Map(telemetryUnits.map(unit => [unit.unit_id, unit]));

  const stateByUnitId = {};
  const counts = { all: 0, live: 0, late: 0, silent: 0 };

  units.forEach(unit => {
    const state = stateForUnit(telemetryByUnitId.get(unit.unit_id));
    stateByUnitId[unit.unit_id] = state;
    counts.all += 1;
    counts[state] += 1;
  });

  const worstState = counts.silent > 0 ? 'silent' : counts.late > 0 ? 'late' : 'live';

  const hasDataThisWindow = telemetryUnits.some(unit => unit.totals?.messages > 0);
  const reportedCount = telemetryUnits.filter(unit => unit.totals?.messages > 0).length;

  const newestMessageAt = telemetryUnits.reduce((newest, unit) => {
    if (!unit.totals?.last_at) return newest;
    return !newest || unit.totals.last_at > newest ? unit.totals.last_at : newest;
  }, null);

  return {
    stateByUnitId,
    counts,
    worstState,
    hasDataThisWindow,
    reportedCount,
    newestMessageAt
  };
};

export const useFleetStatus = (units = [], telemetryUnits = []) =>
  useMemo(() => computeFleetStatus(units, telemetryUnits), [units, telemetryUnits]);

export const getFleetStatusCopy = (
  { counts, hasDataThisWindow, reportedCount, newestMessageAt },
  now = new Date(),
  isLiveWindow = true
) => {
  if (!hasDataThisWindow) {
    return 'No telemetry for this day. Nothing was recorded in the selected window.';
  }

  const n = counts.all;

  if (!isLiveWindow) {
    if (reportedCount === n) {
      const subject = n === 1 ? 'Your unit' : n === 2 ? 'Both units' : `All ${n} units`;
      return `${subject} reported on this day.`;
    }
    return `${reportedCount} of ${n} units reported on this day.`;
  }

  const bad = counts.late + counts.silent;
  const ago = newestMessageAt ? formatRelativeTime(newestMessageAt, now) : 'unknown';

  if (bad === 0) {
    const subject =
      n === 1 ? 'Your unit is' : n === 2 ? 'Both units are' : `All ${n} units are`;
    return `${subject} reporting. Last message ${ago}.`;
  }

  if (bad === n) {
    const subject = n === 1 ? "Your unit hasn't" : 'No units have';
    return `${subject} reported recently. Last message ${ago}.`;
  }

  return `${bad} of ${n} units ${
    bad === 1 ? 'needs' : 'need'
  } attention. Newest message ${ago}.`;
};
