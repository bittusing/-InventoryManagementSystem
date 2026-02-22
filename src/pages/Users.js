import React, { useState, useEffect } from 'react';
import api from '../config/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'support_staff',
    isActive: true,
    permissions: {
      godowns: { view: false, create: false, edit: false, delete: false },
      inventory: { view: false, create: false, edit: false, delete: false },
      sales: { view: false, create: false, edit: false, delete: false },
      purchases: { view: false, create: false, edit: false, delete: false },
      reports: { view: false },
      users: { view: false, create: false, edit: false, delete: false }
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePermissionChange = (module, action, value) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [module]: {
          ...formData.permissions[module],
          [action]: value
        }
      }
    });
  };

  const handleEdit = (user) => {
    setEditMode(true);
    setSelectedUserId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions || {
        godowns: { view: false, create: false, edit: false, delete: false },
        inventory: { view: false, create: false, edit: false, delete: false },
        sales: { view: false, create: false, edit: false, delete: false },
        purchases: { view: false, create: false, edit: false, delete: false },
        reports: { view: false },
        users: { view: false, create: false, edit: false, delete: false }
      }
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditMode(false);
    setSelectedUserId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'support_staff',
      isActive: true,
      permissions: {
        godowns: { view: false, create: false, edit: false, delete: false },
        inventory: { view: false, create: false, edit: false, delete: false },
        sales: { view: false, create: false, edit: false, delete: false },
        purchases: { view: false, create: false, edit: false, delete: false },
        reports: { view: false },
        users: { view: false, create: false, edit: false, delete: false }
      }
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if empty
        }
        await api.put(`/users/${selectedUserId}`, updateData);
      } else {
        // Create new user
        await api.post('/users', formData);
      }
      
      setShowModal(false);
      setEditMode(false);
      setSelectedUserId(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'support_staff',
        isActive: true,
        permissions: {
          godowns: { view: false, create: false, edit: false, delete: false },
          inventory: { view: false, create: false, edit: false, delete: false },
          sales: { view: false, create: false, edit: false, delete: false },
          purchases: { view: false, create: false, edit: false, delete: false },
          reports: { view: false },
          users: { view: false, create: false, edit: false, delete: false }
        }
      });
      fetchUsers();
      alert(editMode ? 'User updated successfully!' : 'User created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Failed to save user');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users & Roles</h1>
        <button className="btn btn-primary" onClick={handleAdd}>Add User</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    background: user.role === 'super_admin' ? '#e3f2fd' : user.role === 'admin' ? '#fff3e0' : '#f3e5f5',
                    color: user.role === 'super_admin' ? '#1976d2' : user.role === 'admin' ? '#f57c00' : '#7b1fa2'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    background: user.isActive ? '#e8f5e9' : '#ffebee',
                    color: user.isActive ? '#4CAF50' : '#f44336'
                  }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleEdit(user)}
                    style={{
                      padding: '6px 12px',
                      background: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Edit
                  </button>
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
              <h2>{editMode ? 'Edit User' : 'Add User'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required disabled={editMode} />
              </div>
              <div className="form-group">
                <label>Password {editMode && '(Leave blank to keep current)'}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editMode} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required>
                  <option value="support_staff">Support Staff</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Active User
                </label>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '15px' }}>Permissions</h3>
              {Object.keys(formData.permissions).map(module => (
                <div key={module} style={{ marginBottom: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                  <strong style={{ textTransform: 'capitalize', display: 'block', marginBottom: '10px' }}>{module}</strong>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {Object.keys(formData.permissions[module]).map(action => (
                      <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                        <input 
                          type="checkbox" 
                          checked={formData.permissions[module][action]}
                          onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                        />
                        {action}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              
              <button type="submit" className="btn btn-primary">{editMode ? 'Update User' : 'Save User'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
