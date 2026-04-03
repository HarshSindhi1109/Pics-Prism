import React from 'react';
import Header from './components/Common Components/Header';
import Banner from './components/Common Components/Banner';
import Features from './components/Common Components/Features';
import Footer from './components/Common Components/Footer';
import FooterEnd from './components/Common Components/FooterEnd';
import Blogs from './components/Common Components/Blogs';
import Products from './components/Common Components/Products';
import Reviews from './components/Common Components/Reviews';
import Categories from './components/Common Components/Categories';

const UserDashboard = () => (
  <div>
    <Header />
    <Banner />
    <Blogs />
    <Features />
    <Categories />
    <Products />
    <Reviews />
    <Footer />
    <FooterEnd />
  </div>
);

export default UserDashboard;
