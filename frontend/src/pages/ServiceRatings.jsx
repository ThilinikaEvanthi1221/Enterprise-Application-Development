import { useEffect, useMemo, useState } from 'react'
import { fetchRatings, fetchSummary } from '../api'
import { NavLink } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FiSearch, FiHome, FiCalendar, FiUsers, FiBox, FiBriefcase, FiBell, FiStar, FiMail } from 'react-icons/fi'

function Star({ filled }) { return (<span style={{ color: filled ? '#f5b50a' : '#e2e8f0' }}>★</span>) }
function StarRating({ value }) { const stars=[]; for(let i=1;i<=5;i++) stars.push(<Star key={i} filled={i<=value}/>); return <div style={{ fontSize: 14 }}>{stars}</div> }

export default function ServiceRatings() {
  const [summary, setSummary] = useState(null)
  const [query, setQuery] = useState({ page: 1, limit: 6, search: '' })
  const [result, setResult] = useState({ items: [], total: 0, page: 1, limit: 6 })
  const totalPages = useMemo(() => Math.max(1, Math.ceil(result.total / result.limit)), [result])

  useEffect(() => { fetchSummary().then(setSummary) }, [])
  useEffect(() => { fetchRatings(query).then(setResult) }, [query])

  const breakdownData = summary ? [
    { name: 'Service Quality', value: summary.breakdown.serviceQuality },
    { name: 'Timeliness', value: summary.breakdown.timeliness },
    { name: 'Staff Professionalism', value: summary.breakdown.professionalism },
    { name: 'Pricing Transparency', value: summary.breakdown.pricingTransparency },
    { name: 'Overall Satisfaction', value: summary.breakdown.overallSatisfaction }
  ] : []

  return (
    <div className="layout">
      <aside className="sidebar employee">
        <div className="brand">
          <div className="logo">MMM</div>
          <div className="brandName">AutoServicePro</div>
        </div>
        <nav>
          <a href="#"><span className="navIcon"><FiHome /></span> Dashboard</a>
          <a href="#"><span className="navIcon"><FiCalendar /></span> Bookings</a>
          <a href="#"><span className="navIcon"><FiUsers /></span> Customers</a>
          <a href="#"><span className="navIcon"><FiBox /></span> Inventory</a>
          <a href="#"><span className="navIcon"><FiBriefcase /></span> Staff Management</a>
          <a href="#"><span className="navIcon"><FiBell /></span> Notifications</a>
          <a href="#" className="active"><span className="navIcon"><FiStar /></span> Service Ratings</a>
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <h2>Service Rating</h2>
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
              <button className="iconBtn notif" title="Notifications">
                <FiBell />
                <span className="notifDot" />
              </button>
              <div className="userChip">
                <div className="avatar">JM</div>
                <div>
                  <div className="userName">Jason Miller</div>
                  <div className="userRole">Employee</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid">
          <div className="panel">
            <h3>Ratings Breakdown</h3>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} ticks={[0,1,2,3,4,5]} />
                  <YAxis dataKey="name" type="category" width={160} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f46e5" radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="kpis">
            <KpiCard title="Average Overall Rating" value={summary?.averageOverallRating ?? '-'} icon="⭐" />
            <KpiCard title="Total Feedbacks Received" value={summary?.totalFeedbacks ?? '-'} icon="💬" />
            <KpiCard title="Services Rated This Month" value={summary?.servicesRatedThisMonth ?? '-'} icon="🛠️" />
            <KpiCard title="% of Positive Reviews" value={`${summary?.positiveReviewPercent ?? '-'}%`} icon="😊" />
          </div>
        </section>

        <section className="panel">
          <div className="tableHeader">
            <div className="inputIcon">
              <FiSearch />
              <input
                placeholder="Search by Date range, Rating range, Service type"
                value={query.search}
                onChange={(e) => setQuery((q) => ({ ...q, page: 1, search: e.target.value }))}
              />
            </div>
            <button className="btnLight">Filters</button>
          </div>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Customer name</th>
                  <th>Vehicle No.</th>
                  <th>Date</th>
                  <th>Overall Rating</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((r) => (
                  <tr key={r._id}>
                    <td>{r.customerName}</td>
                    <td>{r.vehicleNo}</td>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td><StarRating value={r.overallRating} /></td>
                    <td className="muted">{r.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.items.length === 0 && <div className="empty">No results</div>}
          </div>
          <div className="pagination">
            <div className="muted">Show result: 
              <select value={query.limit} onChange={(e)=>setQuery((q)=>({ ...q, page:1, limit:Number(e.target.value) }))}>
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="pager">
              <button disabled={query.page===1} onClick={()=>setQuery((q)=>({ ...q, page:q.page-1 }))}>‹</button>
              {Array.from({ length: totalPages }).slice(0,5).map((_, idx)=>{
                const page = idx+1
                return <button key={page} className={query.page===page?'active':''} onClick={()=>setQuery((q)=>({ ...q, page }))}>{page}</button>
              })}
              <button disabled={query.page>=totalPages} onClick={()=>setQuery((q)=>({ ...q, page:q.page+1 }))}>›</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function KpiCard({ title, value, icon }) {
  return (
    <div className="kpi">
      <div className="kpiIcon">{icon}</div>
      <div>
        <div className="kpiTitle">{title}</div>
        <div className="kpiValue">{value}</div>
      </div>
    </div>
  )
}


