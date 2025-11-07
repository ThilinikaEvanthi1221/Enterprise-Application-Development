import React, { useState, useEffect } from "react";
import { getAllBookings, getMyAssignedBookings, getMyAssignedAppointments } from "../services/api";
import "./Bookings.css";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState("week"); // day | week | month | year
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Set user info
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const tokenParts = token.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        setUser({ name: payload.name || "Employee", role: payload.role || "employee", id: payload.id });
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }

    // Real-time clock for date display
    const timer = setInterval(() => setNow(new Date()), 1000 * 60); // update every minute
    return () => clearInterval(timer);
  }, []);

  // Separate effect for fetching bookings when user is set
  useEffect(() => {
    if (user) {
      fetchBookingsAndAppointments();
    }
  }, [user]);

  const fetchBookingsAndAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      
      let allBookings = [];
      
      // Try to fetch actual bookings first
      try {
        let bookingResponse;
        if (user?.role === 'admin') {
          bookingResponse = await getAllBookings();
        } else {
          bookingResponse = await getMyAssignedBookings();
        }
        allBookings = [...bookingResponse.data];
      } catch (bookingError) {
        console.log("Bookings API not available:", bookingError);
      }
      
      // Also fetch appointments and convert them to booking format
      try {
        const appointmentResponse = await getMyAssignedAppointments();
        const appointments = appointmentResponse.data;
        
        // Convert appointments to booking format
        const appointmentBookings = appointments.map(appointment => ({
          _id: `appt-${appointment._id}`,
          customer: appointment.customer,
          vehicleInfo: {
            make: appointment.vehicle?.make || "Unknown",
            model: appointment.vehicle?.model || "Unknown", 
            year: appointment.vehicle?.year || new Date().getFullYear(),
            licensePlate: appointment.vehicle?.plateNumber || "N/A"
          },
          serviceType: appointment.service?.name || "Service",
          description: appointment.notes || "Appointment service",
          status: appointment.status === 'scheduled' ? 'confirmed' : 
                 appointment.status === 'completed' ? 'completed' :
                 appointment.status === 'cancelled' ? 'cancelled' : 'pending',
          assignedTo: appointment.assignedTo,
          serviceDate: appointment.scheduledAt || appointment.date,
          estimatedPrice: appointment.service?.price || 0,
          createdAt: appointment.createdAt,
          isAppointment: true
        }));
        
        allBookings = [...allBookings, ...appointmentBookings];
      } catch (appointmentError) {
        console.log("Appointments API error:", appointmentError);
      }
      
      if (allBookings.length === 0) {
        throw new Error("No data available from backend");
      }
      
      setBookings(allBookings);
    } catch (error) {
      console.error("Error fetching bookings and appointments:", error);
      setError("Unable to connect to server. Showing demo data.");
      
      // Provide fallback demo data
      const demoBookings = [
        {
          _id: "demo-booking-1",
          customer: { name: "John Smith", email: "john@example.com" },
          vehicleInfo: {
            make: "Toyota",
            model: "Camry", 
            year: 2020,
            licensePlate: "ABC123"
          },
          serviceType: "Oil Change",
          description: "Regular oil change and filter replacement",
          status: "confirmed",
          assignedTo: { name: user?.name || "Current Employee" },
          serviceDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          estimatedPrice: 50,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          _id: "demo-booking-2", 
          customer: { name: "Sarah Johnson", email: "sarah@example.com" },
          vehicleInfo: {
            make: "Honda",
            model: "Civic",
            year: 2019,
            licensePlate: "XYZ789"
          },
          serviceType: "Brake Service",
          description: "Brake pads replacement and inspection",
          status: "in-progress",
          assignedTo: { name: user?.name || "Current Employee" },
          serviceDate: new Date(), // Today
          estimatedPrice: 150,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          _id: "demo-booking-3",
          customer: { name: "Mike Wilson", email: "mike@example.com" },
          vehicleInfo: {
            make: "Ford",
            model: "F-150",
            year: 2021,
            licensePlate: "DEF456"
          },
          serviceType: "Engine Diagnostics",
          description: "Check engine light diagnosis",
          status: "pending",
          assignedTo: { name: user?.name || "Current Employee" },
          serviceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          estimatedPrice: 120,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          isAppointment: true
        },
        {
          _id: "demo-booking-4",
          customer: { name: "Lisa Brown", email: "lisa@example.com" },
          vehicleInfo: {
            make: "BMW",
            model: "X5",
            year: 2018,
            licensePlate: "GHI012"
          },
          serviceType: "Tire Rotation",
          description: "Rotate and balance all four tires",
          status: "completed",
          assignedTo: { name: user?.name || "Current Employee" },
          serviceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          estimatedPrice: 80,
          actualPrice: 75,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ];
      
      setBookings(demoBookings);
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

  // Remove full-page loading - render UI immediately
  return (
    <>
      {/* Bookings Table */}
        <div className="bookings-table-section">
          <div className="section-header">
            <h2>{user?.role === 'admin' ? 'All Bookings & Appointments' : 'My Assigned Bookings & Appointments'}</h2>
            {error && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '0.875rem',
                fontStyle: 'italic'
              }}>
                {error}
              </div>
            )}
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              Loading bookings...
            </div>
          ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Service ID</th>
                  <th>Type</th>
                  <th>Vehicle No</th>
                  <th>Customer Name</th>
                  <th>Service Type</th>
                  <th>Service Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                    <tr key={booking._id}>
                      <td>#{booking._id.toString().slice(-8).toUpperCase()}</td>
                      <td>
                        <span 
                          className="type-badge" 
                          style={{ 
                            backgroundColor: booking.isAppointment ? '#3b82f6' : '#10b981',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {booking.isAppointment ? 'APPT' : 'BOOK'}
                        </span>
                      </td>
                      <td>{booking.vehicleInfo?.licensePlate || "N/A"}</td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {booking.customer?.name?.charAt(0) || "C"}
                          </div>
                          <span>{booking.customer?.name || "Customer"}</span>
                        </div>
                      </td>
                      <td>{booking.serviceType || "N/A"}</td>
                      <td>
                        {booking.serviceDate 
                          ? new Date(booking.serviceDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })
                          : "N/A"
                        }
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
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                      {user?.role === 'admin' ? 'No bookings found' : 'No bookings or appointments assigned to you'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
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
    </>
  );
}

