import BecomeSeller from '../../components/Common Components/BecomeSeller';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import Header from '../../components/Common Components/Header';

export default function BecomeSellerPage() {
  return (
    <div style={{ paddingTop: '5%' }}>
      <Header />
      <BecomeSeller />
      <Footer />
      <FooterEnd />
    </div>
  );
}
