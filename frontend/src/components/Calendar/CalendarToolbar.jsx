function CalendarToolbar({ view, onViewChange, searchQuery, onSearchChange, filters, onFilterChange, onToday }) {
  const views = [
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "agenda", label: "Agenda" },
  ];

  return (
    <div className="cal-toolbar">
      <div className="cal-toolbar-left">
        <button className="cal-toolbar-today" onClick={onToday}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
          </svg>
          Today
        </button>
        <div className="cal-view-switcher">
          {views.map((v) => (
            <button
              key={v.key}
              className={`cal-view-btn ${view === v.key ? "active" : ""}`}
              onClick={() => onViewChange(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cal-toolbar-center">
        <div className="cal-search-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" className="cal-search-icon">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            className="cal-search-input"
            placeholder="Search lecture..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="cal-toolbar-right">
        <select className="cal-filter-select" value={filters.semester} onChange={(e) => onFilterChange("semester", e.target.value)}>
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <select className="cal-filter-select" value={filters.section} onChange={(e) => onFilterChange("section", e.target.value)}>
          <option value="">All Sections</option>
          {["A","B","C"].map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
        <select className="cal-filter-select" value={filters.category} onChange={(e) => onFilterChange("category", e.target.value)}>
          <option value="">All Types</option>
          <option value="lecture">Lecture</option>
          <option value="lab">Lab</option>
          <option value="exam">Exam</option>
          <option value="assignment">Assignment</option>
          <option value="tutorial">Tutorial</option>
          <option value="holiday">Holiday</option>
        </select>
      </div>
    </div>
  );
}

export default CalendarToolbar;
