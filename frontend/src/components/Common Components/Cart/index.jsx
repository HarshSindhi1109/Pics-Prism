import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState({}); // Store category discount info
  const [platformFee] = useState(7);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const navigate = useNavigate();

  const role = localStorage.getItem('userRole');

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);

    // Fetch category discounts for all items in cart
    if (savedCart.length > 0) {
      fetchCategoryDiscounts(savedCart);
    }
  }, []);

  // Fetch category discounts for each product in cart
  const fetchCategoryDiscounts = async (cartItems) => {
    const categoryIds = [...new Set(cartItems.map((item) => item.category))];
    const categoryPromises = categoryIds.map((id) =>
      fetch(`http://localhost:5000/api/categories/${id}`)
        .then((res) => res.json())
        .catch(() => null)
    );

    try {
      const categoryResults = await Promise.all(categoryPromises);
      const categoryMap = {};
      categoryResults.forEach((cat) => {
        if (cat && cat._id) {
          categoryMap[cat._id] = cat;
        }
      });
      setCategories(categoryMap);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Update localStorage whenever the cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    // Update categories when cart changes
    if (cart.length > 0) {
      fetchCategoryDiscounts(cart);
    }
  }, [cart]);

  // Helper function to parse discount string (e.g., "20% off" -> 20)
  const parseDiscount = (discountString) => {
    if (!discountString) return 0;
    const match = discountString.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  };

  // Calculate price for a single item
  const calculateItemPrices = (item) => {
    const category = categories[item.category];
    const discountPercentage = category ? parseDiscount(category.discount) : 0;

    const basePrice = item.price;
    const discountAmount = (basePrice * discountPercentage) / 100;
    const finalPrice = basePrice - discountAmount;

    return {
      basePrice,
      discountPercentage,
      discountAmount,
      finalPrice,
    };
  };

  // Calculate totals for the entire cart
  const calculateTotals = () => {
    let subtotal = 0;
    let categoryDiscount = 0;
    let totalFinal = 0;

    cart.forEach((item) => {
      const prices = calculateItemPrices(item);
      const quantity = item.quantity || 1;

      subtotal += prices.basePrice * quantity;
      categoryDiscount += prices.discountAmount * quantity;
      totalFinal += prices.finalPrice * quantity;
    });

    const totalSavings = categoryDiscount + couponDiscount;
    const totalAmount = totalFinal + platformFee - couponDiscount;

    return {
      subtotal,
      categoryDiscount, // ✅ correct
      totalSavings,
      totalFinal,
      totalAmount,
      itemCount: cart.length,
    };
  };

  const {
    subtotal,
    categoryDiscount,
    totalSavings,
    totalFinal,
    totalAmount,
    itemCount,
  } = calculateTotals();

  const applyCoupon = async () => {
    try {
      const { totalFinal } = calculateTotals();

      const res = await fetch('http://localhost:5000/api/coupon/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },

        body: JSON.stringify({
          code: couponCode,
          orderAmount: totalFinal + platformFee,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setCouponDiscount(data.discount);

      localStorage.setItem(
        'appliedCoupon',
        JSON.stringify({
          code: data.couponCode,
          discount: data.discount,
          type: data.discountType,
        })
      );
    } catch {
      alert('Coupon Failed');
    }
  };

  // Increase Quantity
  const increaseQuantity = (index) => {
    const updatedCart = [...cart];

    if (updatedCart[index].quantity >= updatedCart[index].stock) {
      alert('❌ Stock limit reached');
      return;
    }

    updatedCart[index].quantity = (updatedCart[index].quantity || 1) + 1;
    setCart(updatedCart);
  };

  // Decrease Quantity
  const decreaseQuantity = (index) => {
    const updatedCart = [...cart];
    const currentQty = updatedCart[index].quantity || 1;

    if (currentQty > 1) {
      updatedCart[index].quantity = currentQty - 1;
      setCart(updatedCart);
    }
  };

  // Remove item from cart
  const removeFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  // Save for later (simplified - just move to localStorage)
  const saveForLater = (index) => {
    const updatedCart = [...cart];
    const itemToSave = updatedCart.splice(index, 1)[0];
    setCart(updatedCart);

    // Save to localStorage for "saved items"
    const savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
    savedItems.push(itemToSave);
    localStorage.setItem('savedItems', JSON.stringify(savedItems));

    alert('Item saved for later!');
  };

  // Proceed to Checkout
  const proceedToCheckout = () => {
    // Prepare checkout data
    const checkoutData = {
      cart,
      totals: calculateTotals(),
      categories,
    };
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));

    role === 'buyer'
      ? navigate('/buyer-home/checkout')
      : navigate('/seller-home/checkout');
  };

  const userName = localStorage.getItem('userName');

  return (
    <div className="cart-container">
      <h1 className="cart-header" style={{ textAlign: 'center' }}>
        Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
      </h1>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
            alt="Empty Cart"
            className="empty-cart-image"
          />
          <h2>Your cart is empty</h2>
          <p>Add items to your cart to see them here.</p>
          <button
            onClick={() => navigate('/buyer-home/product')}
            className="shop-btn"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left Column - Cart Items */}
          <div className="cart-items-column">
            {cart.map((item, index) => {
              const prices = calculateItemPrices(item);
              const quantity = item.quantity || 1;

              return (
                <div key={index} className="cart-item-flipkart">
                  <div className="item-image">
                    <img
                      src={
                        `http://localhost:5000${item.imageUrl}` ||
                        'fallback-image.jpg'
                      }
                      alt={item.name}
                      onError={(e) => (e.target.src = 'fallback-image.jpg')}
                    />
                  </div>

                  <div className="item-details">
                    <h3 className="item-title">{item.name}</h3>
                    <p className="item-category">
                      Category: {categories[item.category]?.name || 'General'}
                    </p>

                    <div className="item-pricing">
                      <span className="current-price">
                        ₹{(prices.finalPrice * quantity).toFixed(2)}
                      </span>
                      {prices.discountPercentage > 0 && (
                        <>
                          <span className="original-price">
                            ₹{(prices.basePrice * quantity).toFixed(2)}
                          </span>
                          <span className="discount-percent">
                            {prices.discountPercentage}% off
                          </span>
                        </>
                      )}
                    </div>

                    <div className="item-actions">
                      <div className="quantity-controls-flipkart">
                        <button
                          onClick={() => decreaseQuantity(index)}
                          className="qty-btn"
                        >
                          -
                        </button>
                        <span className="qty-display">{quantity}</span>
                        <button
                          onClick={() => increaseQuantity(index)}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>

                      <div className="action-buttons">
                        <button
                          onClick={() => saveForLater(index)}
                          className="save-btn"
                        >
                          SAVE FOR LATER
                        </button>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="remove-btn-flipkart"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Price Details */}
          <div className="price-details-column">
            <div className="price-details-card">
              {/* Coupon Section */}
              <div className="coupon-section">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input"
                />
                <button onClick={applyCoupon} className="apply-coupon-btn">
                  APPLY
                </button>

                {couponDiscount > 0 && (
                  <p className="coupon-text">
                    Coupon <strong>{couponCode}</strong> applied (₹
                    {couponDiscount} off)
                  </p>
                )}
              </div>
              <h3 className="price-details-title">PRICE DETAILS</h3>
              <div className="price-row">
                <span>
                  Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {categoryDiscount > 0 && (
                <div className="price-row">
                  <span>Discount</span>
                  <span className="discount-text">
                    - ₹{categoryDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="price-row">
                  <span>Coupon Discount</span>
                  <span className="discount-text">- ₹{couponDiscount}</span>
                </div>
              )}

              <div className="price-row">
                <span>Platform Fee</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>

              <div className="price-row total-row">
                <span className="total-label">Total Amount</span>
                <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="savings-info">
                  You will save ₹{totalSavings.toFixed(2)} on this order.
                </div>
              )}

              {userName ? (
                <button onClick={proceedToCheckout} className="place-order-btn">
                  PLACE ORDER
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="place-order-btn"
                >
                  LOGIN TO PLACE ORDER
                </button>
              )}

              <div className="secure-info">
                Safe and Secure Payments. Easy returns. 100% Authentic products.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
