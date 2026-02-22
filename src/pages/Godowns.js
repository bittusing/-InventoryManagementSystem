import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { checkPermission } from '../utils/permissions';

const Godowns = () => {
  const [godowns, setGodowns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', address: '', city: '', state: '', pincode: '', manager: '', contact: '' });

  const canCreate = checkPermission('godowns', 'create');
  // const canEdit = checkPermission('godowns', 'edit');
  // const canDelete = checkPermission('godowns', 'delete');

  useEffect(() => {
    fetchGodowns();
  }, []);

  const fetchGodowns = async () => {
    try {
      const { data } = await api.get('/godowns');
      setGodowns(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/godowns', formData);
      setShowModal(false);
      setFormData({ name: '', code: '', address: '', city: '', state: '', pincode: '', manager: '', contact: '' });
      fetchGodowns();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Godowns</h1>
        {canCreate && <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Godown</button>}
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>City</th>
              <th>Manager</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {godowns.map(godown => (
              <tr key={godown._id}>
                <td>{godown.code}</td>
                <td>{godown.name}</td>
                <td>{godown.city}</td>
                <td>{godown.manager}</td>
                <td>{godown.contact}</td>
                <td>{godown.isActive ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Godown</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Manager</label>
                <input type="text" value={formData.manager} onChange={(e) => setFormData({...formData, manager: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Contact</label>
                <input type="text" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Godowns;
