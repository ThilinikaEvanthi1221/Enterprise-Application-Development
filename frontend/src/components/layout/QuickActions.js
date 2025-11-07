import { Calendar, Car, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Book Appointment",
      icon: <Calendar className="w-6 h-6" />,
      description: "Schedule a new service appointment",
      path: "/customer/service-request"
    },
    {
      title: "Register Vehicle",
      icon: <Car className="w-6 h-6" />,
      description: "Add a new vehicle to your account",
      path: "/customer/vehicles"
    },
    {
      title: "View History",
      icon: <FileText className="w-6 h-6" />,
      description: "Check your service history",
      path: "/customer/history"
    }
  ];

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-blue-50 rounded-full text-blue-600 mb-3">
                {action.icon}
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}