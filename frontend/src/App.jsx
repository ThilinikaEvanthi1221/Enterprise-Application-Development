import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ServiceRatings from './pages/ServiceRatings.jsx'
import Feedback from './pages/Feedback.jsx'

export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return null
  return (
    <BrowserRouter>
      <Routes>
        {/* Employee dashboard */}
        <Route path="/employee/service-ratings" element={<ServiceRatings />} />

        {/* Customer dashboard */}
        <Route path="/customer/feedback" element={<Feedback />} />

        {/* Default to employee page */}
        <Route path="*" element={<Navigate to="/employee/service-ratings" replace />} />
      </Routes>
    </BrowserRouter>
  )
}


