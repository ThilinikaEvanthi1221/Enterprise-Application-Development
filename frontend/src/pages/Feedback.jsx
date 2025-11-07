import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiCalendar, FiBell, FiSmile, FiUsers, FiBox, FiBriefcase, FiSearch, FiMail } from 'react-icons/fi'
import { fetchSummary } from '../api'
import axios from 'axios'

function Stars({ value, onChange, size = 24 }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {[1,2,3,4,5].map((n) => (
        <button key={n} type="button" className="starBtn" onClick={() => onChange(n)} aria-label={`${n} stars`}>
          <span style={{ color: n <= value ? '#f5b50a' : '#e5e7eb', fontSize: size }}>★</span>
        </button>
      ))}
    </div>
  )
}

export default function Feedback() {
  const [form, setForm] = useState({
    customerName: '',
    vehicleNo: '',
    date: '',
    comment: '',
    overallRating: 0,
    serviceQuality: 0,
    timeliness: 0,
    professionalism: 0,
    pricingTransparency: 0,
    serviceType: 'General'
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post('/api/ratings', {
        ...form,
        date: form.date ? new Date(form.date) : new Date()
      })
      setSubmitted(true)
      setForm({ customerName:'', vehicleNo:'', date:'', comment:'', overallRating:0, serviceQuality:0, timeliness:0, professionalism:0, pricingTransparency:0, serviceType:'General' })
    } catch (_e) {
      alert('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="layout">
      <aside className="sidebar customer">
        <div className="brand">
          <div className="logo">MMM</div>
          <div className="brandName">AutoServicePro</div>
        </div>
        <nav>
          <a href="#" onClick={(e)=>e.preventDefault()}><span className="navIcon"><FiHome /></span> Dashboard</a>
          <a href="#" onClick={(e)=>e.preventDefault()}><span className="navIcon"><FiCalendar /></span> Bookings</a>
          <a href="#" onClick={(e)=>e.preventDefault()}><span className="navIcon"><FiBell /></span> Notifications</a>
          <NavLink to="/customer/feedback" className={({isActive})=> isActive? 'active':''}><span className="navIcon"><FiSmile /></span> Feedback</NavLink>
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <h2>Feedback</h2>
            <p>Let’s check your Garage today</p>
          </div>
          <div className="topbarRight">
            <div className="searchBox">
              <FiSearch />
              <input placeholder="Search..." />
              <span className="kbd">⌘ K</span>
            </div>
            <div className="icons">
              <button className="iconBtn" title="Messages"><FiMail /></button>
              <button className="iconBtn notif" title="Notifications"><FiBell /><span className="notifDot" /></button>
              <div className="userChip">
                <div className="avatar">AD</div>
                <div>
                  <div className="userName">Anna Dias</div>
                  <div className="userRole">Customer</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="panel">
          <h3 style={{ marginBottom: 16 }}>We Value Your Feedback!</h3>
          {submitted && <div className="alertSuccess">Thanks for your feedback!</div>}
          <form onSubmit={submit} className="formGrid">
            <div className="formRow twoCols">
              <div className="field"><label>Name</label><input value={form.customerName} onChange={(e)=>setForm(f=>({...f, customerName:e.target.value}))} /></div>
            </div>
            <div className="formRow twoCols">
              <div className="field"><label>Vehicle Registration Number</label><input value={form.vehicleNo} onChange={(e)=>setForm(f=>({...f, vehicleNo:e.target.value}))} /></div>
              <div className="field"><label>Date of Service</label><input type="date" value={form.date} onChange={(e)=>setForm(f=>({...f, date:e.target.value}))} /></div>
            </div>

            <div className="sectionTitle">Service Rating</div>
            <div className="ratingGrid">
              <label>Service Quality</label><Stars size={22} value={form.serviceQuality} onChange={(v)=>setForm(f=>({...f, serviceQuality:v}))} />
              <label>Timeliness</label><Stars size={22} value={form.timeliness} onChange={(v)=>setForm(f=>({...f, timeliness:v}))} />
              <label>Staff Professionalism</label><Stars size={22} value={form.professionalism} onChange={(v)=>setForm(f=>({...f, professionalism:v}))} />
              <label>Pricing Transparency</label><Stars size={22} value={form.pricingTransparency} onChange={(v)=>setForm(f=>({...f, pricingTransparency:v}))} />
              <label>Overall Satisfaction</label><Stars size={22} value={form.overallRating} onChange={(v)=>setForm(f=>({...f, overallRating:v}))} />
            </div>

            <div className="formRow">
              <label>Tell us about your experience</label>
              <textarea rows="3" value={form.comment} onChange={(e)=>setForm(f=>({...f, comment:e.target.value}))} />
            </div>

            <div className="formRow">
              <button className="primaryBtn" disabled={submitting}>{submitting? 'Submitting...' : 'Submit Feedback'}</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}


