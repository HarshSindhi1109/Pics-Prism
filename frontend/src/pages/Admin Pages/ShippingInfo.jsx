import Header from '../../components/Admin Components/AdminHeader/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import ShippingInfo from '../../components/Common Components/ShippingInfo';

export default function ShippingInfoPage() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <ShippingInfo />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
