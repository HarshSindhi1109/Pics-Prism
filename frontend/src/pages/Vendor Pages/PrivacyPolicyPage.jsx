import Header from '../../components/Vendor Components/VendorHeader/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import PrivacyPolicy from '../../components/Common Components/PrivacyPolicy';

export default function PrivacyPolicyPage() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <PrivacyPolicy />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
