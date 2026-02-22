import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiShoppingCart, FiShoppingBag, FiBarChart2, FiUsers, FiLogOut, FiMenu, FiX, FiBox, FiBell, FiUser } from 'react-icons/fi';
import api from '../config/api';
import { hasAnyPermission } from '../utils/permissions';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Changed default to false for mobile
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchNotifications();
    
    // Set sidebar open by default on desktop
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/reports/low-stock');
      const alerts = data.map(item => ({
        id: item.product._id,
        message: `${item.product.name} is low on stock (${item.totalStock} units)`,
        type: 'warning',
        time: 'Just now'
      }));
      setNotifications(alerts);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/godowns') return 'Godowns';
    if (path === '/products') return 'Products';
    if (path === '/stock') return 'Stock Management';
    if (path === '/sales') return 'Sales';
    if (path === '/purchases') return 'Purchases';
    if (path === '/reports') return 'Reports';
    if (path === '/users') return 'Users';
    return 'Dashboard';
  };

  return (
    <div className="layout">
      {/* Backdrop for mobile */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiBox size={28} style={{ color: '#4CAF50' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '18px' }}>Warehouse</h2>
              <p style={{ margin: 0, fontSize: '11px', opacity: 0.7 }}>Management System</p>
            </div>
          </div>
        </div>
        <ul className="sidebar-menu">
          <li><NavLink to="/"><FiHome size={18} /> <span>Dashboard</span></NavLink></li>
          {hasAnyPermission('godowns') && <li><NavLink to="/godowns"><FiPackage size={18} /> <span>Godowns</span></NavLink></li>}
          {hasAnyPermission('inventory') && <li><NavLink to="/products"><FiBox size={18} /> <span>Products</span></NavLink></li>}
          {hasAnyPermission('inventory') && <li><NavLink to="/stock"><FiPackage size={18} /> <span>Stock</span></NavLink></li>}
          {hasAnyPermission('sales') && <li><NavLink to="/sales"><FiShoppingCart size={18} /> <span>Sales</span></NavLink></li>}
          {hasAnyPermission('purchases') && (
            <li>
              <NavLink to="/purchases">
                <FiShoppingBag size={18} /> 
                <span>Purchases</span>
              </NavLink>
              <div style={{ fontSize: '10px', padding: '5px 15px', opacity: 0.7, marginTop: '-5px' }}>
                Supplier se maal khareedna
              </div>
            </li>
          )}
          {hasAnyPermission('reports') && <li><NavLink to="/reports"><FiBarChart2 size={18} /> <span>Reports</span></NavLink></li>}
          {hasAnyPermission('users') && <li><NavLink to="/users"><FiUsers size={18} /> <span>Users</span></NavLink></li>}
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <FiUser size={16} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>{user.name || 'User'}</div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>{user.role || 'Staff'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut size={16} /> <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>
          <div className="header-right">
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <FiBell size={20} />
                {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
              </button>
              
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '50px',
                  right: 0,
                  width: '320px',
                  maxWidth: '90vw',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #f0f0f0' }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} style={{
                        padding: '15px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      onClick={() => navigate('/reports')}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#ff9800',
                            marginTop: '6px'
                          }}></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', color: '#333' }}>{notif.message}</div>
                            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{notif.time}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="user-avatar" onClick={() => navigate('/users')}>
              <FiUser size={20} />
            </div>
          </div>
        </header>
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
