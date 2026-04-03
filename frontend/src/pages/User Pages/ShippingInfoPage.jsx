import ShippingInfo from '../../components/Common Components/ShippingInfo';
import Header from '../../components/Common Components/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function ShippingInfoPage() {
  return (
    <div style={{ paddingTop: '5%' }}>
      <Header />
      <ShippingInfo />
      <Footer />
      <FooterEnd />
    </div>
  );
}
