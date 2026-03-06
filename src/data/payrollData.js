// payrollData.js — Hardcoded payroll data (UC005)

export const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' },   { value: 4, label: 'April' },
  { value: 5, label: 'May' },     { value: 6, label: 'June' },
  { value: 7, label: 'July' },    { value: 8, label: 'August' },
  { value: 9, label: 'September' },{ value: 10, label: 'October' },
  { value: 11, label: 'November' },{ value: 12, label: 'December' },
]

export const YEARS = [2023, 2024, 2025]

export const STAFF_LIST = [
  {
    userID: 101,
    name: 'Ahmad Razif',
    initials: 'AR',
    department: 'Security',
    avatarColor: '#3b82f6',
    totalShifts: 22,
    completedShifts: 20,
    hoursWorked: 158.5,
    payrollStatus: 'pending',
    attendance: { completed: 18, late: 2, missed: 2 },
    recentLogs: [
      { id: 1, date: 'Mar 01', checkIn: '08:02', checkOut: '16:05', hours: 8.0, status: 'Completed' },
      { id: 2, date: 'Mar 02', checkIn: '08:22', checkOut: '16:10', hours: 7.8, status: 'Late' },
      { id: 3, date: 'Mar 03', checkIn: '08:00', checkOut: '16:00', hours: 8.0, status: 'Completed' },
      { id: 4, date: 'Mar 04', checkIn: '—',     checkOut: '—',     hours: 0,   status: 'Missed' },
      { id: 5, date: 'Mar 05', checkIn: '08:01', checkOut: '16:03', hours: 8.0, status: 'Completed' },
    ],
    allLogs: [
      { id: 1, shiftID: 3011, date: 'Mar 01', checkIn: '08:02', checkOut: '16:05', hours: 8.0,  status: 'Completed', notes: '' },
      { id: 2, shiftID: 3012, date: 'Mar 02', checkIn: '08:22', checkOut: '16:10', hours: 7.8,  status: 'Late',      notes: 'Traffic delay' },
      { id: 3, shiftID: 3013, date: 'Mar 03', checkIn: '08:00', checkOut: '16:00', hours: 8.0,  status: 'Completed', notes: '' },
      { id: 4, shiftID: 3014, date: 'Mar 04', checkIn: '—',     checkOut: '—',     hours: 0,    status: 'Missed',    notes: 'MC submitted' },
      { id: 5, shiftID: 3015, date: 'Mar 05', checkIn: '08:01', checkOut: '16:03', hours: 8.0,  status: 'Completed', notes: '' },
      { id: 6, shiftID: 3016, date: 'Mar 06', checkIn: '08:00', checkOut: '20:00', hours: 12.0, status: 'Completed', notes: 'OT approved' },
    ],
  },
  {
    userID: 102,
    name: 'Nurul Izzah',
    initials: 'NI',
    department: 'Housekeeping',
    avatarColor: '#8b5cf6',
    totalShifts: 20,
    completedShifts: 20,
    hoursWorked: 172.0,
    payrollStatus: 'generated',
    attendance: { completed: 20, late: 0, missed: 0 },
    recentLogs: [
      { id: 1, date: 'Mar 01', checkIn: '07:58', checkOut: '16:02', hours: 8.0, status: 'Completed' },
      { id: 2, date: 'Mar 02', checkIn: '08:00', checkOut: '16:00', hours: 8.0, status: 'Completed' },
    ],
    allLogs: [
      { id: 1, shiftID: 3020, date: 'Mar 01', checkIn: '07:58', checkOut: '16:02', hours: 8.0, status: 'Completed', notes: '' },
      { id: 2, shiftID: 3021, date: 'Mar 02', checkIn: '08:00', checkOut: '16:00', hours: 8.0, status: 'Completed', notes: '' },
    ],
  },
  {
    userID: 103,
    name: 'Mohd Faris',
    initials: 'MF',
    department: 'F&B',
    avatarColor: '#10b981',
    totalShifts: 24,
    completedShifts: 21,
    hoursWorked: 162.5,
    payrollStatus: 'pending',
    attendance: { completed: 19, late: 2, missed: 3 },
    recentLogs: [
      { id: 1, date: 'Mar 01', checkIn: '10:05', checkOut: '18:10', hours: 8.1, status: 'Late' },
      { id: 2, date: 'Mar 02', checkIn: '10:00', checkOut: '18:00', hours: 8.0, status: 'Completed' },
    ],
    allLogs: [
      { id: 1, shiftID: 3030, date: 'Mar 01', checkIn: '10:05', checkOut: '18:10', hours: 8.1, status: 'Late',      notes: '' },
      { id: 2, shiftID: 3031, date: 'Mar 02', checkIn: '10:00', checkOut: '18:00', hours: 8.0, status: 'Completed', notes: '' },
      { id: 3, shiftID: 3032, date: 'Mar 03', checkIn: '—',     checkOut: '—',     hours: 0,   status: 'Missed',    notes: '' },
    ],
  },
  {
    userID: 104,
    name: 'Siti Hajar',
    initials: 'SH',
    department: 'Reception',
    avatarColor: '#f59e0b',
    totalShifts: 22,
    completedShifts: 22,
    hoursWorked: 180.0,
    payrollStatus: 'received',
    attendance: { completed: 22, late: 0, missed: 0 },
    recentLogs: [
      { id: 1, date: 'Mar 01', checkIn: '08:00', checkOut: '16:00', hours: 8.0, status: 'Completed' },
    ],
    allLogs: [
      { id: 1, shiftID: 3040, date: 'Mar 01', checkIn: '08:00', checkOut: '16:00', hours: 8.0, status: 'Completed', notes: '' },
    ],
  },
  {
    userID: 105,
    name: 'Eko Prasetyo',
    initials: 'EP',
    department: 'Security',
    avatarColor: '#ef4444',
    totalShifts: 18,
    completedShifts: 14,
    hoursWorked: 110.0,
    payrollStatus: 'pending',
    attendance: { completed: 12, late: 2, missed: 4 },
    recentLogs: [
      { id: 1, date: 'Mar 01', checkIn: '20:00', checkOut: '04:00', hours: 8.0, status: 'Completed' },
      { id: 2, date: 'Mar 02', checkIn: '—',     checkOut: '—',     hours: 0,   status: 'Missed' },
    ],
    allLogs: [
      { id: 1, shiftID: 3050, date: 'Mar 01', checkIn: '20:00', checkOut: '04:00', hours: 8.0, status: 'Completed', notes: '' },
      { id: 2, shiftID: 3051, date: 'Mar 02', checkIn: '—',     checkOut: '—',     hours: 0,   status: 'Missed',    notes: 'No show' },
    ],
  },
  {
    userID: 106,
    name: 'Lim Wei Ling',
    initials: 'LW',
    department: 'F&B',
    avatarColor: '#06b6d4',
    totalShifts: 20,
    completedShifts: 19,
    hoursWorked: 148.0,
    payrollStatus: 'generated',
    attendance: { completed: 18, late: 1, missed: 1 },
    recentLogs: [
      { id: 1, date: 'Mar 01', checkIn: '09:58', checkOut: '18:02', hours: 8.1, status: 'Completed' },
    ],
    allLogs: [
      { id: 1, shiftID: 3060, date: 'Mar 01', checkIn: '09:58', checkOut: '18:02', hours: 8.1, status: 'Completed', notes: '' },
    ],
  },
]