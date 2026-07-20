// Mock academic schedule data for student and faculty dashboards.
// Current date context: July 20, 2026

const today = "2026-07-20";
const tomorrow = "2026-07-21";

const mockSchedule = [
  // ── Today's lectures (July 20) ──
  {
    id: 1,
    course: "Data Structures",
    faculty: "Prof. Sharma",
    date: today,
    startTime: "09:00",
    endTime: "10:00",
    room: "B204",
    semester: 3,
    section: "A",
    type: "Theory",
    students: 62,
  },
  {
    id: 2,
    course: "DBMS Lab",
    faculty: "Prof. Verma",
    date: today,
    startTime: "14:00",
    endTime: "16:00",
    room: "Lab 3",
    semester: 3,
    section: "A",
    type: "Lab",
    students: 30,
  },
  {
    id: 3,
    course: "Computer Networks",
    faculty: "Prof. Gupta",
    date: today,
    startTime: "11:00",
    endTime: "12:00",
    room: "C101",
    semester: 5,
    section: "B",
    type: "Theory",
    students: 58,
  },

  // ── Tomorrow's lectures (July 21) ──
  {
    id: 4,
    course: "Operating Systems",
    faculty: "Prof. Mehta",
    date: tomorrow,
    startTime: "09:00",
    endTime: "10:30",
    room: "A203",
    semester: 5,
    section: "A",
    type: "Theory",
    students: 55,
  },
  {
    id: 5,
    course: "Algorithms Lab",
    faculty: "Prof. Nair",
    date: tomorrow,
    startTime: "14:00",
    endTime: "17:00",
    room: "Lab 1",
    semester: 3,
    section: "A",
    type: "Lab",
    students: 30,
  },

  // ── Upcoming lectures ──
  {
    id: 6,
    course: "Discrete Mathematics",
    faculty: "Prof. Kapoor",
    date: "2026-07-22",
    startTime: "10:00",
    endTime: "11:00",
    room: "B204",
    semester: 3,
    section: "A",
    type: "Theory",
    students: 62,
  },
  {
    id: 7,
    course: "Data Structures",
    faculty: "Prof. Sharma",
    date: "2026-07-22",
    startTime: "14:00",
    endTime: "15:00",
    room: "B204",
    semester: 3,
    section: "A",
    type: "Tutorial",
    students: 62,
  },
  {
    id: 8,
    course: "Mid-Sem Exam – OS",
    faculty: "Prof. Mehta",
    date: "2026-07-24",
    startTime: "09:00",
    endTime: "11:00",
    room: "Auditorium",
    semester: 5,
    section: "A",
    type: "Exam",
    students: 55,
  },
  {
    id: 9,
    course: "DBMS",
    faculty: "Prof. Verma",
    date: "2026-07-25",
    startTime: "11:00",
    endTime: "12:00",
    room: "C101",
    semester: 3,
    section: "B",
    type: "Theory",
    students: 60,
  },
  {
    id: 10,
    course: "Python Lab",
    faculty: "Prof. Iyer",
    date: "2026-07-28",
    startTime: "14:00",
    endTime: "16:00",
    room: "Lab 2",
    semester: 3,
    section: "A",
    type: "Lab",
    students: 30,
  },
  {
    id: 11,
    course: "Final Exam – Networks",
    faculty: "Prof. Gupta",
    date: "2026-08-02",
    startTime: "09:00",
    endTime: "12:00",
    room: "Hall A",
    semester: 5,
    section: "B",
    type: "Exam",
    students: 58,
  },
  {
    id: 12,
    course: "Computer Graphics",
    faculty: "Prof. Desai",
    date: "2026-07-27",
    startTime: "09:00",
    endTime: "10:00",
    room: "A103",
    semester: 5,
    section: "B",
    type: "Theory",
    students: 48,
  },
];

export default mockSchedule;

export function getLecturesByDate(date) {
  return mockSchedule.filter((l) => l.date === date);
}

export function getDatesWithLectures() {
  return [...new Set(mockSchedule.map((l) => l.date))];
}

