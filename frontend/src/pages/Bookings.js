import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllBookings } from "../services/api";
import "./Bookings.css";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: "Jason Miller", role: "employee" });
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState("week"); // day | week | month | year

  useEffect(() => {
    // Set user info
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const tokenParts = token.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        setUser({ name: "Jason Miller", role: payload.role || "employee" });
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }

    // Fetch bookings
    fetchBookings();

    // Real-time clock for date display
    const timer = setInterval(() => setNow(new Date()), 1000 * 60); // update every minute
    return () => clearInterval(timer);
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // No booking date displayed in the table; calendar uses raw dates

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "#f59e0b",
      confirmed: "#10b981",
      "in-progress": "#3b82f6",
      completed: "#10b981",
      cancelled: "#ef4444"
    };
    return statusMap[status] || "#6b7280";
  };

  // Generate calendar view
  const generateCalendarEvents = () => {
    const events = [];
    bookings.forEach(booking => {
      if (booking.serviceDate) {
        events.push({
          date: new Date(booking.serviceDate),
          customer: booking.customer?.name || "Customer",
          serviceType: booking.serviceType || "Service",
          booking: booking
        });
      }
    });
    return events;
  };

  const calendarEvents = generateCalendarEvents();

  // Get current week dates
  const getCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    
    const week = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDays = getCurrentWeek();
  const timeSlots = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];

  // Get events for a specific date and time
  const getEventsForSlot = (date, time) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      const eventTime = eventDate.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: false
      });
      return eventDate.toDateString() === date.toDateString() && 
             eventTime.startsWith(time);
    });
  };

  // Month matrix (weeks x days)
  const getMonthMatrix = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7)); // start on Monday
    const weeks = [];
    let current = new Date(start);
    while (current <= lastDay || current.getDay() !== 1) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
      if (current > lastDay && current.getDay() === 1) break;
    }
    return weeks;
  };

  const monthMatrix = getMonthMatrix(now);

  const handleHeaderClick = () => {
    if (view === "week") setView("month");
    else if (view === "month") setView("year");
    else setView("week");
  };

  if (loading) {
    return (
      <div className="bookings-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">MMM</div>
            <span className="logo-text">AutoServicePro</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>
          <Link to="/bookings" className="nav-item active">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Bookings
          </Link>
          <a href="#customers" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Customers
          </a>
          <a href="#inventory" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Inventory
          </a>
          <a href="#staff" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Staff Management
          </a>
          <a href="#notifications" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </a>
          <a href="#ratings" className="nav-item">
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Service Ratings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="bookings-header">
          <div className="header-left">
            <h1 className="page-title">Bookings</h1>
            <p className="page-subtitle">Let's check your Garage today</p>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <input type="text" placeholder="Search..." />
              <span className="shortcut">⌘ K</span>
            </div>
            <div className="header-icons">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="notification-icon">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="notification-dot"></span>
              </div>
            </div>
            <div className="user-profile">
              <div className="avatar">JM</div>
              <div className="user-info">
                <span className="user-name">{user?.name || "Employee"}</span>
                <span className="user-role">{user?.role === "employee" ? "Employee" : "Owner"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Bookings Table */}
        <div className="bookings-table-section">
          <div className="section-header">
            <h2>All Bookings</h2>
          </div>
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Service ID</th>
                  <th>Vehicle No</th>
                  <th>Customer Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                    <tr key={booking._id}>
                      <td>#{booking._id.toString().slice(-8).toUpperCase()}</td>
                      <td>{booking.vehicleInfo?.licensePlate || "N/A"}</td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {booking.customer?.name?.charAt(0) || "C"}
                          </div>
                          <span>{booking.customer?.name || "Customer"}</span>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calendar View */}
        <div className="calendar-section">
          <div className="section-header">
            <div className="calendar-header-left">
              <svg className="calendar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <button className="date-display" onClick={handleHeaderClick}>
                {view === "month"
                  ? now.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : `Today, ${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
              </button>
            </div>
            <div className="view-toggle">
              <button className={`view-btn ${view === "day" ? "active" : ""}`} onClick={() => setView("day")}>Day</button>
              <button className={`view-btn ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}>Week</button>
              <button className={`view-btn ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}>Month</button>
            </div>
          </div>

          {view !== "year" && (
            <div className="calendar-grid">
              {view === "week" && (
                <>
                  <div className="calendar-time-column">
                    {timeSlots.map((time, index) => (
                      <div key={index} className="time-slot">
                        {time}:00 {parseInt(time) < 12 ? "am" : "pm"}
                      </div>
                    ))}
                  </div>
                  <div className="calendar-days">
                    {weekDays.map((day, dayIndex) => (
                      <div key={dayIndex} className="calendar-day">
                        <div className="day-header">
                          {day.toLocaleDateString("en-US", { weekday: "short" })} {day.getDate()}
                        </div>
                        <div className="day-slots">
                          {timeSlots.map((time, timeIndex) => {
                            const events = getEventsForSlot(day, time);
                            return (
                              <div key={timeIndex} className="slot-cell">
                                {events.map((event, eventIndex) => (
                                  <div key={eventIndex} className="booking-event">
                                    <div className="event-avatar">
                                      {event.customer.charAt(0)}
                                    </div>
                                    <div className="event-info">
                                      <div className="event-customer">{event.customer}</div>
                                      <div className="event-service">{event.serviceType}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {view === "day" && (
                <div className="single-day">
                  <div className="day-header large">
                    {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </div>
                  <div className="single-day-grid">
                    {timeSlots.map((time, idx) => (
                      <div key={idx} className="slot-row">
                        <div className="slot-time">{time}</div>
                        <div className="slot-events">
                          {getEventsForSlot(now, time).map((event, i) => (
                            <div key={i} className="booking-event">
                              <div className="event-avatar">{event.customer.charAt(0)}</div>
                              <div className="event-info">
                                <div className="event-customer">{event.customer}</div>
                                <div className="event-service">{event.serviceType}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === "month" && (
                <div className="month-grid">
                  <div className="month-week day-names">
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                      <div key={d} className="month-cell name">{d}</div>
                    ))}
                  </div>
                  {monthMatrix.map((week, wi) => (
                    <div key={wi} className="month-week">
                      {week.map((d, di) => {
                        const isToday = d.toDateString() === now.toDateString();
                        return (
                        <div key={di} className={`month-cell ${d.getMonth() === now.getMonth() ? "in-month" : "out-month"} ${isToday ? "today" : ""}`}>
                          <span className="month-cell-date">{d.getDate()}</span>
                        </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === "year" && (
            <div className="year-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="year-cell">
                  {new Date(now.getFullYear(), i, 1).toLocaleDateString("en-US", { month: "long" })}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

