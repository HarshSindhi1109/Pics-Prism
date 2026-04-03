import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './checkout.css';

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState({});
  const [platformFee] = useState(7);
  const [coupon, setCoupon] = useState(null);

  const [totals, setTotals] = useState({
    subtotal: 0,
    categoryDiscount: 0,
    couponDiscount: 0,
    totalAmount: 0,
    itemCount: 0,
  });

  const navigate = useNavigate();

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData'));
    const appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon'));

    if (appliedCoupon) setCoupon(appliedCoupon);

    if (checkoutData) {
      setCart(checkoutData.cart || []);
      setCategories(checkoutData.categories || {});
      calculateTotals(
        checkoutData.cart || [],
        checkoutData.categories || {},
        appliedCoupon
      );
    }
  }, []);

  /* ===================== HELPERS ===================== */
  const parseDiscount = (discount) => {
    if (!discount) return 0;
    const match = discount.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  const calculateItemPrices = (item, categoryMap) => {
    const category = categoryMap[item.category];
    const discountPercent = category ? parseDiscount(category.discount) : 0;

    const base = item.price * (item.quantity || 1);
    const discount = (base * discountPercent) / 100;

    return {
      base,
      discount,
      final: base - discount,
    };
  };

  /* ===================== TOTAL CALC ===================== */
  const calculateTotals = (items, categoryMap, appliedCoupon) => {
    let subtotal = 0;
    let categoryDiscount = 0;
    let finalTotal = 0;

    items.forEach((item) => {
      const price = calculateItemPrices(item, categoryMap);
      subtotal += price.base;
      categoryDiscount += price.discount;
      finalTotal += price.final;
    });

    const couponDiscount = appliedCoupon?.discount || 0;

    const totalAmount = finalTotal + platformFee - couponDiscount;

    setTotals({
      subtotal,
      categoryDiscount,
      couponDiscount,
      totalAmount: totalAmount < 0 ? 0 : totalAmount,
      itemCount: items.length,
    });
  };

  /* ===================== PAYMENT ===================== */
  const handlePayment = async () => {
    if (!cart.length) {
      alert('❌ Cart is empty');
      return;
    }

    try {
      const paymentRes = await fetch('http://localhost:5000/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totals.totalAmount * 100),
        }),
      });

      const orderData = await paymentRes.json();

      const options = {
        key: 'rzp_test_WgxamtVupSULV6',
        amount: orderData.amount,
        currency: 'INR',
        order_id: orderData.id,
        name: 'Your Store',
        description: 'Purchase',

        handler: async function (response) {
          const token = localStorage.getItem('token');

          const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              products: cart.map((item) => ({
                productId: item.productId || item._id,
                quantity: item.quantity || 1,
              })),
              totalAmount: totals.totalAmount,
              paymentId: response.razorpay_payment_id,
              coupon: coupon
                ? {
                    code: coupon.code,
                    discount: coupon.discount,
                  }
                : null,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            alert(data.error || '❌ Order failed');
            return;
          }

          alert('✅ Order placed successfully');
          localStorage.removeItem('cart');
          localStorage.removeItem('checkoutData');
          localStorage.removeItem('appliedCoupon');

          navigate('/buyer-home/order');
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      alert('❌ Payment error');
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty 🛒</p>
      ) : (
        <div className="checkout-layout">
          {/* LEFT */}
          <div className="checkout-left">
            <h3 className="section-title">
              Order Summary ({totals.itemCount} items)
            </h3>

            {cart.map((item, idx) => {
              const price = calculateItemPrices(item, categories);

              return (
                <div key={idx} className="checkout-item">
                  <img
                    src={`http://localhost:5000${item.imageUrl}`}
                    alt={item.name}
                  />

                  <div className="checkout-item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity || 1}</p>
                    <p className="final-price">₹{price.final.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT */}
          <div className="checkout-right">
            <h3 className="section-title">Price Details</h3>

            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>

            {totals.categoryDiscount > 0 && (
              <div className="price-row discount-row">
                <span>Category Discount</span>
                <span>- ₹{totals.categoryDiscount.toFixed(2)}</span>
              </div>
            )}

            {totals.couponDiscount > 0 && (
              <div className="price-row discount-row">
                <span>Coupon ({coupon?.code})</span>
                <span>- ₹{totals.couponDiscount}</span>
              </div>
            )}

            <div className="price-row">
              <span>Platform Fee</span>
              <span>₹{platformFee.toFixed(2)}</span>
            </div>

            <hr />

            <div className="price-row total-row">
              <span>Total Amount</span>
              <span>₹{totals.totalAmount.toFixed(2)}</span>
            </div>

            <button className="pay-btn" onClick={handlePayment}>
              Pay ₹{totals.totalAmount.toFixed(2)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
