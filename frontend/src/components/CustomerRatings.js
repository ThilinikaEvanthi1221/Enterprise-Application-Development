import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Star({ filled }) { 
  return (<span style={{ color: filled ? '#f5b50a' : '#e2e8f0' }}>★</span>); 
}

function StarRating({ value }) { 
  const stars = []; 
  for(let i = 1; i <= 5; i++) stars.push(<Star key={i} filled={i <= value}/>); 
  return <div style={{ fontSize: 14, display: 'flex' }}>{stars}</div>; 
}

export default function CustomerRatings() {
  const [summary, setSummary] = useState(null);
  const [query, setQuery] = useState({ page: 1, limit: 6, search: '' });
  const [result, setResult] = useState({ items: [], total: 0, page: 1, limit: 6 });
  const [loading, setLoading] = useState(true);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(result.total / result.limit)), [result]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [query]);

  const fetchSummary = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ratings/summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      // Fallback data when backend is not available
      setSummary({
        averageOverallRating: 4.2,
        totalFeedbacks: 25,
        servicesRatedThisMonth: 8,
        positiveReviewPercent: 85,
        breakdown: {
          serviceQuality: 4.3,
          timeliness: 4.0,
          professionalism: 4.5,
          pricingTransparency: 4.1,
          overallSatisfaction: 4.2
        }
      });
    }
  };

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(query);
      const response = await fetch(`http://localhost:5000/api/ratings?${params}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      // Fallback data when backend is not available
      setResult({
        page: 1,
        limit: 6,
        total: 3,
        items: [
          {
            _id: '1',
            customerName: 'John Smith',
            vehicleNo: 'CAD-1234',
            serviceType: 'Oil Change',
            date: new Date().toISOString(),
            overallRating: 5,
            comment: 'Excellent service! Very professional and quick.'
          },
          {
            _id: '2',
            customerName: 'Jane Doe',
            vehicleNo: 'CAD-5678',
            serviceType: 'Brake Service',
            date: new Date().toISOString(),
            overallRating: 4,
            comment: 'Good service, but took longer than expected.'
          },
          {
            _id: '3',
            customerName: 'Mike Johnson',
            vehicleNo: 'CAD-9876',
            serviceType: 'Engine Diagnostics',
            date: new Date().toISOString(),
            overallRating: 5,
            comment: 'Found the issue quickly and fixed it professionally.'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const breakdownData = summary ? [
    { name: 'Service Quality', value: summary.breakdown.serviceQuality },
    { name: 'Timeliness', value: summary.breakdown.timeliness },
    { name: 'Staff Professionalism', value: summary.breakdown.professionalism },
    { name: 'Pricing Transparency', value: summary.breakdown.pricingTransparency },
    { name: 'Overall Satisfaction', value: summary.breakdown.overallSatisfaction }
  ] : [];

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      marginBottom: '24px'
    },
    panel: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    panelTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px'
    },
    kpiCard: {
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    kpiIcon: {
      fontSize: '24px',
      width: '40px',
      height: '40px',
      background: 'white',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    kpiText: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    kpiTitle: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '500'
    },
    kpiValue: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    },
    searchInput: {
      flex: 1,
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      background: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    tableHeaderCell: {
      padding: '12px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    tableRow: {
      borderBottom: '1px solid #f3f4f6'
    },
    tableCell: {
      padding: '12px',
      fontSize: '14px',
      color: '#374151'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px'
    },
    paginationControls: {
      display: 'flex',
      gap: '4px'
    },
    paginationButton: {
      padding: '6px 12px',
      border: '1px solid #d1d5db',
      background: 'white',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    paginationButtonActive: {
      background: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    empty: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.container}>
      {/* Stats Section */}
      <div style={styles.grid}>
        {/* Ratings Breakdown Chart */}
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>
            <span>📊</span>
            Ratings Breakdown
          </h3>
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

        {/* KPI Cards */}
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>
            <span>⭐</span>
            Rating Summary
          </h3>
          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiIcon}>⭐</div>
              <div style={styles.kpiText}>
                <div style={styles.kpiTitle}>Average Rating</div>
                <div style={styles.kpiValue}>{summary?.averageOverallRating ?? '-'}</div>
              </div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiIcon}>💬</div>
              <div style={styles.kpiText}>
                <div style={styles.kpiTitle}>Total Reviews</div>
                <div style={styles.kpiValue}>{summary?.totalFeedbacks ?? '-'}</div>
              </div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiIcon}>🛠️</div>
              <div style={styles.kpiText}>
                <div style={styles.kpiTitle}>This Month</div>
                <div style={styles.kpiValue}>{summary?.servicesRatedThisMonth ?? '-'}</div>
              </div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiIcon}>😊</div>
              <div style={styles.kpiText}>
                <div style={styles.kpiTitle}>Positive Reviews</div>
                <div style={styles.kpiValue}>{summary?.positiveReviewPercent ?? '-'}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div style={styles.panel}>
        <h3 style={styles.panelTitle}>
          <span>📝</span>
          Customer Reviews
        </h3>
        
        <div style={styles.searchContainer}>
          <input
            style={styles.searchInput}
            placeholder="Search by customer name, vehicle, or comment..."
            value={query.search}
            onChange={(e) => setQuery((q) => ({ ...q, page: 1, search: e.target.value }))}
          />
          <select
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            value={query.limit}
            onChange={(e) => setQuery((q) => ({ ...q, page: 1, limit: Number(e.target.value) }))}
          >
            <option value={6}>6 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>

        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHeaderCell}>Customer</th>
              <th style={styles.tableHeaderCell}>Vehicle</th>
              <th style={styles.tableHeaderCell}>Service Type</th>
              <th style={styles.tableHeaderCell}>Date</th>
              <th style={styles.tableHeaderCell}>Rating</th>
              <th style={styles.tableHeaderCell}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((rating) => (
              <tr key={rating._id} style={styles.tableRow}>
                <td style={styles.tableCell}>{rating.customerName}</td>
                <td style={styles.tableCell}>{rating.vehicleNo}</td>
                <td style={styles.tableCell}>
                  <span style={{
                    background: '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {rating.serviceType}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  {new Date(rating.date).toLocaleDateString()}
                </td>
                <td style={styles.tableCell}>
                  <StarRating value={rating.overallRating} />
                </td>
                <td style={styles.tableCell}>
                  <div style={{
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#6b7280',
                    fontSize: '13px'
                  }}>
                    {rating.comment || 'No comment'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {result.items.length === 0 && !loading && (
          <div style={styles.empty}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No Reviews Found</h3>
            <p>No customer reviews match your search criteria.</p>
          </div>
        )}

        {loading && (
          <div style={styles.empty}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
            <p>Loading reviews...</p>
          </div>
        )}

        {/* Pagination */}
        {result.items.length > 0 && (
          <div style={styles.pagination}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Showing {((query.page - 1) * query.limit) + 1} to {Math.min(query.page * query.limit, result.total)} of {result.total} results
            </div>
            <div style={styles.paginationControls}>
              <button
                style={styles.paginationButton}
                disabled={query.page === 1}
                onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}
              >
                ‹ Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <button
                    key={page}
                    style={{
                      ...styles.paginationButton,
                      ...(query.page === page ? styles.paginationButtonActive : {})
                    }}
                    onClick={() => setQuery((q) => ({ ...q, page }))}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                style={styles.paginationButton}
                disabled={query.page >= totalPages}
                onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}