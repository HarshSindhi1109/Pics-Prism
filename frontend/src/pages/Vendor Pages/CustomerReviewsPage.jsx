import Header from '../../components/Vendor Components/VendorHeader/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import CustomerReviews from '../../components/Vendor Components/CustomerReviews';

export default function CustomerReviewsPage() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <CustomerReviews />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
