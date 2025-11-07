export default function UpcomingAppointments() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
        <button className="text-blue-600 text-sm font-semibold hover:underline">View All →</button>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
        <p className="font-medium text-gray-800">Oil Change</p>
        <p className="text-sm text-gray-500">Nov 8, 2025 · 09:00 AM</p>
        <p className="text-sm text-gray-500 mt-1">2022 Toyota Camry</p>
        <span className="mt-2 inline-block bg-green-100 text-green-700 px-2 py-1 text-xs font-semibold rounded-full">Confirmed</span>
      </div>
    </div>
  );
}
