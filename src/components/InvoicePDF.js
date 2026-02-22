import React from 'react';

const InvoicePDF = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>Invoice Preview</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div id="invoice-content" style={{ padding: '20px', background: 'white' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '3px solid #667eea', paddingBottom: '20px' }}>
            <h1 style={{ margin: 0, color: '#667eea', fontSize: '32px' }}>INVOICE</h1>
            <p style={{ margin: '5px 0', color: '#666' }}>Warehouse Management System</p>
          </div>

          {/* Invoice Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Bill To:</h3>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <strong>{sale.customer?.name}</strong><br />
                Phone: {sale.customer?.phone}<br />
                {sale.customer?.gstin && `GSTIN: ${sale.customer.gstin}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <strong>Invoice #:</strong> {sale.invoiceNumber}<br />
                <strong>Date:</strong> {new Date(sale.invoiceDate).toLocaleDateString()}<br />
                <strong>Godown:</strong> {sale.godown?.name}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px' }}>ITEM</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px' }}>QTY</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px' }}>PRICE</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px' }}>GST</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{item.product?.name}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>₹{item.price}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>{item.gstPercent}%</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ marginLeft: 'auto', width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
              <span>Subtotal:</span>
              <span>₹{sale.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
              <span>CGST:</span>
              <span>₹{sale.cgst}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', borderBottom: '1px solid #dee2e6' }}>
              <span>SGST:</span>
              <span>₹{sale.sgst}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
              <span>Total Amount:</span>
              <span>₹{sale.totalAmount}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #f0f0f0', textAlign: 'center', fontSize: '12px', color: '#666' }}>
            <p>Thank you for your business!</p>
            <p>This is a computer generated invoice.</p>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handlePrint}>Print Invoice</button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePDF;
