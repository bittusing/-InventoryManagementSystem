import React, { useState, useEffect } from 'react';
import api from '../config/api';

const Stock = () => {
  const [stocks, setStocks] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedGodown, setSelectedGodown] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [addStockData, setAddStockData] = useState({
    product: '',
    godown: '',
    quantity: ''
  });
  const [transferData, setTransferData] = useState({
    product: '',
    fromGodown: '',
    toGodown: '',
    quantity: ''
  });

  useEffect(() => {
    fetchGodowns();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedGodown) {
      fetchStockByGodown(selectedGodown);
    }
  }, [selectedGodown]);

  const fetchGodowns = async () => {
    try {
      const { data } = await api.get('/godowns');
      setGodowns(data);
      if (data.length > 0) {
        setSelectedGodown(data[0]._id);
      }
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

  const fetchStockByGodown = async (godownId) => {
    try {
      const { data } = await api.get(`/reports/godown-stock/${godownId}`);
      setStocks(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      // Create a manual stock entry via purchase
      const purchaseData = {
        purchaseNumber: `MANUAL-${Date.now()}`,
        supplier: { name: 'Manual Entry', phone: '', email: '', gstin: '' },
        godown: addStockData.godown,
        items: [{
          product: addStockData.product,
          quantity: Number(addStockData.quantity),
          price: 0,
          gstPercent: 0,
          gstAmount: 0,
          total: 0
        }],
        subtotal: 0,
        cgst: 0,
        sgst: 0,
        totalAmount: 0
      };

      await api.post('/purchases', purchaseData);
      setShowAddModal(false);
      setAddStockData({ product: '', godown: '', quantity: '' });
      fetchStockByGodown(selectedGodown);
      alert('Stock added successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add stock');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock/transfer', {
        product: transferData.product,
        fromGodown: transferData.fromGodown,
        toGodown: transferData.toGodown,
        quantity: Number(transferData.quantity)
      });
      setShowTransferModal(false);
      setTransferData({ product: '', fromGodown: '', toGodown: '', quantity: '' });
      fetchStockByGodown(selectedGodown);
      alert('Stock transferred successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Failed to transfer stock');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Stock Management</h1>
        <div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ marginRight: '10px' }}>
            Add Stock Manually
          </button>
          <button className="btn" onClick={() => setShowTransferModal(true)}>
            Transfer Stock
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px', background: '#e3f2fd' }}>
        <h3 style={{ marginBottom: '10px' }}>📦 Stock Management Guide</h3>
        <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
          <div><strong>Add Stock Manually:</strong> Directly add stock to any godown (useful for opening stock, returns, etc.)</div>
          <div><strong>Transfer Stock:</strong> Move stock from one godown to another (Example: Delhi godown se Mumbai godown me 10 TVs transfer karo)</div>
          <div><strong>Purchase:</strong> Supplier se stock khareedne pe automatically stock add hota hai</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>Select Godown to View Stock</label>
          <select value={selectedGodown} onChange={(e) => setSelectedGodown(e.target.value)} style={{ width: '300px' }}>
            {godowns.map(g => (
              <option key={g._id} value={g._id}>{g.name} ({g.code})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <h3>Stock in {godowns.find(g => g._id === selectedGodown)?.name}</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Purchase Price</th>
              <th>Selling Price</th>
              <th>Stock Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No stock in this godown
                </td>
              </tr>
            ) : (
              stocks.map(stock => (
                <tr key={stock._id}>
                  <td>{stock.product?.name}</td>
                  <td>{stock.product?.sku}</td>
                  <td>{stock.product?.category}</td>
                  <td><strong>{stock.quantity}</strong></td>
                  <td>₹{stock.product?.purchasePrice}</td>
                  <td>₹{stock.product?.sellingPrice}</td>
                  <td>₹{(stock.quantity * stock.product?.purchasePrice).toLocaleString()}</td>
                  <td>
                    {stock.quantity <= stock.product?.lowStockThreshold ? (
                      <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Low Stock</span>
                    ) : (
                      <span style={{ color: 'green' }}>✓ In Stock</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Stock Manually</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div style={{ padding: '10px', background: '#fff3e0', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>
              Use this to add opening stock or stock without purchase order
            </div>
            <form onSubmit={handleAddStock}>
              <div className="form-group">
                <label>Product</label>
                <select value={addStockData.product} onChange={(e) => setAddStockData({...addStockData, product: e.target.value})} required>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Godown</label>
                <select value={addStockData.godown} onChange={(e) => setAddStockData({...addStockData, godown: e.target.value})} required>
                  <option value="">Select Godown</option>
                  {godowns.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" value={addStockData.quantity} onChange={(e) => setAddStockData({...addStockData, quantity: e.target.value})} required min="1" />
              </div>
              <button type="submit" className="btn btn-primary">Add Stock</button>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Stock Modal */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Transfer Stock Between Godowns</h2>
              <button className="close-btn" onClick={() => setShowTransferModal(false)}>&times;</button>
            </div>
            <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>
              <strong>Example:</strong> Delhi godown me 50 TVs hai, Mumbai godown me 10 TVs transfer karna hai
            </div>
            <form onSubmit={handleTransfer}>
              <div className="form-group">
                <label>Product</label>
                <select value={transferData.product} onChange={(e) => setTransferData({...transferData, product: e.target.value})} required>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>From Godown (Stock will decrease)</label>
                <select value={transferData.fromGodown} onChange={(e) => setTransferData({...transferData, fromGodown: e.target.value})} required>
                  <option value="">Select Godown</option>
                  {godowns.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>To Godown (Stock will increase)</label>
                <select value={transferData.toGodown} onChange={(e) => setTransferData({...transferData, toGodown: e.target.value})} required>
                  <option value="">Select Godown</option>
                  {godowns.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity to Transfer</label>
                <input type="number" value={transferData.quantity} onChange={(e) => setTransferData({...transferData, quantity: e.target.value})} required min="1" />
              </div>
              <button type="submit" className="btn btn-primary">Transfer Stock</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
