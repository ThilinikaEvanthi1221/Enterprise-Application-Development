import React, { useState, useEffect } from 'react';
import inventoryApi from '../services/inventoryApi';
import { INVENTORY_CONFIG } from '../config/inventoryConfig';
import './StockAdjustment.css';

const StockAdjustment = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    partId: '',
    type: 'IN',
    quantity: 1,
    notes: '',
    reason: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [recentAdjustments, setRecentAdjustments] = useState([]);

  useEffect(() => {
    loadParts();
    loadRecentAdjustments();
  }, []);

  const loadParts = async () => {
    try {
      const response = await inventoryApi.getAllParts();
      setParts(response.data || []);
    } catch (error) {
      console.error('Error loading parts:', error);
      // Mock data for demo
      setParts([
        {
          _id: '1',
          partNumber: 'ENG-001',
          name: 'Engine Oil Filter',
          currentStock: 25,
          minStockLevel: 5,
          maxStockLevel: 50,
          unitPrice: 15.99
        },
        {
          _id: '2',
          partNumber: 'BRK-002',
          name: 'Brake Pad Set - Front',
          currentStock: 3,
          minStockLevel: 10,
          maxStockLevel: 40,
          unitPrice: 89.99
        }
      ]);
    }
  };

  const loadRecentAdjustments = async () => {
    try {
      const response = await inventoryApi.getAllTransactions({ limit: 10, type: 'adjustment' });
      setRecentAdjustments(response.data || []);
    } catch (error) {
      console.error('Error loading recent adjustments:', error);
      // Mock data
      setRecentAdjustments([
        {
          _id: '1',
          part: { partNumber: 'ENG-001', name: 'Engine Oil Filter' },
          type: 'IN',
          quantity: 10,
          previousStock: 15,
          newStock: 25,
          notes: 'New shipment received',
          createdAt: new Date().toISOString(),
          createdBy: 'John Doe'
        }
      ]);
    }
  };

  const handlePartSelect = (part) => {
    setSelectedPart(part);
    setAdjustmentData({
      ...adjustmentData,
      partId: part._id
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPart) {
      alert('Please select a part first');
      return;
    }

    if (!adjustmentData.quantity || adjustmentData.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (!adjustmentData.reason) {
      alert('Please select a reason for the adjustment');
      return;
    }

    // Validate OUT transactions don't exceed current stock
    if (adjustmentData.type === 'OUT' && parseInt(adjustmentData.quantity) > selectedPart.currentStock) {
      alert(`Cannot remove ${adjustmentData.quantity} items. Only ${selectedPart.currentStock} available in stock.`);
      return;
    }

    try {
      setLoading(true);
      
      const adjustmentPayload = {
        partId: selectedPart._id,
        transactionType: adjustmentData.type,
        quantity: parseInt(adjustmentData.quantity),
        notes: `${adjustmentData.reason}: ${adjustmentData.notes}`.trim(),
        reference: adjustmentData.reason
      };

      await inventoryApi.adjustStock(adjustmentPayload);
      
      // Reset form
      setAdjustmentData({
        partId: '',
        type: 'IN',
        quantity: 1,
        notes: '',
        reason: ''
      });
      setSelectedPart(null);
      
      // Reload data
      await loadParts();
      await loadRecentAdjustments();
      
      alert('Stock adjustment completed successfully!');
    } catch (error) {
      console.error('Error adjusting stock:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error adjusting stock. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateNewStock = () => {
    if (!selectedPart || !adjustmentData.quantity) return selectedPart?.currentStock || 0;
    
    const quantity = parseInt(adjustmentData.quantity) || 0;
    const currentStock = selectedPart.currentStock || 0;
    
    switch (adjustmentData.type) {
      case 'IN':
        return currentStock + quantity;
      case 'OUT':
        return Math.max(0, currentStock - quantity);
      case 'ADJUSTMENT':
        return quantity;
      default:
        return currentStock;
    }
  };

  const getTransactionTypeInfo = (type) => {
    return INVENTORY_CONFIG.TRANSACTION_TYPES.find(t => t.value === type) || {};
  };

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="stock-adjustment">
      <div className="page-header">
        <h1>📦 Stock Adjustment</h1>
        <p>Adjust inventory levels for parts</p>
      </div>

      <div className="adjustment-container">
        {/* Part Selection */}
        <div className="part-selection-section">
          <h2>Select Part</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search parts by name or part number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="parts-grid">
            {filteredParts.map(part => (
              <div
                key={part._id}
                className={`part-card ${selectedPart?._id === part._id ? 'selected' : ''}`}
                onClick={() => handlePartSelect(part)}
              >
                <div className="part-info">
                  <div className="part-number">{part.partNumber}</div>
                  <div className="part-name">{part.name}</div>
                  <div className="current-stock">
                    Current Stock: <strong>{part.currentStock}</strong>
                  </div>
                  <div className="stock-range">
                    Range: {part.minStockLevel} - {part.maxStockLevel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adjustment Form */}
        {selectedPart && (
          <div className="adjustment-form-section">
            <h2>Adjust Stock for: {selectedPart.name}</h2>
            
            <form onSubmit={handleSubmit} className="adjustment-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Adjustment Type *</label>
                  <select
                    value={adjustmentData.type}
                    onChange={(e) => setAdjustmentData({...adjustmentData, type: e.target.value})}
                    required
                  >
                    {INVENTORY_CONFIG.TRANSACTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData({...adjustmentData, quantity: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="stock-preview">
                <div className="stock-change">
                  <span className="current">Current: {selectedPart.currentStock}</span>
                  <span className="arrow">→</span>
                  <span className="new">New: {calculateNewStock()}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Reason *</label>
                <select
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                  required
                >
                  <option value="">Select Reason</option>
                  <option value="new_shipment">New Shipment</option>
                  <option value="sale">Sale/Usage</option>
                  <option value="damage">Damage/Loss</option>
                  <option value="return">Return</option>
                  <option value="transfer">Transfer</option>
                  <option value="correction">Stock Correction</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={adjustmentData.notes}
                  onChange={(e) => setAdjustmentData({...adjustmentData, notes: e.target.value})}
                  rows="3"
                  placeholder="Additional notes about this adjustment..."
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setSelectedPart(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Recent Adjustments */}
      <div className="recent-adjustments">
        <h2>Recent Stock Adjustments</h2>
        <div className="adjustments-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Part</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Stock Change</th>
                <th>By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {recentAdjustments.map(adj => {
                const typeInfo = getTransactionTypeInfo(adj.type);
                return (
                  <tr key={adj._id}>
                    <td>{new Date(adj.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div>{adj.part?.partNumber}</div>
                      <small>{adj.part?.name}</small>
                    </td>
                    <td>
                      <span 
                        className="type-badge"
                        style={{ background: typeInfo.color, color: 'white' }}
                      >
                        {typeInfo.label}
                      </span>
                    </td>
                    <td>{adj.quantity}</td>
                    <td>
                      <span className="stock-change-text">
                        {adj.previousStock} → {adj.newStock}
                      </span>
                    </td>
                    <td>{adj.createdBy}</td>
                    <td>{adj.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {recentAdjustments.length === 0 && (
            <div className="no-data">No recent adjustments found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;