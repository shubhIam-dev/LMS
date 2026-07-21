// Calendar — full redesigned calendar page with 3 views, filters, search, and sidebar.
// Students see lectures/labs/exams/assignments. Faculty can also schedule lectures.

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { selectRole } from "../store/authSlice";
import CalendarToolbar from "../components/Calendar/CalendarToolbar";
import WeekView from "../components/Calendar/WeekView";
import MonthView from "../components/Calendar/MonthView";
import AgendaView from "../components/Calendar/AgendaView";
import CalendarSidebar from "../components/Calendar/CalendarSidebar";
import ScheduleLectureModal from "../components/Faculty/ScheduleLectureModal";
import calendarEvents from "../data/calendarEvents";

const today = "2026-07-20";

function CalendarPage() {
  const role = useSelector(selectRole);
  const isStaff = role === "teacher" || role === "superadmin";
  const [searchParams] = useSearchParams();
  const urlDate = searchParams.get("date") || today;

  const [view, setView] = useState("week");
  const [selectedDate, setSelectedDate] = useState(urlDate);
  const [currentMonth, setCurrentMonth] = useState(6); // July
  const [currentYear, setCurrentYear] = useState(2026);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ semester: "", section: "", category: "" });
  const [events, setEvents] = useState(calendarEvents);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter events
  const filteredEvents = useMemo(() => {
    let result = events;
    if (filters.semester) result = result.filter((e) => e.semester === parseInt(filters.semester));
    if (filters.section) result = result.filter((e) => e.section === filters.section);
    if (filters.category) result = result.filter((e) => e.category === filters.category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.faculty?.toLowerCase().includes(q) ||
        e.room?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, filters, searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const dt = new Date(date + "T00:00:00");
    setCurrentMonth(dt.getMonth());
    setCurrentYear(dt.getFullYear());
  };

  const handleToday = () => {
    setSelectedDate(today);
    setCurrentMonth(6);
    setCurrentYear(2026);
  };

  const handleMonthNav = (dir) => {
    let newMonth, newYear;
    if (dir === "prev") {
      if (currentMonth === 0) { newMonth = 11; newYear = currentYear - 1; }
      else { newMonth = currentMonth - 1; newYear = currentYear; }
    } else {
      if (currentMonth === 11) { newMonth = 0; newYear = currentYear + 1; }
      else { newMonth = currentMonth + 1; newYear = currentYear; }
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    // Sync selected date to 1st of new month so sidebar updates
    const firstOfMonth = `${newYear}-${String(newMonth + 1).padStart(2, "0")}-01`;
    setSelectedDate(firstOfMonth);
  };

  const handleAddLecture = (newEvent) => {
    calendarEvents.push(newEvent);
    setEvents([...events, newEvent]);
    setSelectedDate(newEvent.date);
  };

  return (
    <div className="calendar-page">
      {/* Header */}
      <div className="cal-page-header">
        <div className="cal-page-header-left">
          <button className="cal-nav-arrow" onClick={() => handleMonthNav("prev")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h1 className="cal-page-title">
            {new Date(currentYear, currentMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h1>
          <button className="cal-nav-arrow" onClick={() => handleMonthNav("next")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        onToday={handleToday}
      />

      {/* Main Layout */}
      <div className="cal-page-layout">
        <div className="cal-page-main">
          {view === "week" && (
            <div className="schedule-card cal-view-card">
              <WeekView
                currentDate={selectedDate}
                events={filteredEvents}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
          )}
          {view === "month" && (
            <div className="schedule-card cal-view-card">
              <MonthView
                currentMonth={currentMonth}
                currentYear={currentYear}
                events={filteredEvents}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
          )}
          {view === "agenda" && (
            <div className="schedule-card cal-view-card">
              <AgendaView events={filteredEvents} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="cal-page-sidebar">
          <CalendarSidebar
            selectedDate={selectedDate}
            events={filteredEvents}
            isStaff={isStaff}
            onAddLecture={() => setModalOpen(true)}
          />
        </div>
      </div>

      {/* Schedule Lecture Modal */}
      {isStaff && (
        <ScheduleLectureModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleAddLecture}
        />
      )}
    </div>
  );
}

export default CalendarPage;
