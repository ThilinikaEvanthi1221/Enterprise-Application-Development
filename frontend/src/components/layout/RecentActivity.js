export default function RecentActivity() {
  const activities = [
    { name: "Oil Change", date: "Nov 6, 2025", status: "Confirmed" },
    { name: "Brake Service", date: "Nov 5, 2025", status: "Pending" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-800">Recent Activity</h2>
        <button className="text-blue-600 text-sm font-semibold hover:underline">View All →</button>
      </div>

      <div className="space-y-3">
        {activities.map((a, i) => (
          <div key={i} className="flex justify-between items-center border border-gray-200 rounded-lg p-3 hover:shadow-md transition">
            <div>
              <p className="font-medium text-gray-800">{a.name}</p>
              <p className="text-sm text-gray-500">{a.date}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                a.status === "Confirmed"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
