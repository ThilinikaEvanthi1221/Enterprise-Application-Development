import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerNavbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-blue-700">
          Auto<span className="text-gray-500">ServicePro</span>
        </h1>
        <p className="text-sm text-gray-500">Customer Portal</p>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-600 hover:text-blue-700">
          <Bell size={20} />
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold">
            {user.name ? user.name[0].toUpperCase() : "C"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{user.name || "John Smith"}</p>
            <p className="text-xs text-gray-500">Customer</p>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-4 px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}