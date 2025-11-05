import React, { useState, useEffect } from 'react';
import inventoryApi from '../services/inventoryApi';
import { INVENTORY_CONFIG } from '../config/inventoryConfig';

const PartForm = ({ part, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    description: '',
    category: INVENTORY_CONFIG.DEFAULT_VALUES.category,
    manufacturer: '',
    supplier: '',
    currentStock: 0,
    minStockLevel: INVENTORY_CONFIG.DEFAULT_VALUES.minStockLevel,
    maxStockLevel: INVENTORY_CONFIG.DEFAULT_VALUES.maxStockLevel,
    unitPrice: 0,
    currency: INVENTORY_CONFIG.DEFAULT_VALUES.currency,
    location: {
      warehouse: INVENTORY_CONFIG.DEFAULT_VALUES.warehouse,
      section: INVENTORY_CONFIG.DEFAULT_VALUES.section,
      shelf: INVENTORY_CONFIG.DEFAULT_VALUES.shelf,
      bin: INVENTORY_CONFIG.DEFAULT_VALUES.bin
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (part) {
      setFormData({
        partNumber: part.partNumber,
        name: part.name,
        description: part.description || '',
        category: part.category,
        manufacturer: part.manufacturer || '',
        supplier: part.supplier || '',
        currentStock: part.currentStock,
        minStockLevel: part.minStockLevel,
        maxStockLevel: part.maxStockLevel,
        unitPrice: part.unitPrice,
        currency: part.currency,
        location: part.location
      });
    }
  }, [part]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      if (part) {
        await inventoryApi.updatePart(part._id, formData);
      } else {
        await inventoryApi.createPart(formData);
      }
      
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save part');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="part-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label>Part Number *</label>
          <input
            type="text"
            name="partNumber"
            value={formData.partNumber}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            {INVENTORY_CONFIG.CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Manufacturer</label>
          <input
            type="text"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Current Stock *</label>
          <input
            type="number"
            name="currentStock"
            value={formData.currentStock}
            onChange={handleInputChange}
            min="0"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Min Stock Level *</label>
          <input
            type="number"
            name="minStockLevel"
            value={formData.minStockLevel}
            onChange={handleInputChange}
            min="0"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Max Stock Level *</label>
          <input
            type="number"
            name="maxStockLevel"
            value={formData.maxStockLevel}
            onChange={handleInputChange}
            min="1"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Unit Price *</label>
          <input
            type="number"
            name="unitPrice"
            value={formData.unitPrice}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Currency</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            disabled={loading}
          >
            {INVENTORY_CONFIG.CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3>Location</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Warehouse</label>
            <input
              type="text"
              name="location.warehouse"
              value={formData.location.warehouse}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Section</label>
            <input
              type="text"
              name="location.section"
              value={formData.location.section}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Shelf</label>
            <input
              type="text"
              name="location.shelf"
              value={formData.location.shelf}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Bin</label>
            <input
              type="text"
              name="location.bin"
              value={formData.location.bin}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (part ? 'Update Part' : 'Create Part')}
        </button>
        <button 
          type="button" 
          className="btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PartForm;