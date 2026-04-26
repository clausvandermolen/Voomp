import { useMemo } from 'react';

export const BLOCKING_STATUSES = ['confirmed', 'blocked', 'pending_host', 'pending_guest'];

/**
 * Formats a busy interval for display in the UI.
 * @param {{ start: string, end: string, status: string, reservation?: object }} interval
 * @returns {string} Human-readable label (Spanish)
 */
export function formatBusyLabel(interval) {
  if (!interval) return '';
  const { start, end, status } = interval;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const formatDate = (d) => d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  const label = `${formatDate(startDate)} – ${formatDate(endDate)}`;

  switch (status) {
    case 'confirmed':
      return `Reservado (${label})`;
    case 'blocked':
      return `Bloqueado (${label})`;
    case 'pending_host':
      return `Pendiente de aprobación (${label})`;
    case 'pending_guest':
      return `Esperando pago (${label})`;
    default:
      return `Ocupado (${label})`;
  }
}

/**
 * Checks if two date intervals overlap (inclusive).
 * @param {{ start: Date, end: Date }} a
 * @param {{ start: Date, end: Date }} b
 * @returns {boolean}
 */
export function intervalsOverlap(a, b) {
  if (!a || !b) return false;
  return a.start <= b.end && b.start <= a.end;
}

/**
 * Returns a filtered list of busy intervals that are "blocking" (i.e., the listing is unavailable).
 * @param {Array} intervals
 * @returns {Array}
 */
export function getBusyIntervals(intervals) {
  if (!Array.isArray(intervals)) return [];
  return intervals.filter((interval) => BLOCKING_STATUSES.includes(interval.status));
}

/**
 * Custom hook to process and memoize busy intervals.
 * @param {Array} rawIntervals - array of interval objects from API
 * @returns {{ busyIntervals: Array, isBusyOnDate: function, formattedLabels: Array }}
 */
export default function useBusyIntervals(rawIntervals) {
  const busyIntervals = useMemo(() => getBusyIntervals(rawIntervals), [rawIntervals]);

  const isBusyOnDate = useMemo(() => {
    const busyDatesSet = new Set();
    busyIntervals.forEach((interval) => {
      const start = new Date(interval.start);
      const end = new Date(interval.end);
      const current = new Date(start);
      while (current <= end) {
        busyDatesSet.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });
    return (dateStr) => busyDatesSet.has(dateStr);
  }, [busyIntervals]);

  const formattedLabels = useMemo(
    () => busyIntervals.map(formatBusyLabel),
    [busyIntervals]
  );

  return { busyIntervals, isBusyOnDate, formattedLabels };
}
