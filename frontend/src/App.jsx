import { useEffect, useState } from 'react'
import ServiceRatings from './pages/ServiceRatings.jsx'

export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return null
  return <ServiceRatings />
}


