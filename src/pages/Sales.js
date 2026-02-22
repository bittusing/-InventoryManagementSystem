import React, { useState, useEffect } from 'react';
import api from '../config/api';
import InvoicePDF from '../components/InvoicePDF';
import { checkPermission } from '../utils/permissions';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [godowns, setGodowns] = useState([]);
  const [products, setProducts] = useState([]);
  const [availableStock, setAvailableStock] = useState({});
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customer: { name: '', phone: '', email: '', gstin: '' },
    godown: '',
    items: [{ product: '', quantity: '', price: '' }]
  });

  const canCreate = checkPermission('sales', 'create');

  useEffect(() => {
    fetchSales();
    fetchGodowns();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (showModal) {
      generateInvoiceNumber();
    }
  }, [showModal, sales]);

  useEffect(() => {
    if (formData.godown) {
      fetchStockForGodown(formData.godown);
    }
  }, [formData.godown]);

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = sales.length + 1;
    const invoiceNum = `INV-${year}-${String(count).padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, invoiceNumber: invoiceNum }));
  };

  const fetchSales = async () => {
    try {
      const { data } = await api.get('/sales');
      setSales(data);
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

  const fetchStockForGodown = async (godownId) => {
    try {
      const { data } = await api.get(`/reports/godown-stock/${godownId}`);
      const stockMap = {};
      data.forEach(stock => {
        stockMap[stock.product._id] = stock.quantity;
      });
      setAvailableStock(stockMap);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: '', price: '' }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Auto-fill selling price when product is selected
    if (field === 'product' && value) {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].price = product.sellingPrice;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate stock availability
    for (const item of formData.items) {
      const available = availableStock[item.product] || 0;
      if (item.quantity > available) {
        const product = products.find(p => p._id === item.product);
        alert(`Insufficient stock for ${product.name}. Available: ${available}, Requested: ${item.quantity}`);
        return;
      }
    }

    try {
      const saleData = {
        ...formData,
        items: formData.items.map(item => {
          const product = products.find(p => p._id === item.product);
          const subtotal = item.quantity * item.price;
          const gstAmount = (subtotal * product.gstPercent) / 100;
          return {
            product: item.product,
            quantity: Number(item.quantity),
            price: Number(item.price),
            gstPercent: product.gstPercent,
            gstAmount,
            total: subtotal + gstAmount
          };
        })
      };

      const subtotal = saleData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const totalGst = saleData.items.reduce((sum, item) => sum + item.gstAmount, 0);
      
      saleData.subtotal = subtotal;
      saleData.cgst = totalGst / 2;
      saleData.sgst = totalGst / 2;
      saleData.totalAmount = subtotal + totalGst;
      saleData.paymentStatus = 'paid';
      saleData.paidAmount = saleData.totalAmount;

      await api.post('/sales', saleData);
      setShowModal(false);
      setFormData({
        invoiceNumber: '',
        customer: { name: '', phone: '', email: '', gstin: '' },
        godown: '',
        items: [{ product: '', quantity: '', price: '' }]
      });
      fetchSales();
      alert('Sale created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create sale');
    }
  };

  const getAvailableProducts = () => {
    if (!formData.godown) return [];
    return products.filter(p => availableStock[p._id] > 0);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Sales</h1>
        {canCreate && <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Invoice</button>}
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
          Sales Invoices (Outgoing - Stock Decreases)
        </h3>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
          💰 Sales = When you SELL products to customers. Money comes IN, Stock goes OUT.
        </div>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Godown</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale._id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedSale(sale); setShowInvoice(true); }}>
                <td>{sale.invoiceNumber}</td>
                <td>{new Date(sale.invoiceDate).toLocaleDateString()}</td>
                <td>{sale.customer.name}</td>
                <td>{sale.godown?.name}</td>
                <td>{sale.items?.length} items</td>
                <td style={{ fontWeight: 'bold', color: '#4CAF50' }}>₹{sale.totalAmount?.toLocaleString()}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px',
                    background: sale.paymentStatus === 'paid' ? '#e8f5e9' : '#fff3e0',
                    color: sale.paymentStatus === 'paid' ? '#4CAF50' : '#ff9800'
                  }}>
                    {sale.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>Create Sale Invoice</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Invoice Number (Auto-generated)</label>
                <input type="text" value={formData.invoiceNumber} readOnly style={{ background: '#f5f5f5' }} />
              </div>
              
              <div className="form-group">
                <label>Select Godown First *</label>
                <select value={formData.godown} onChange={(e) => setFormData({...formData, godown: e.target.value})} required>
                  <option value="">Select Godown</option>
                  {godowns.map(g => <option key={g._id} value={g._id}>{g.name} ({g.code})</option>)}
                </select>
                <small style={{ color: '#666', fontSize: '12px' }}>Products will show based on selected godown stock</small>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Customer Details</h3>
              <div className="form-group">
                <label>Customer Name *</label>
                <input type="text" value={formData.customer.name} onChange={(e) => setFormData({...formData, customer: {...formData.customer, name: e.target.value}})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={formData.customer.phone} onChange={(e) => setFormData({...formData, customer: {...formData.customer, phone: e.target.value}})} />
                </div>
                <div className="form-group">
                  <label>GSTIN</label>
                  <input type="text" value={formData.customer.gstin} onChange={(e) => setFormData({...formData, customer: {...formData.customer, gstin: e.target.value}})} />
                </div>
              </div>
              
              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Items</h3>
              {!formData.godown && (
                <div style={{ padding: '10px', background: '#fff3e0', borderRadius: '4px', marginBottom: '15px' }}>
                  Please select a godown first to see available products
                </div>
              )}
              {formData.items.map((item, index) => (
                <div key={index} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px', background: '#f9f9f9' }}>
                  <div className="form-group">
                    <label>Product *</label>
                    <select value={item.product} onChange={(e) => updateItem(index, 'product', e.target.value)} required disabled={!formData.godown}>
                      <option value="">Select Product</option>
                      {getAvailableProducts().map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} - Stock: {availableStock[p._id]} units
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Quantity *</label>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)} 
                        required 
                        min="1"
                        max={item.product ? availableStock[item.product] : 999}
                      />
                      {item.product && (
                        <small style={{ color: '#666' }}>Available: {availableStock[item.product]} units</small>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Price (Auto-filled) *</label>
                      <input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} required />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn" onClick={addItem} disabled={!formData.godown}>Add More Items</button>
              <button type="submit" className="btn btn-primary" style={{ marginLeft: '10px' }}>Create Invoice</button>
            </form>
          </div>
        </div>
      )}

      {showInvoice && selectedSale && (
        <InvoicePDF sale={selectedSale} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};

export default Sales;
