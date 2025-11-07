import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, Wrench, Car, Clock, MessageSquare, X, User, FileText, UserCheck } from "lucide-react";


const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Users", icon: Users, path: "/users" },
    { name: "Staff Management", icon: UserCheck, path: "/staff" },
    { name: "Appointments", icon: Calendar, path: "/appointments" },
    { name: "Services", icon: Wrench, path: "/services" },
    { name: "Vehicles", icon: Car, path: "/vehicles" },
    { name: "Time Logs", icon: Clock, path: "/time-logs" },
    { name: "Time Log Reports", icon: FileText, path: "/time-log-reports" },
    { name: "ChatBot Queries", icon: MessageSquare, path: "/chatbot" },
    { name: "My Profile", icon: User, path: "/profile" },
  ];

  return (
    <>
      {/* Desktop Sidebar - Always visible */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white shadow-sm z-50 flex-col border-r border-gray-200">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center mb-4">
            {/* Three vertical lines logo */}
            <div className="flex gap-1.5">
              <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
              <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
              <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <div className="text-center">
            <span className="text-lg font-semibold text-gray-800">
              Admin Portal
            </span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? "bg-blue-500 text-white font-medium" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-600"}`} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Sidebar - Slide in/out */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section with Close Button */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex gap-1.5">
              <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
              <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
              <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-lg font-semibold text-gray-800">
              Admin Portal
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? "bg-blue-500 text-white font-medium" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-600"}`} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
