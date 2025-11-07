import React, { useState } from "react";

function RequestModificationPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    vehicleMake: "",
    vehicleModel: "",
    registrationNo: "",
    color: "",
    mileage: "",
    modificationType: "",
    description: "",
    startDate: "",
    endDate: "",
    budgetRange: "",
    notes: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const vehicleMakes = [
    "Toyota", "Nissan", "Honda", "Suzuki", "Mazda",
    "Hyundai", "Kia", "BMW", "Mercedes-Benz", "Audi",
    "Ford", "Mitsubishi", "Volkswagen", "Peugeot",
    "Subaru", "Lexus", "Isuzu", "Tesla",
  ];

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("File size must be less than 2 MB");
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    setErrorMessage("");
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ✅ Submit form correctly with multipart/form-data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, val ?? "");
      });

      // ✅ Match backend field name
      if (selectedFile) {
        data.append("referenceImage", selectedFile);
      }

      const response = await fetch("http://localhost:5000/api/modifications", {
        method: "POST",
        body: data, // ✅ Do not set headers manually
      });

      if (!response.ok) throw new Error("Failed to submit request");

      alert("✅ Modification request submitted successfully!");

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        vehicleMake: "",
        vehicleModel: "",
        registrationNo: "",
        color: "",
        mileage: "",
        modificationType: "",
        description: "",
        startDate: "",
        endDate: "",
        budgetRange: "",
        notes: "",
      });
      setSelectedFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("❌ Error submitting request:", error);
      alert("❌ Failed to submit request. Please try again.");
    }
  };

  // Calculate duration
  const getDuration = () => {
    if (formData.startDate && formData.endDate) {
      const days =
        (new Date(formData.endDate) - new Date(formData.startDate)) /
          (1000 * 60 * 60 * 24) +
        1;
      return days > 0 ? `${Math.floor(days)} days` : "Invalid range";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🛠 Vehicle Modification Request
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
              Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="input"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </section>

          {/* Vehicle Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
              Vehicle Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <select
                name="vehicleMake"
                value={formData.vehicleMake}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select Vehicle Make</option>
                {vehicleMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="vehicleModel"
                placeholder="Vehicle Model (e.g. Corolla 2018)"
                value={formData.vehicleModel}
                onChange={handleChange}
                required
                className="input"
              />
              <input
                type="text"
                name="registrationNo"
                placeholder="Registration Number"
                value={formData.registrationNo}
                onChange={handleChange}
                required
                className="input"
              />
              <input
                type="text"
                name="color"
                placeholder="Current Color"
                value={formData.color}
                onChange={handleChange}
                className="input"
              />
              <input
                type="number"
                name="mileage"
                placeholder="Mileage (km)"
                value={formData.mileage}
                onChange={handleChange}
                className="input"
              />
            </div>
          </section>

          {/* Modification Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
              Modification Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <select
                name="modificationType"
                value={formData.modificationType}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select Modification Type</option>
                <option value="Exterior">Exterior</option>
                <option value="Interior">Interior</option>
                <option value="Engine">Engine</option>
                <option value="Audio">Audio System</option>
                <option value="Electrical">Electrical</option>
                <option value="Custom">Custom</option>
              </select>

              <input
                type="text"
                name="budgetRange"
                placeholder="Budget Range (e.g. 50,000 - 100,000 LKR)"
                value={formData.budgetRange}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <p className="text-sm text-gray-600 mt-2">
                Duration:{" "}
                <span className="font-medium text-blue-700">{getDuration()}</span>
              </p>
            )}

            <textarea
              name="description"
              placeholder="Describe your modification request..."
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="input mt-4"
            />

            {/* Image Upload */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Image (optional, max 2 MB)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              />
              {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
              )}
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Special Instructions */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
              Special Instructions
            </h3>
            <textarea
              name="notes"
              placeholder="Add any special instructions or additional requests..."
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="input"
            />
          </section>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
          >
            Submit Modification Request
          </button>
        </form>
      </div>
    </div>
  );
}

export default RequestModificationPage;
