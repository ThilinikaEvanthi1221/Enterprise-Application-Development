import React, { useState, useEffect, useCallback } from 'react';
import inventoryApi from '../services/inventoryApi';
import PartForm from '../components/PartForm';
import { INVENTORY_CONFIG } from '../config/inventoryConfig';
import '../styles/PartsManagement.css';

const PartsManagement = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    stockStatus: 'all',
    page: 1,
    limit: INVENTORY_CONFIG.PAGINATION.defaultLimit
  });
  const [pagination, setPagination] = useState({});

  const fetchParts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = {};
      if (filters.search) queryParams.search = filters.search;
      if (filters.category !== 'all') queryParams.category = filters.category;
      if (filters.stockStatus !== 'all') queryParams.stockStatus = filters.stockStatus;
      queryParams.page = filters.page;
      queryParams.limit = filters.limit;

      const response = await inventoryApi.getParts(queryParams);
      setParts(response.data.items);
      setPagination(response.data.pagination);
      setError('');
    } catch (err) {
      console.error('Fetch parts error:', err);
      console.error('Error response:', err.response?.data);
      
      // Use mock data for demo purposes
      setParts([
        {
          _id: '1',
          partNumber: 'ENG-001',
          name: 'Engine Oil Filter',
          category: 'Engine',
          currentStock: 25,
          minStockLevel: 5,
          maxStockLevel: 50,
          unitPrice: 15.99,
          locationString: 'Main-A-1-1'
        },
        {
          _id: '2',
          partNumber: 'BRK-002',
          name: 'Brake Pad Set - Front',
          category: 'Brakes',
          currentStock: 3,
          minStockLevel: 10,
          maxStockLevel: 40,
          unitPrice: 89.99,
          locationString: 'Main-B-2-3'
        },
        {
          _id: '3',
          partNumber: 'ELC-003',
          name: 'LED Headlight Bulb',
          category: 'Electrical',
          currentStock: 15,
          minStockLevel: 8,
          maxStockLevel: 30,
          unitPrice: 45.50,
          locationString: 'Main-C-1-2'
        }
      ]);
      setPagination({ current: 1, pages: 1, total: 3, limit: 10 });
      setError('Using demo data - API connection failed');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePartSaved = () => {
    setShowModal(false);
    setEditingPart(null);
    fetchParts();
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setShowModal(true);
  };

  const handleDelete = async (partId) => {
    if (window.confirm('Are you sure you want to delete this part? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        // Try API first
        try {
          const response = await inventoryApi.deletePart(partId);
          
          if (response.success) {
            setError(''); // Clear any previous errors
            setSuccessMessage('Part deleted successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchParts(); // Refresh the parts list
            return;
          } else {
            setError(response.message || 'Failed to delete part');
            return;
          }
        } catch (apiError) {
          console.warn('API delete failed, trying demo mode:', apiError);
          
          // If API fails, handle as demo data (for development/demo purposes)
          const updatedParts = parts.filter(part => part._id !== partId);
          setParts(updatedParts);
          
          setError(''); // Clear any previous errors
          setSuccessMessage('Part deleted successfully (Demo Mode)');
          setTimeout(() => setSuccessMessage(''), 3000);
          
          // Update pagination
          setPagination(prev => ({
            ...prev,
            total: updatedParts.length
          }));
          
          return;
        }
        
      } catch (err) {
        console.error('Delete error:', err);
        console.error('Error response:', err.response?.data);
        
        // Handle different types of errors
        if (err.response?.status === 403) {
          setError('Access denied: You do not have permission to delete parts');
        } else if (err.response?.status === 404) {
          setError('Part not found or has already been deleted');
        } else if (err.response?.status === 401) {
          setError('Authentication required: Please log in again');
        } else if (err.response?.data?.message) {
          setError(`Failed to delete part: ${err.response.data.message}`);
        } else {
          setError('Failed to delete part: Network or server error');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const getStockStatusClass = (part) => {
    if (part.currentStock === 0) return 'out-of-stock';
    if (part.currentStock <= part.minStockLevel) return 'low-stock';
    if (part.currentStock >= part.maxStockLevel) return 'overstock';
    return 'in-stock';
  };

  const getStockStatusText = (part) => {
    if (part.currentStock === 0) return 'Out of Stock';
    if (part.currentStock <= part.minStockLevel) return 'Low Stock';
    if (part.currentStock >= part.maxStockLevel) return 'Overstock';
    return 'In Stock';
  };

  return (
    <div className="parts-management">
      <div className="page-header">
        <h1>Parts Management</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingPart(null);
            setShowModal(true);
          }}
        >
          Add New Part
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            placeholder="Search parts..."
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {INVENTORY_CONFIG.CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <select
            name="stockStatus"
            value={filters.stockStatus}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">All Stock Status</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
            <option value="overstock">Overstock</option>
            <option value="reorder">Reorder Required</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Parts Table */}
      <div className="parts-table-container">
        <table className="parts-table">
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Unit Price</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="loading-cell">Loading...</td>
              </tr>
            ) : parts.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data-cell">No parts found</td>
              </tr>
            ) : (
              parts.map(part => (
                <tr key={part._id}>
                  <td className="part-number">{part.partNumber}</td>
                  <td>{part.name}</td>
                  <td>{part.category}</td>
                  <td>
                    <span className="stock-info">
                      {part.currentStock}
                      <small>/{part.minStockLevel}-{part.maxStockLevel}</small>
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStockStatusClass(part)}`}>
                      {getStockStatusText(part)}
                    </span>
                  </td>
                  <td>${part.unitPrice.toFixed(2)}</td>
                  <td>
                    <small>{part.locationString}</small>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(part)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(part._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.current === 1}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </button>
          <span>
            Page {pagination.current} of {pagination.pages} ({pagination.total} items)
          </span>
          <button
            disabled={pagination.current === pagination.pages}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingPart ? 'Edit Part' : 'Add New Part'}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowModal(false);
                  setEditingPart(null);
                }}
              >
                ×
              </button>
            </div>
            
            <PartForm
              part={editingPart}
              onSave={handlePartSaved}
              onCancel={() => {
                setShowModal(false);
                setEditingPart(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsManagement;