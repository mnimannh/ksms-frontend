// ─── Shared Static Data ────────────────────────────────────────────────────────

export const STAFF = [
  { id: 1, name: 'Aiman Hakim' },
  { id: 2, name: 'Nur Farah' },
  { id: 3, name: 'Razif Azlan' },
  { id: 4, name: 'Siti Norzahra' },
  { id: 5, name: 'Daniel Lim' },
  { id: 6, name: 'Priya Nair' },
];

export const SHIFTS = [
  { id: 1,  userID: 1, assignedBy: 'Admin (You)', startTime: '2025-03-03T07:00:00', endTime: '2025-03-03T15:00:00', shiftType: 'Morning', notes: 'Open store. Check inventory.' },
  { id: 2,  userID: 2, assignedBy: 'Admin (You)', startTime: '2025-03-03T14:00:00', endTime: '2025-03-03T22:00:00', shiftType: 'Evening', notes: 'Closing shift.' },
  { id: 3,  userID: 3, assignedBy: 'Admin (You)', startTime: '2025-03-05T07:00:00', endTime: '2025-03-05T15:00:00', shiftType: 'Morning', notes: null },
  { id: 4,  userID: 4, assignedBy: 'Admin (You)', startTime: '2025-03-05T14:00:00', endTime: '2025-03-05T22:00:00', shiftType: 'Evening', notes: 'Team briefing 14:30.' },
  { id: 5,  userID: 5, assignedBy: 'Admin (You)', startTime: '2025-03-07T07:00:00', endTime: '2025-03-07T15:00:00', shiftType: 'Morning', notes: null },
  { id: 6,  userID: 6, assignedBy: 'Admin (You)', startTime: '2025-03-07T14:00:00', endTime: '2025-03-07T22:00:00', shiftType: 'Evening', notes: null },
  { id: 7,  userID: 1, assignedBy: 'Admin (You)', startTime: '2025-03-10T07:00:00', endTime: '2025-03-10T15:00:00', shiftType: 'Morning', notes: 'Monthly stock audit.' },
  { id: 8,  userID: 2, assignedBy: 'Admin (You)', startTime: '2025-03-10T14:00:00', endTime: '2025-03-10T22:00:00', shiftType: 'Evening', notes: null },
  { id: 9,  userID: 3, assignedBy: 'Admin (You)', startTime: '2025-03-12T07:00:00', endTime: '2025-03-12T15:00:00', shiftType: 'Morning', notes: 'Training session.' },
  { id: 10, userID: 4, assignedBy: 'Admin (You)', startTime: '2025-03-12T14:00:00', endTime: '2025-03-12T22:00:00', shiftType: 'Evening', notes: null },
  { id: 11, userID: 5, assignedBy: 'Admin (You)', startTime: '2025-03-14T07:00:00', endTime: '2025-03-14T15:00:00', shiftType: 'Morning', notes: null },
  { id: 12, userID: 6, assignedBy: 'Admin (You)', startTime: '2025-03-17T14:00:00', endTime: '2025-03-17T22:00:00', shiftType: 'Evening', notes: null },
];

export const ATTENDANCE = [
  { id: 1,  shiftID: 1,  userID: 1, checkIn: '2025-03-03T07:02:00', checkOut: '2025-03-03T15:01:00', status: 'Completed', notes: null },
  { id: 2,  shiftID: 2,  userID: 2, checkIn: '2025-03-03T14:18:00', checkOut: '2025-03-03T22:05:00', status: 'Late',      notes: 'Arrived 18 min late' },
  { id: 3,  shiftID: 3,  userID: 3, checkIn: '2025-03-05T07:00:00', checkOut: '2025-03-05T15:00:00', status: 'Completed', notes: null },
  { id: 4,  shiftID: 4,  userID: 4, checkIn: null,                   checkOut: null,                  status: 'Missed',    notes: 'No show' },
  { id: 5,  shiftID: 5,  userID: 5, checkIn: '2025-03-07T07:05:00', checkOut: '2025-03-07T15:00:00', status: 'Completed', notes: null },
  { id: 6,  shiftID: 6,  userID: 6, checkIn: '2025-03-07T14:00:00', checkOut: null,                  status: 'Pending',   notes: null },
  { id: 7,  shiftID: 7,  userID: 1, checkIn: '2025-03-10T07:12:00', checkOut: '2025-03-10T15:00:00', status: 'Late',      notes: 'Traffic delay' },
  { id: 8,  shiftID: 8,  userID: 2, checkIn: '2025-03-10T14:00:00', checkOut: '2025-03-10T22:00:00', status: 'Completed', notes: null },
  { id: 9,  shiftID: 9,  userID: 3, checkIn: null,                   checkOut: null,                  status: 'Pending',   notes: null },
  { id: 10, shiftID: 10, userID: 4, checkIn: '2025-03-12T14:00:00', checkOut: '2025-03-12T22:00:00', status: 'Completed', notes: null },
  { id: 11, shiftID: 11, userID: 5, checkIn: '2025-03-14T07:00:00', checkOut: '2025-03-14T15:00:00', status: 'Completed', notes: null },
  { id: 12, shiftID: 12, userID: 6, checkIn: null,                   checkOut: null,                  status: 'Pending',   notes: null },
];

// ─── Shared Helpers ────────────────────────────────────────────────────────────

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export function formatTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
}

export function formatShortDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function isLate(log) {
  if (!log.checkIn || !log.shiftStart) return false;
  return new Date(log.checkIn) - new Date(log.shiftStart) > 10 * 60 * 1000;
}