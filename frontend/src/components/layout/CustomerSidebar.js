import {
  Home,
  Calendar,
  ClipboardList,
  Car,
  Wrench,
  History,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerSidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/customer/dashboard" },
    { name: "Book Appointment", icon: <Calendar size={18} />, path: "/customer/service-requests" },
    { name: "My Appointments", icon: <ClipboardList size={18} />, path: "/customer/appointments" },
    { name: "Service Requests", icon: <Wrench size={18} />, path: "/customer/service-requests" },
    { name: "My Vehicles", icon: <Car size={18} />, path: "/customer/vehicles" },
    { name: "Available Services", icon: <Wrench size={18} />, path: "/customer/services" },
    { name: "Service History", icon: <History size={18} />, path: "/customer/history" },
    { name: "My Profile", icon: <User size={18} />, path: "/customer/profile" },
  ];

  return (
    <aside className="w-64 bg-[#1e3a8a] flex flex-col">
      <div className="px-6 py-6 border-b border-blue-900">
        <h1 className="text-2xl font-bold text-white">
          Auto<span className="text-gray-300">ServicePro</span>
        </h1>
        <p className="text-sm text-gray-300">Customer Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-3 w-full px-3 py-2 text-gray-200 rounded-lg hover:bg-blue-800 hover:text-white transition"
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default CustomerSidebar;