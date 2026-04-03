import ShippingInfo from '../../components/Common Components/ShippingInfo';
import Header from '../../components/Vendor Components/VendorHeader/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

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
