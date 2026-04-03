import Header from '../../components/Common Components/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import Checkout from '../../components/Common Components/Checkout';

export default function CheckoutPage() {
  return (
    <div style={{ paddingTop: '5%' }}>
      <Header />
      <Checkout />
      <Footer />
      <FooterEnd/>
    </div>
  );
}
