import VendorHeader from './components/Vendor Components/VendorHeader/Header';
import Footer from './components/Common Components/Footer';
import FooterEnd from './components/Common Components/FooterEnd';
import SellerDashboard from './components/Vendor Components/SellerDashboard';

const VendorDashboard = () => (
  <div>
    <VendorHeader />
    <SellerDashboard />
    <Footer />
    <FooterEnd />
  </div>
);

export default VendorDashboard;
