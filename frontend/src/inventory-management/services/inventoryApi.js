import api from '../../services/api';

class InventoryApiService {
  
  // Configuration
  async getInventoryConfig() {
    const response = await api.get('/inventory/config');
    return response.data;
  }

  async getCategories() {
    const response = await api.get('/inventory/config/categories');
    return response.data;
  }
  
  // Dashboard
  async getDashboardData() {
    const response = await api.get('/inventory/dashboard');
    return response.data;
  }

  // Parts
  async getAllParts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/inventory/parts?${queryString}`);
    return response.data;
  }

  async getPartById(partId) {
    const response = await api.get(`/inventory/parts/${partId}`);
    return response.data;
  }

  async createPart(partData) {
    const response = await api.post('/inventory/parts', partData);
    return response.data;
  }

  async updatePart(partId, partData) {
    const response = await api.put(`/inventory/parts/${partId}`, partData);
    return response.data;
  }

  async deletePart(partId) {
    const response = await api.delete(`/inventory/parts/${partId}`);
    return response.data;
  }

  // Stock Adjustment
  async adjustStock(adjustmentData) {
    const response = await api.post('/inventory/stock/adjust', adjustmentData);
    return response.data;
  }

  // Transactions
  async getPartTransactions(partId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/inventory/parts/${partId}/transactions?${queryString}`);
    return response.data;
  }

  // Alerts
  async getReorderAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/inventory/alerts?${queryString}`);
    return response.data;
  }

  async acknowledgeAlert(alertId, notes = '') {
    const response = await api.put(`/inventory/alerts/${alertId}/acknowledge`, { notes });
    return response.data;
  }

  // Reports
  async getLowStockReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/inventory/reports/low-stock?${queryString}`);
    return response.data;
  }

  async getTransactionReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/inventory/reports/transactions?${queryString}`);
    return response.data;
  }

  async getInventorySummary() {
    const response = await api.get('/inventory/reports/summary');
    return response.data;
  }

  async getAllTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/inventory/transactions?${queryString}`);
    return response.data;
  }

  async createTransaction(transactionData) {
    const response = await api.post('/inventory/transactions', transactionData);
    return response.data;
  }

  // Additional report methods
  async getCategoryAnalysis() {
    const response = await api.get('/inventory/reports/category-analysis');
    return response.data;
  }

  async getInventoryValueReport() {
    const response = await api.get('/inventory/reports/inventory-value');
    return response.data;
  }

  // Settings methods
  async updateConfig(section, config) {
    const response = await api.put(`/inventory/config/${section}`, config);
    return response.data;
  }



  // Utility methods
  async searchParts(searchTerm) {
    return this.getAllParts({ search: searchTerm, limit: 20 });
  }

  async getLowStockParts() {
    return this.getAllParts({ stockStatus: 'low' });
  }

  async getOutOfStockParts() {
    return this.getAllParts({ stockStatus: 'out' });
  }

  async getPartsByCategory(category) {
    return this.getAllParts({ category });
  }
}

const inventoryApi = new InventoryApiService();
export default inventoryApi;