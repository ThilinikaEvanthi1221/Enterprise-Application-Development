import React from "react";
import { Search, Grid3x3, Mail, Bell, Menu } from "lucide-react";
import AdminNotificationBell from "./AdminNotificationBell";
import NotificationBell from "./NotificationBell";

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Hi, Admin User 👋</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Let's check your dashboard today</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-48 lg:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 text-sm"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          {/* Notifications */}
          <div className="flex items-center gap-2">
            {localStorage.getItem('role') === 'admin' ? (
              <AdminNotificationBell />
            ) : (
              <NotificationBell />
            )}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
          </div>
          
          {/* Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors rounded-lg hover:bg-gray-100">
              <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="p-2 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors rounded-lg hover:bg-gray-100">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="p-2 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-gray-300">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xs sm:text-sm shadow-sm">
                AU
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
