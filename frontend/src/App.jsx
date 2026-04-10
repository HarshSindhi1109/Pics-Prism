import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollTop from './ScrollTop';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './Login';
import RegisterPage from './RegisterPage';
import AdminLogin from './components/Admin Components/AdminLogin';
import OtpVerify from './OtpVerify';
import SellerLoginPage from './SellerLogin';

// Dashboards
import UserDashboard from './UserDashboard';
import VendorDashboard from './VendorDashboard';
import AdminDashboard from './AdminDashboard';

// Common
import Profile from './components/Common Components/Profile';

// Buyer Pages
import Product from './pages/User Pages/Products';
import Categories from './pages/User Pages/Categories';
import OrderStatus from './pages/User Pages/OrderStatus';
import ReviewPage from './pages/User Pages/ReviewPage';
import CartPage from './pages/User Pages/Cart';
import CheckoutPage from './pages/User Pages/Checkout';
import WishlistPage from './pages/User Pages/WishlistPage';
import PaymentMethodsPage from './pages/User Pages/PaymentMethodsPage';
import ShippingInfoPage from './pages/User Pages/ShippingInfoPage';
import FAQPage from './pages/User Pages/FAQPage';
import ReturnsExchangePage from './pages/User Pages/ReturnsExchangePage';
import BecomeSellerPage from './pages/User Pages/BecomeSellerPage';
import CatewiseProducts from './components/Common Components/CatewiseProducts';
import BuyerTermsOfServicePage from './pages/User Pages/TermsOfServicePage';
import BuyerPrivacyPolicyPage from './pages/User Pages/PrivacyPolicyPage';
import BuyerSecurityPolicyPage from './pages/User Pages/SecurityPolicyPage';
import BuyerContactUsPage from './pages/User Pages/ContactUsPage';
import ProductDetailsPage from './pages/User Pages/ProductDetailsPage';

// Vendor Pages
import AddProductVendor from './pages/Vendor Pages/AddProduct';
import OrderStatusManagementPage from './pages/Vendor Pages/OrderStatusManagementPage';
import SellerFAQPage from './pages/Vendor Pages/FAQPage';
import SellerPaymentMethodsPage from './pages/Vendor Pages/PaymentMethodsPage';
import SellerShippingInfoPage from './pages/Vendor Pages/ShippingInfoPage';
import SellerReturnsExchangePage from './pages/Vendor Pages/ReturnsExchange';
import SellerCartPage from './pages/Vendor Pages/Cart';
import SellerCheckoutPage from './pages/Vendor Pages/Checkout';
import TermsOfServicePage from './pages/Vendor Pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/Vendor Pages/PrivacyPolicyPage';
import SecurityPolicyPage from './pages/Vendor Pages/SecurityPolicyPage';
import ContactUsPage from './pages/Vendor Pages/ContactUsPage';
import CustomerReviewsPage from './pages/Vendor Pages/CustomerReviewsPage';

// Admin Pages
import AddProduct from './pages/Admin Pages/AddProducts';
import AddVendorUsersPage from './pages/Admin Pages/AddVendorUsersPage';
import UsersManagement from './pages/Admin Pages/UserManagementPage';
import CategoryManagementPage from './pages/Admin Pages/CategoryManagementPage';
import AdminFAQPage from './pages/Admin Pages/FAQPage';
import AdminPaymentMethodsPage from './pages/Admin Pages/PaymentMethodsPage';
import AdminReturnsExchange from './pages/Admin Pages/ReturnsExchange';
import AdminShippingInfo from './pages/Admin Pages/ShippingInfo';
import AdminTermsOfServicePage from './pages/Admin Pages/TermsOfServicePage';
import AdminPrivacyPolicyPage from './pages/Admin Pages/PrivacyPolicyPage';
import AdminSecurityPolicyPage from './pages/Admin Pages/SecurityPolicyPage';
import ContactMessagesPage from './pages/Admin Pages/ContactMessagesPage';
import CouponsPage from './pages/Admin Pages/CouponsPage';

const App = () => {
  return (
    <Router>
      <ScrollTop />
      <Routes>
        {/* ---------- PUBLIC ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/seller-login" element={<SellerLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/" element={<UserDashboard />} />

        {/* ---------- PUBLIC INFO PAGES ---------- */}
        <Route path="/payment-methods" element={<PaymentMethodsPage />} />
        <Route path="/shipping-info" element={<ShippingInfoPage />} />
        <Route path="/returns-exchange" element={<ReturnsExchangePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/terms-of-service" element={<BuyerTermsOfServicePage />} />
        <Route path="/privacy-policy" element={<BuyerPrivacyPolicyPage />} />
        <Route path="/security" element={<BuyerSecurityPolicyPage />} />
        <Route path="/contact" element={<BuyerContactUsPage />} />

        {/* ---------- BUYER ---------- */}
        <Route
          path="/buyer-home"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/profile"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/product"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/product/:id"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <ProductDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/categories"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/order"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <OrderStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/wishlist"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/become-seller"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BecomeSellerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/review"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <ReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/cart"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/payment-methods"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <PaymentMethodsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/shipping-info"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <ShippingInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/returns-exchange"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <ReturnsExchangePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/FAQ"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <FAQPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/terms-of-service"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerTermsOfServicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/privacy-policy"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerPrivacyPolicyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/security"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerSecurityPolicyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/contact"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerContactUsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-home/checkout"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category/:categoryId"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <CatewiseProducts />
            </ProtectedRoute>
          }
        />

        {/* ---------- SELLER ---------- */}
        <Route
          path="/seller-home"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/profile"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/add-product"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <AddProductVendor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/cart"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerCartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/customer-reviews"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <CustomerReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/checkout"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerCheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/payment-methods"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerPaymentMethodsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/terms-of-service"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <TermsOfServicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/privacy-policy"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <PrivacyPolicyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/security"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SecurityPolicyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/shipping-info"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerShippingInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/returns-exchange"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerReturnsExchangePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/FAQ"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerFAQPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/contact"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <ContactUsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-home/manage-order-status"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <OrderStatusManagementPage />
            </ProtectedRoute>
          }
        />

        {/* ---------- ADMIN ---------- */}
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/profile"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/add-product"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/add-seller"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddVendorUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/user-management"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/coupons"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CouponsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/manage-categories"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CategoryManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/contact-messages"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ContactMessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/FAQ"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminFAQPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/payment-methods"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPaymentMethodsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/returns-exchange"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReturnsExchange />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/shipping-info"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminShippingInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/terms-of-service"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTermsOfServicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/privacy-policy"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPrivacyPolicyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home/security"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSecurityPolicyPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
