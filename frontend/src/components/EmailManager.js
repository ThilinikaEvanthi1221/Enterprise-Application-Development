import React, { useState } from "react";
import { getHealthStatus } from "../services/api";

const EmailManager = () => {
  const [emailConfig, setEmailConfig] = useState({
    service: "gmail",
    user: process.env.REACT_APP_EMAIL_USER || "admin@autocare.com",
    status: "configured"
  });
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testEmailConnection = async () => {
    setIsLoading(true);
    try {
      const response = await getHealthStatus();
      if (response.data.services.email === "configured") {
        setTestResult({ success: true, message: "Email service is working correctly!" });
      } else {
        setTestResult({ success: false, message: "Email service is not properly configured." });
      }
    } catch (error) {
      setTestResult({ success: false, message: "Failed to test email connection." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Email Management</h2>
        <p className="text-gray-600">Configure and manage email settings</p>
      </div>

      <div className="space-y-6">
        {/* Email Configuration */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Email Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Service Provider
              </label>
              <input
                type="text"
                value={emailConfig.service}
                onChange={(e) => setEmailConfig({...emailConfig, service: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={emailConfig.user}
                onChange={(e) => setEmailConfig({...emailConfig, user: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Status Display */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Service Status</h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
              emailConfig.status === 'configured' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {emailConfig.status}
            </span>
          </div>
        </div>

        {/* Test Connection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Test Email Connection</h3>
          <button
            onClick={testEmailConnection}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>

          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Email Templates */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Email Templates</h3>
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800">Confirmation Email</h4>
              <p className="text-sm text-gray-600 mt-1">Sent when appointments are confirmed</p>
              <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mt-2">
                Active
              </span>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800">Completion Email</h4>
              <p className="text-sm text-gray-600 mt-1">Sent when services are completed</p>
              <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mt-2">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailManager;