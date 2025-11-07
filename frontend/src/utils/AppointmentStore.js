// In-memory storage for appointments and notifications
let appointments = [];
let notifications = [];

try {
  // Load initial state from localStorage (if present)
  const rawAppointments = localStorage.getItem('__appointments');
  const rawNotifications = localStorage.getItem('__notifications');
  if (rawAppointments) appointments = JSON.parse(rawAppointments).map(a => ({...a}));
  if (rawNotifications) notifications = JSON.parse(rawNotifications).map(n => ({...n}));
} catch (e) {
  console.warn('Failed to load AppointmentStore from localStorage', e);
}

const persist = () => {
  try {
    localStorage.setItem('__appointments', JSON.stringify(appointments));
    localStorage.setItem('__notifications', JSON.stringify(notifications));
  } catch (e) {
    console.warn('Failed to persist AppointmentStore to localStorage', e);
  }
};

// Create a BroadcastChannel for cross-tab notifications when available
const bc = (typeof window !== 'undefined' && 'BroadcastChannel' in window) ? new BroadcastChannel('appointment-store') : null;

const AppointmentStore = {
  // Appointment methods
  addAppointment: (appointment) => {
    const toSave = {
      ...appointment,
      id: appointment.id || Date.now().toString(),
      createdAt: appointment.createdAt || new Date().toISOString()
    };
    appointments.push(toSave);
    persist();
    // notify other tabs
    try { if (bc) bc.postMessage({ type: 'appointment-added', appointment: toSave }); } catch(e){}
    return toSave;
  },
  
  getAppointments: () => {
    try {
      const raw = localStorage.getItem('__appointments') || '[]';
      return JSON.parse(raw);
    } catch (e) {
      return appointments.slice();
    }
  },
  
  getStats: () => {
    const apps = (function(){
      try { return JSON.parse(localStorage.getItem('__appointments') || '[]'); } catch(e){ return appointments; }
    })();
    return {
      active: apps.filter(apt => apt.status === 'in-progress').length,
      pending: apps.filter(apt => apt.status === 'pending').length,
      completed: apps.filter(apt => apt.status === 'completed').length,
      total: apps.length
    };
  },

  // Notification methods
  addNotification: (notification) => {
    const toSave = {
      ...notification,
      id: notification.id || Date.now().toString(),
      createdAt: notification.createdAt || new Date().toISOString(),
      read: typeof notification.read === 'boolean' ? notification.read : false
    };
    notifications.push(toSave);
    persist();
    // notify other tabs
    try { if (bc) bc.postMessage({ type: 'notification-added', notification: toSave }); } catch(e){}
    return toSave;
  },

  getNotifications: () => {
    try {
      return JSON.parse(localStorage.getItem('__notifications') || '[]');
    } catch (e) {
      return notifications.slice();
    }
  },
  
  markNotificationAsRead: (id) => {
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifications[idx].read = true;
    }
    // ensure local copy updated too
    try {
      const raw = JSON.parse(localStorage.getItem('__notifications') || '[]');
      const i = raw.findIndex(n => n.id === id);
      if (i !== -1) {
        raw[i].read = true;
        localStorage.setItem('__notifications', JSON.stringify(raw));
      }
    } catch (e) {
      // ignore
    }
    persist();
    try { if (bc) bc.postMessage({ type: 'notification-updated', id }); } catch(e){}
  },

  getUnreadCount: () => {
    try {
      const raw = JSON.parse(localStorage.getItem('__notifications') || '[]');
      return raw.filter(n => !n.read).length;
    } catch (e) {
      return notifications.filter(n => !n.read).length;
    }
  },

  // Utility helpers for tests
  clearAll: () => {
    appointments = [];
    notifications = [];
    persist();
    try { if (bc) bc.postMessage({ type: 'cleared' }); } catch(e){}
  }
};

// Add export default at the end
export default AppointmentStore;
