import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 md:ml-64 w-full transition-all duration-300">
        <Header onMenuClick={toggleSidebar} />
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

