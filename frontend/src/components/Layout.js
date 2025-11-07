import React from "react";

const Layout = ({ children, activeTab, setActiveTab }) => {
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <p className="text-sm text-gray-500">Email & User Management</p>
          </div>
          <nav className="mt-6">
            <div 
              onClick={() => setActiveTab("dashboard")}
              className={`px-6 py-3 cursor-pointer transition-colors ${
                activeTab === "dashboard" 
                  ? "text-gray-700 border-r-4 border-blue-500 bg-blue-50" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 5v4" />
                </svg>
                Dashboard
              </div>
            </div>
            <div 
              onClick={() => setActiveTab("email")}
              className={`px-6 py-3 cursor-pointer transition-colors ${
                activeTab === "email" 
                  ? "text-gray-700 border-r-4 border-blue-500 bg-blue-50" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Management
              </div>
            </div>
            <div className="px-6 py-3 text-gray-600 hover:bg-gray-100 cursor-pointer">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                User Management
              </div>
            </div>
          </nav>
          
          {/* Logout Button */}
          <div className="absolute bottom-0 w-64 p-6">
            <button 
              onClick={logout}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  {activeTab === "email" ? "Email Management" : "Admin Dashboard"}
                </h1>
                <p className="text-gray-600">
                  {activeTab === "email" ? "Configure email settings and templates" : "System overview and quick actions"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {JSON.parse(localStorage.getItem("user") || '{}').name || 'Admin'}
                </span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {(JSON.parse(localStorage.getItem("user") || '{}').name || 'A')[0].toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;