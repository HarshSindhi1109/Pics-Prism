import React, { forwardRef } from 'react';

const Invoice = forwardRef(({ selectedOrder }, ref) => {
  if (!selectedOrder) return null;

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: '-9999px',
        background: 'white',
        padding: '20px',
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Invoice</h2>
      <p>
        <strong>Order ID:</strong> {selectedOrder._id}
      </p>
      <p>
        <strong>Transaction ID:</strong> {selectedOrder.transactionId}
      </p>
      <p>
        <strong>Status:</strong> {selectedOrder.status}
      </p>
      <p>
        <strong>Date:</strong>{' '}
        {new Date(selectedOrder.createdAt).toLocaleDateString()}
      </p>

      <h3>Books</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#ddd' }}>
            <th style={{ border: '1px solid black', padding: '5px' }}>Name</th>
            <th style={{ border: '1px solid black', padding: '5px' }}>Price</th>
            <th style={{ border: '1px solid black', padding: '5px' }}>
              Quantity
            </th>
          </tr>
        </thead>
        <tbody>
          {selectedOrder.products.map((product) => (
            <tr key={product.productId}>
              <td style={{ border: '1px solid black', padding: '5px' }}>
                {product.name}
              </td>
              <td style={{ border: '1px solid black', padding: '5px' }}>
                ₹{product.price}
              </td>
              <td style={{ border: '1px solid black', padding: '5px' }}>
                {product.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: '20px' }}>Price Summary</h3>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ padding: '5px' }}>Subtotal</td>
            <td style={{ padding: '5px', textAlign: 'right' }}>
              ₹{selectedOrder.amount + (selectedOrder.coupon?.discount || 0)}
            </td>
          </tr>

          {selectedOrder.coupon && (
            <tr>
              <td style={{ padding: '5px' }}>
                Coupon ({selectedOrder.coupon.code})
              </td>
              <td
                style={{ padding: '5px', textAlign: 'right', color: 'green' }}
              >
                - ₹{selectedOrder.coupon.discount}
              </td>
            </tr>
          )}

          <tr style={{ borderTop: '1px solid black' }}>
            <td style={{ padding: '5px', fontWeight: 'bold' }}>Total Paid</td>
            <td
              style={{ padding: '5px', textAlign: 'right', fontWeight: 'bold' }}
            >
              ₹{selectedOrder.amount}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default Invoice;
