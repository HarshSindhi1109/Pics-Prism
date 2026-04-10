import React from 'react';
import AdminHeader from './components/Admin Components/AdminHeader/Header/index.jsx';
import Footer from './components/Common Components/Footer/index.jsx';
import FooterEnd from './components/Common Components/FooterEnd/index.jsx';
import AdminDashboard from './components/Admin Components/AdminDashboard/index.jsx';
// import CategoryManagement from './components/Admin Components/CategoryManagement/index.jsx';

const AdminDashboardPage = () => (
  <div>
    <AdminHeader />
    <AdminDashboard />
    <Footer />
    <FooterEnd />
  </div>
);

export default AdminDashboardPage;
