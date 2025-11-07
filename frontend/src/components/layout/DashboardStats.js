export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600 hover:shadow-md transition"
        >
          <p className="text-gray-500 text-sm">{item.label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
