import React, { useState, useEffect } from 'react';
import api from '../config/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productStocks, setProductStocks] = useState([]);
  const [formData, setFormData] = useState({ name: '', sku: '', category: '', brand: '', purchasePrice: '', sellingPrice: '', gstPercent: '', hsnCode: '', lowStockThreshold: 10 });

  useEffect(() => {
    fetchProducts();
    fetchGodowns();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
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

  const viewStock = async (product) => {
    try {
      setSelectedProduct(product);
      const { data } = await api.get(`/products/${product._id}/stock`);
      setProductStocks(data);
      setShowStockModal(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      setShowModal(false);
      setFormData({ name: '', sku: '', category: '', brand: '', purchasePrice: '', sellingPrice: '', gstPercent: '', hsnCode: '', lowStockThreshold: 10 });
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products & Inventory</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Product</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Purchase Price</th>
              <th>Selling Price</th>
              <th>GST %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>₹{product.purchasePrice}</td>
                <td>₹{product.sellingPrice}</td>
                <td>{product.gstPercent}%</td>
                <td>
                  <button className="btn" onClick={() => viewStock(product)} style={{padding: '5px 10px', fontSize: '12px'}}>View Stock</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Product</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Purchase Price</label>
                <input type="number" value={formData.purchasePrice} onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Selling Price</label>
                <input type="number" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>GST %</label>
                <input type="number" value={formData.gstPercent} onChange={(e) => setFormData({...formData, gstPercent: e.target.value})} />
              </div>
              <div className="form-group">
                <label>HSN Code</label>
                <input type="text" value={formData.hsnCode} onChange={(e) => setFormData({...formData, hsnCode: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Low Stock Threshold</label>
                <input type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      )}

      {showStockModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Stock Details - {selectedProduct?.name}</h2>
              <button className="close-btn" onClick={() => setShowStockModal(false)}>&times;</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Godown</th>
                  <th>Quantity</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {productStocks.length > 0 ? productStocks.map(stock => (
                  <tr key={stock._id}>
                    <td>{stock.godown?.name}</td>
                    <td>{stock.quantity}</td>
                    <td>{new Date(stock.lastUpdated).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" style={{textAlign: 'center'}}>No stock available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
