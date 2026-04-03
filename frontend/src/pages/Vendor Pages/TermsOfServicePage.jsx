import Header from '../../components/Vendor Components/VendorHeader/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import TermsOfService from '../../components/Common Components/TermsOfService';

export default function TermsOfServicePage() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <TermsOfService />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
