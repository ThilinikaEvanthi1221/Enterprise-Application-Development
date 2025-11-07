import React, { useState } from 'react';
import axios from 'axios';

function Stars({ value, onChange, size = 24 }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {[1,2,3,4,5].map((n) => (
        <button 
          key={n} 
          type="button" 
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px'
          }}
          onClick={() => onChange(n)} 
          aria-label={`${n} stars`}
        >
          <span style={{ color: n <= value ? '#f5b50a' : '#e5e7eb', fontSize: size }}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function CustomerFeedback() {
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/ratings', {
        ...form,
        date: form.date ? new Date(form.date) : new Date()
      });
      setSubmitted(true);
      setForm({ 
        customerName:'', 
        vehicleNo:'', 
        date:'', 
        comment:'', 
        overallRating:0, 
        serviceQuality:0, 
        timeliness:0, 
        professionalism:0, 
        pricingTransparency:0, 
        serviceType:'General' 
      });
      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }

  const styles = {
    container: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    successAlert: {
      background: '#d1fae5',
      color: '#065f46',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #10b981',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    singleRow: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px'
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    textarea: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      fontFamily: 'inherit'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      marginTop: '8px',
      marginBottom: '12px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '8px'
    },
    ratingGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '12px 16px',
      alignItems: 'center',
      background: '#f9fafb',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    ratingLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    submitButton: {
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.2s',
      alignSelf: 'flex-start'
    },
    submitButtonDisabled: {
      background: '#9ca3af',
      cursor: 'not-allowed'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        <span>💬</span>
        We Value Your Feedback!
      </h3>
      
      {submitted && (
        <div style={styles.successAlert}>
          <span>✅</span>
          Thanks for your feedback! Your review helps us improve our service.
        </div>
      )}
      
      <form onSubmit={submit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Your Name *</label>
            <input 
              style={styles.input}
              value={form.customerName} 
              onChange={(e) => setForm(f => ({...f, customerName: e.target.value}))}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Service Type</label>
            <select 
              style={styles.input}
              value={form.serviceType} 
              onChange={(e) => setForm(f => ({...f, serviceType: e.target.value}))}
            >
              <option value="General">General Service</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Brake Service">Brake Service</option>
              <option value="Tire Rotation">Tire Rotation</option>
              <option value="Engine Diagnostics">Engine Diagnostics</option>
              <option value="AC Repair">AC Repair</option>
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Vehicle Registration Number *</label>
            <input 
              style={styles.input}
              value={form.vehicleNo} 
              onChange={(e) => setForm(f => ({...f, vehicleNo: e.target.value}))}
              required
              placeholder="e.g., CAD-1234"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Date of Service</label>
            <input 
              style={styles.input}
              type="date" 
              value={form.date} 
              onChange={(e) => setForm(f => ({...f, date: e.target.value}))}
            />
          </div>
        </div>

        <div style={styles.sectionTitle}>Rate Your Experience</div>
        <div style={styles.ratingGrid}>
          <span style={styles.ratingLabel}>Service Quality</span>
          <Stars size={22} value={form.serviceQuality} onChange={(v) => setForm(f => ({...f, serviceQuality: v}))} />
          
          <span style={styles.ratingLabel}>Timeliness</span>
          <Stars size={22} value={form.timeliness} onChange={(v) => setForm(f => ({...f, timeliness: v}))} />
          
          <span style={styles.ratingLabel}>Staff Professionalism</span>
          <Stars size={22} value={form.professionalism} onChange={(v) => setForm(f => ({...f, professionalism: v}))} />
          
          <span style={styles.ratingLabel}>Pricing Transparency</span>
          <Stars size={22} value={form.pricingTransparency} onChange={(v) => setForm(f => ({...f, pricingTransparency: v}))} />
          
          <span style={styles.ratingLabel}>Overall Satisfaction</span>
          <Stars size={22} value={form.overallRating} onChange={(v) => setForm(f => ({...f, overallRating: v}))} />
        </div>

        <div style={styles.singleRow}>
          <div style={styles.field}>
            <label style={styles.label}>Tell us about your experience</label>
            <textarea 
              style={styles.textarea}
              rows="3" 
              value={form.comment} 
              onChange={(e) => setForm(f => ({...f, comment: e.target.value}))}
              placeholder="Share your thoughts about our service..."
            />
          </div>
        </div>

        <div>
          <button 
            style={{
              ...styles.submitButton,
              ...(submitting ? styles.submitButtonDisabled : {})
            }}
            type="submit"
            disabled={submitting}
            onMouseEnter={(e) => {
              if (!submitting) e.target.style.background = '#2563eb';
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.target.style.background = '#3b82f6';
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}