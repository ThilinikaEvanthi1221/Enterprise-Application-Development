import React from "react";
import { Users, Briefcase, Calendar, Wrench, Car, Clock, MessageSquare, BarChart3 } from "lucide-react";

const MetricCard = ({ title, value, change, trend, iconType }) => {
  const isPositive = change.startsWith("+");
  
  // Map icon types to lucide icons
  const iconMap = {
    "👥": Users,
    "👔": Briefcase,
    "📅": Calendar,
    "🔧": Wrench,
    "🚗": Car,
    "⏱️": Clock,
    "💬": MessageSquare,
    "📊": BarChart3,
  };
  
  const IconComponent = iconMap[iconType] || BarChart3;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 relative hover:shadow-md transition-shadow duration-200">
      {/* Top right icons */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-gray-200"></div>
        <span className="text-gray-400 cursor-pointer text-xs">⋮</span>
      </div>
      
      {/* Icon */}
      <div className="mb-2">
        <IconComponent className="w-5 h-5 text-gray-700" />
      </div>
      
      {/* Content */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{value}</h2>
        
        {/* Change Indicator */}
        <div className="flex items-center gap-1">
          <span className={`text-xs font-semibold ${isPositive ? "text-blue-500" : "text-blue-500"}`}>
            {isPositive ? "++" : ""}{change} from last week
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
