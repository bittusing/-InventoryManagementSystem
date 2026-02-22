import React, { useState, useEffect } from 'react';
import api from '../config/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('lowStock');
  const [lowStock, setLowStock] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  
  const [filters, setFilters] = useState({
    godown: '',
    product: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLowStock();
    fetchGodowns();
    fetchProducts();
    fetchSales();
  }, []);

  const fetchLowStock = async () => {
    try {
      const { data } = await api.get('/reports/low-stock');
      setLowStock(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGodowns = async () => {
    try {
      const { data } = await api.get('/godowns');
      setGodowns(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const { data } = await api.get('/sales');
      setSales(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getFilteredSales = () => {
    return sales.filter(sale => {
      let match = true;
      
      if (filters.godown && sale.godown?._id !== filters.godown) match = false;
      
      if (filters.product) {
        const hasProduct = sale.items?.some(item => item.product?._id === filters.product);
        if (!hasProduct) match = false;
      }
      
      if (filters.startDate) {
        const saleDate = new Date(sale.invoiceDate);
        const startDate = new Date(filters.startDate);
        if (saleDate < startDate) match = false;
      }
      
      if (filters.endDate) {
        const saleDate = new Date(sale.invoiceDate);
        const endDate = new Date(filters.endDate);
        if (saleDate > endDate) match = false;
      }
      
      return match;
    });
  };

  const getGodownWiseSales = () => {
    const godownSales = {};
    sales.forEach(sale => {
      const godownName = sale.godown?.name || 'Unknown';
      if (!godownSales[godownName]) {
        godownSales[godownName] = { count: 0, amount: 0 };
      }
      godownSales[godownName].count += 1;
      godownSales[godownName].amount += sale.totalAmount || 0;
    });
    return godownSales;
  };

  const getProductWiseSales = () => {
    const productSales = {};
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        const productName = item.product?.name || 'Unknown';
        if (!productSales[productName]) {
          productSales[productName] = { quantity: 0, amount: 0 };
        }
        productSales[productName].quantity += item.quantity || 0;
        productSales[productName].amount += item.total || 0;
      });
    });
    return productSales;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Reports & Analytics</h1>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #f0f0f0', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('lowStock')}
            style={{ 
              padding: '10px 20px', 
              border: 'none', 
              background: activeTab === 'lowStock' ? '#4CAF50' : 'transparent',
              color: activeTab === 'lowStock' ? 'white' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0'
            }}
          >
            Low Stock Alert
          </button>
          <button 
            onClick={() => setActiveTab('salesHistory')}
            style={{ 
              padding: '10px 20px', 
              border: 'none', 
              background: activeTab === 'salesHistory' ? '#4CAF50' : 'transparent',
              color: activeTab === 'salesHistory' ? 'white' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0'
            }}
          >
            Sales History
          </button>
          <button 
            onClick={() => setActiveTab('godownWise')}
            style={{ 
              padding: '10px 20px', 
              border: 'none', 
              background: activeTab === 'godownWise' ? '#4CAF50' : 'transparent',
              color: activeTab === 'godownWise' ? 'white' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0'
            }}
          >
            Godown-wise Report
          </button>
          <button 
            onClick={() => setActiveTab('productWise')}
            style={{ 
              padding: '10px 20px', 
              border: 'none', 
              background: activeTab === 'productWise' ? '#4CAF50' : 'transparent',
              color: activeTab === 'productWise' ? 'white' : '#666',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0'
            }}
          >
            Product-wise Report
          </button>
        </div>

        {activeTab === 'lowStock' && (
          <div>
            <h3 style={{ marginBottom: '15px' }}>Low Stock Alert</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Total Stock</th>
                  <th>Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(item => (
                  <tr key={item.product._id}>
                    <td>{item.product.name}</td>
                    <td>{item.product.sku}</td>
                    <td style={{ color: 'red', fontWeight: 'bold' }}>{item.totalStock}</td>
                    <td>{item.product.lowStockThreshold}</td>
                    <td>
                      <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Restock Needed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'salesHistory' && (
          <div>
            <h3 style={{ marginBottom: '15px' }}>Sales History with Filters</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <div className="form-group">
                <label>Godown</label>
                <select value={filters.godown} onChange={(e) => setFilters({...filters, godown: e.target.value})}>
                  <option value="">All Godowns</option>
                  {godowns.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Product</label>
                <select value={filters.product} onChange={(e) => setFilters({...filters, product: e.target.value})}>
                  <option value="">All Products</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Godown</th>
                  <th>Products</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredSales().map(sale => (
                  <tr key={sale._id}>
                    <td>{sale.invoiceNumber}</td>
                    <td>{new Date(sale.invoiceDate).toLocaleDateString()}</td>
                    <td>{sale.customer?.name}</td>
                    <td>{sale.godown?.name}</td>
                    <td>
                      {sale.items?.map(item => item.product?.name).join(', ')}
                    </td>
                    <td style={{ fontWeight: 'bold', color: '#4CAF50' }}>₹{sale.totalAmount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
              <strong>Total Sales:</strong> {getFilteredSales().length} | 
              <strong> Total Amount:</strong> ₹{getFilteredSales().reduce((sum, s) => sum + (s.totalAmount || 0), 0).toLocaleString()}
            </div>
          </div>
        )}

        {activeTab === 'godownWise' && (
          <div>
            <h3 style={{ marginBottom: '15px' }}>Godown-wise Sales Report</h3>
            <table>
              <thead>
                <tr>
                  <th>Godown</th>
                  <th>Total Sales</th>
                  <th>Total Amount</th>
                  <th>Average Sale</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(getGodownWiseSales()).map(([godown, data]) => (
                  <tr key={godown}>
                    <td><strong>{godown}</strong></td>
                    <td>{data.count}</td>
                    <td style={{ color: '#4CAF50', fontWeight: 'bold' }}>₹{data.amount.toLocaleString()}</td>
                    <td>₹{(data.amount / data.count).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'productWise' && (
          <div>
            <h3 style={{ marginBottom: '15px' }}>Product-wise Sales Report</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Total Quantity Sold</th>
                  <th>Total Revenue</th>
                  <th>Average Price</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(getProductWiseSales()).map(([product, data]) => (
                  <tr key={product}>
                    <td><strong>{product}</strong></td>
                    <td>{data.quantity} units</td>
                    <td style={{ color: '#4CAF50', fontWeight: 'bold' }}>₹{data.amount.toLocaleString()}</td>
                    <td>₹{(data.amount / data.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
