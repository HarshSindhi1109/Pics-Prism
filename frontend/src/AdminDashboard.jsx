import React from 'react';
import AdminHeader from './components/Admin Components/AdminHeader/Header/index.jsx';
import Footer from './components/Common Components/Footer/index.jsx';
import FooterEnd from './components/Common Components/FooterEnd/index.jsx';
import Banner from './components/Common Components/Banner/index.jsx';
import Blogs from './components/Admin Components/Manage Blogs/index.jsx';
import AdminDashboard from './components/Admin Components/AdminDashboard/index.jsx';
// import CategoryManagement from './components/Admin Components/CategoryManagement/index.jsx';

const AdminDashboardPage = () => (
  <div>
    {/* <Banner /> */}
    <AdminHeader />
    {/* <CategoryManagement /> */}
    <AdminDashboard />
    <Blogs />
    <Footer />
    <FooterEnd />
  </div>
);

export default AdminDashboardPage;
