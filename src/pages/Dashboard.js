import React, { useEffect, useState } from 'react';
import api from '../config/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    godowns: 0, 
    products: 0, 
    sales: 0, 
    lowStock: 0,
    totalSalesAmount: 0,
    totalPurchaseAmount: 0,
    pendingPayments: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentTransactions();
  }, []);

  const fetchStats = async () => {
    try {
      const [godowns, products, sales, purchases, lowStock] = await Promise.all([
        api.get('/godowns'),
        api.get('/products'),
        api.get('/sales'),
        api.get('/purchases'),
        api.get('/reports/low-stock')
      ]);

      const totalSalesAmount = sales.data.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalPurchaseAmount = purchases.data.reduce((sum, p) => sum + p.totalAmount, 0);
      const pendingPayments = sales.data.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0);

      setStats({
        godowns: godowns.data.length,
        products: products.data.length,
        sales: sales.data.length,
        lowStock: lowStock.data.length,
        totalSalesAmount,
        totalPurchaseAmount,
        pendingPayments
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const [sales, purchases] = await Promise.all([
        api.get('/sales'),
        api.get('/purchases')
      ]);

      setRecentSales(sales.data.slice(0, 5));
      setRecentPurchases(purchases.data.slice(0, 5));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Welcome back! Here's what's happening today.
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Godowns</div>
          <div className="value">{stats.godowns}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>Active warehouses</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Products</div>
          <div className="value">{stats.products}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>In inventory</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Sales</div>
          <div className="value">{stats.sales}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>₹{stats.totalSalesAmount.toLocaleString()}</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Low Stock Alert</div>
          <div className="value">{stats.lowStock}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>Items need restock</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Financial Overview</h3>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Sales Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
              ₹{stats.totalSalesAmount.toLocaleString()}
            </div>
          </div>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Purchase Cost</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
              ₹{stats.totalPurchaseAmount.toLocaleString()}
            </div>
          </div>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Pending Payments</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>
              ₹{stats.pendingPayments.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Profit Analysis</h3>
          <div style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', color: 'white' }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Gross Profit</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
              ₹{(stats.totalSalesAmount - stats.totalPurchaseAmount).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {stats.totalPurchaseAmount > 0 ? 
                `${((stats.totalSalesAmount - stats.totalPurchaseAmount) / stats.totalPurchaseAmount * 100).toFixed(1)}% margin` 
                : '0% margin'}
            </div>
          </div>
          <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Sales</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>100%</span>
            </div>
            <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: '#4CAF50' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
            Recent Sales (Outgoing)
          </h3>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
            Products sold to customers - Stock decreases
          </div>
          <table style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map(sale => (
                <tr key={sale._id}>
                  <td>{sale.invoiceNumber}</td>
                  <td>{sale.customer.name}</td>
                  <td style={{ color: '#4CAF50', fontWeight: 'bold' }}>₹{sale.totalAmount}</td>
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

        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #ff9800', paddingBottom: '10px' }}>
            Recent Purchases (Incoming)
          </h3>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
            Products bought from suppliers - Stock increases
          </div>
          <table style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th>Purchase #</th>
                <th>Supplier</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPurchases.map(purchase => (
                <tr key={purchase._id}>
                  <td>{purchase.purchaseNumber}</td>
                  <td>{purchase.supplier.name}</td>
                  <td style={{ color: '#ff9800', fontWeight: 'bold' }}>₹{purchase.totalAmount}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '11px',
                      background: purchase.paymentStatus === 'paid' ? '#e8f5e9' : '#ffebee',
                      color: purchase.paymentStatus === 'paid' ? '#4CAF50' : '#f44336'
                    }}>
                      {purchase.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
