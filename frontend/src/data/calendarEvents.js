// Enriched mock calendar events for the ERP Portal.
// Current date context: July 20, 2026

const today = "2026-07-20";

const calendarEvents = [
  // ── Lectures (Theory) ──
  { id: "l1", title: "Data Structures", faculty: "Prof. Sharma", room: "B204", semester: 3, section: "A", type: "Theory", category: "lecture", date: "2026-07-20", start: "09:00", end: "10:00" },
  { id: "l2", title: "Computer Networks", faculty: "Prof. Gupta", room: "C101", semester: 5, section: "B", type: "Theory", category: "lecture", date: "2026-07-20", start: "11:00", end: "12:00" },
  { id: "l3", title: "Operating Systems", faculty: "Prof. Mehta", room: "A203", semester: 5, section: "A", type: "Theory", category: "lecture", date: "2026-07-21", start: "09:00", end: "10:30" },
  { id: "l4", title: "Discrete Mathematics", faculty: "Prof. Kapoor", room: "B204", semester: 3, section: "A", type: "Theory", category: "lecture", date: "2026-07-22", start: "10:00", end: "11:00" },
  { id: "l5", title: "DBMS", faculty: "Prof. Verma", room: "C101", semester: 3, section: "B", type: "Theory", category: "lecture", date: "2026-07-25", start: "11:00", end: "12:00" },
  { id: "l6", title: "Computer Graphics", faculty: "Prof. Desai", room: "A103", semester: 5, section: "B", type: "Theory", category: "lecture", date: "2026-07-27", start: "09:00", end: "10:00" },
  { id: "l7", title: "Data Structures", faculty: "Prof. Sharma", room: "B204", semester: 3, section: "A", type: "Theory", category: "lecture", date: "2026-07-29", start: "09:00", end: "10:00" },
  { id: "l8", title: "Computer Networks", faculty: "Prof. Gupta", room: "C101", semester: 5, section: "B", type: "Theory", category: "lecture", date: "2026-07-30", start: "11:00", end: "12:00" },
  { id: "l9", title: "DBMS", faculty: "Prof. Verma", room: "C101", semester: 3, section: "B", type: "Theory", category: "lecture", date: "2026-08-01", start: "11:00", end: "12:00" },
  { id: "l10", title: "Computer Graphics", faculty: "Prof. Desai", room: "A103", semester: 5, section: "B", type: "Theory", category: "lecture", date: "2026-08-03", start: "09:00", end: "10:00" },

  // ── Labs ──
  { id: "lab1", title: "DBMS Lab", faculty: "Prof. Verma", room: "Lab 3", semester: 3, section: "A", type: "Lab", category: "lab", date: "2026-07-20", start: "14:00", end: "16:00" },
  { id: "lab2", title: "Algorithms Lab", faculty: "Prof. Nair", room: "Lab 1", semester: 3, section: "A", type: "Lab", category: "lab", date: "2026-07-21", start: "14:00", end: "17:00" },
  { id: "lab3", title: "Python Lab", faculty: "Prof. Iyer", room: "Lab 2", semester: 3, section: "A", type: "Lab", category: "lab", date: "2026-07-28", start: "14:00", end: "16:00" },
  { id: "lab4", title: "Networks Lab", faculty: "Prof. Gupta", room: "Lab 1", semester: 5, section: "B", type: "Lab", category: "lab", date: "2026-07-23", start: "14:00", end: "16:00" },
  { id: "lab5", title: "DBMS Lab", faculty: "Prof. Verma", room: "Lab 3", semester: 3, section: "A", type: "Lab", category: "lab", date: "2026-07-27", start: "14:00", end: "16:00" },

  // ── Tutorials ──
  { id: "t1", title: "Data Structures Tutorial", faculty: "Prof. Sharma", room: "B204", semester: 3, section: "A", type: "Tutorial", category: "tutorial", date: "2026-07-22", start: "14:00", end: "15:00" },
  { id: "t2", title: "OS Tutorial", faculty: "Prof. Mehta", room: "A203", semester: 5, section: "A", type: "Tutorial", category: "tutorial", date: "2026-07-24", start: "14:00", end: "15:00" },

  // ── Exams ──
  { id: "e1", title: "Mid-Sem Exam – OS", faculty: "Prof. Mehta", room: "Auditorium", semester: 5, section: "A", type: "Exam", category: "exam", date: "2026-07-24", start: "09:00", end: "11:00" },
  { id: "e2", title: "Final Exam – Networks", faculty: "Prof. Gupta", room: "Hall A", semester: 5, section: "B", type: "Exam", category: "exam", date: "2026-08-02", start: "09:00", end: "12:00" },
  { id: "e3", title: "Mid-Sem Exam – DS", faculty: "Prof. Sharma", room: "Auditorium", semester: 3, section: "A", type: "Exam", category: "exam", date: "2026-07-30", start: "09:00", end: "11:00" },
  { id: "e4", title: "Quiz – DBMS", faculty: "Prof. Verma", room: "C101", semester: 3, section: "B", type: "Exam", category: "exam", date: "2026-07-26", start: "10:00", end: "11:00" },

  // ── Assignment Deadlines ──
  { id: "a1", title: "DS Assignment 3 Due", faculty: "Prof. Sharma", room: "", semester: 3, section: "A", type: "Assignment", category: "assignment", date: "2026-07-23", start: "23:59", end: "23:59" },
  { id: "a2", title: "Networks Project Due", faculty: "Prof. Gupta", room: "", semester: 5, section: "B", type: "Assignment", category: "assignment", date: "2026-07-26", start: "23:59", end: "23:59" },
  { id: "a3", title: "OS Lab Report Due", faculty: "Prof. Mehta", room: "", semester: 5, section: "A", type: "Assignment", category: "assignment", date: "2026-07-29", start: "23:59", end: "23:59" },
  { id: "a4", title: "Python Assignment Due", faculty: "Prof. Iyer", room: "", semester: 3, section: "A", type: "Assignment", category: "assignment", date: "2026-08-01", start: "23:59", end: "23:59" },

  // ── Holidays ──
  { id: "h1", title: "Foundation Day", faculty: "", room: "", semester: 0, section: "", type: "Holiday", category: "holiday", date: "2026-07-26", start: "", end: "" },
  { id: "h2", title: "National Sports Day", faculty: "", room: "", semester: 0, section: "", type: "Holiday", category: "holiday", date: "2026-08-01", start: "", end: "" },
  { id: "h3", title: "Independence Day", faculty: "", room: "", semester: 0, section: "", type: "Holiday", category: "holiday", date: "2026-08-15", start: "", end: "" },
];

export default calendarEvents;

// ── Utility functions ──

export function getEventsByDate(date) {
  return calendarEvents.filter((e) => e.date === date);
}

export function getEventsInRange(startDate, endDate) {
  return calendarEvents.filter((e) => e.date >= startDate && e.date <= endDate);
}

export function getDatesWithEvents(category = null) {
  let filtered = calendarEvents;
  if (category) filtered = filtered.filter((e) => e.category === category);
  return [...new Set(filtered.map((e) => e.date))];
}

export function getEventsByCategory(category) {
  return calendarEvents.filter((e) => e.category === category);
}

export function getWeekDates(refDate) {
  const d = new Date(refDate + "T00:00:00");
  const day = d.getDay();
  // Get Monday (day=1); for Sunday (day=0), go back 6 days
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + i);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, "0");
    const dayStr = String(next.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${dayStr}`);
  }
  return dates;
}

export function getColorForCategory(category) {
  switch (category) {
    case "lecture": return "var(--primary-400)";
    case "lab": return "var(--success)";
    case "exam": return "var(--danger)";
    case "assignment": return "var(--amber-500)";
    case "tutorial": return "var(--violet-400)";
    case "holiday": return "var(--warning)";
    default: return "var(--muted-2)";
  }
}
