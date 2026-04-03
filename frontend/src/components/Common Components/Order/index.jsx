import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Order.css';
import Invoice from '../../../Invoice';

export default function OrderStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const invoiceRef = useRef(null);

  //  Fetch orders of logged-in user on page reload
  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const userId = localStorage.getItem('userId');

        if (!userId) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/orders/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user orders');
        }

        const data = await response.json();
        console.log(data)
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, []);

  // Generate Invoice PDF
  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('invoice.pdf');
    } catch (err) {
      console.error('PDF generation failed', err);
    }
  };

  return (
    <section className="order-status" id="order-status">
      <h1 className="heading">
        Order <span>Status</span>
      </h1>

      {loading ? (
        <p className="loading-text">Loading orders...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : orders.length === 0 ? (
        /*  BEAUTIFUL EMPTY STATE */
        <div className="no-orders">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
            alt="No orders"
          />
          <h2>You haven’t placed any order yet</h2>
          <p>Once you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Transaction</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>

                  <td>
                    <ul className="order-items">
                      {order.products.map((product) => (
                        <li key={product.productId}>
                          <img
                            src={`http://localhost:5000${product.imageUrl}`}
                            alt={product.name}
                          />
                          {product.name} (x{product.quantity})
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td>
                    ₹{Number(order.amount).toFixed(2)}
                    {order.coupon?.code && (
                      <p
                        className="coupon-text"
                        style={{ fontSize: '12px', color: 'green' }}
                      >
                        Coupon {order.coupon?.code} applied (₹
                        {Number(order.coupon?.discount).toFixed(2)} off)
                      </p>
                    )}
                  </td>

                  <td>{order.transactionId}</td>

                  <td className="status-cell">
                    <span
                      className={`status ${order.status.trim().toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setTimeout(generatePDF, 400);
                      }}
                    >
                      Download Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hidden invoice for PDF */}
      {selectedOrder && (
        <Invoice ref={invoiceRef} selectedOrder={selectedOrder} />
      )}
    </section>
  );
}
