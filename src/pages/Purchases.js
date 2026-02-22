import React, { useState, useEffect } from 'react';
import api from '../config/api';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [godowns, setGodowns] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    purchaseNumber: '',
    supplier: { name: '', phone: '', email: '', gstin: '' },
    godown: '',
    items: [{ product: '', quantity: '', price: '' }]
  });

  useEffect(() => {
    fetchPurchases();
    fetchGodowns();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (showModal) {
      generatePurchaseNumber();
    }
  }, [showModal, purchases]);

  const generatePurchaseNumber = () => {
    const year = new Date().getFullYear();
    const count = purchases.length + 1;
    const purchaseNum = `PUR-${year}-${String(count).padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, purchaseNumber: purchaseNum }));
  };

  const fetchPurchases = async () => {
    try {
      const { data } = await api.get('/purchases');
      setPurchases(data);
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

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: '', price: '' }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const purchaseData = {
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

      const subtotal = purchaseData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const totalGst = purchaseData.items.reduce((sum, item) => sum + item.gstAmount, 0);
      
      purchaseData.subtotal = subtotal;
      purchaseData.cgst = totalGst / 2;
      purchaseData.sgst = totalGst / 2;
      purchaseData.totalAmount = subtotal + totalGst;

      await api.post('/purchases', purchaseData);
      setShowModal(false);
      setFormData({
        purchaseNumber: '',
        supplier: { name: '', phone: '', email: '', gstin: '' },
        godown: '',
        items: [{ product: '', quantity: '', price: '' }]
      });
      fetchPurchases();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Purchases</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Purchase</button>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #ff9800', paddingBottom: '10px' }}>
          Purchase Orders (Incoming - Stock Increases)
        </h3>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px', padding: '10px', background: '#fff3e0', borderRadius: '4px' }}>
          📦 Purchase = When you BUY products from suppliers. Money goes OUT, Stock comes IN.
        </div>
        <table>
          <thead>
            <tr>
              <th>Purchase #</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Godown</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(purchase => (
              <tr key={purchase._id}>
                <td>{purchase.purchaseNumber}</td>
                <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                <td>{purchase.supplier.name}</td>
                <td>{purchase.godown?.name}</td>
                <td>₹{purchase.totalAmount}</td>
                <td>{purchase.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Purchase</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Purchase Number (Auto-generated)</label>
                <input type="text" value={formData.purchaseNumber} readOnly style={{ background: '#f5f5f5' }} />
              </div>
              <div className="form-group">
                <label>Supplier Name</label>
                <input type="text" value={formData.supplier.name} onChange={(e) => setFormData({...formData, supplier: {...formData.supplier, name: e.target.value}})} required />
              </div>
              <div className="form-group">
                <label>Supplier Phone</label>
                <input type="text" value={formData.supplier.phone} onChange={(e) => setFormData({...formData, supplier: {...formData.supplier, phone: e.target.value}})} />
              </div>
              <div className="form-group">
                <label>Supplier GSTIN</label>
                <input type="text" value={formData.supplier.gstin} onChange={(e) => setFormData({...formData, supplier: {...formData.supplier, gstin: e.target.value}})} />
              </div>
              <div className="form-group">
                <label>Godown</label>
                <select value={formData.godown} onChange={(e) => setFormData({...formData, godown: e.target.value})} required>
                  <option value="">Select Godown</option>
                  {godowns.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
              
              <h3>Items</h3>
              {formData.items.map((item, index) => (
                <div key={index} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
                  <div className="form-group">
                    <label>Product</label>
                    <select value={item.product} onChange={(e) => updateItem(index, 'product', e.target.value)} required>
                      <option value="">Select Product</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Price</label>
                    <input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} required />
                  </div>
                </div>
              ))}
              <button type="button" className="btn" onClick={addItem}>Add Item</button>
              <button type="submit" className="btn btn-primary" style={{ marginLeft: '10px' }}>Save Purchase</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
