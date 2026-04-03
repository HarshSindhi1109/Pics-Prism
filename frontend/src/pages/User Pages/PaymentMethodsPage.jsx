import PaymentMethods from '../../components/Common Components/PaymentMethods';
import Header from '../../components/Common Components/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function PaymentMethodsPage() {
  return (
    <div style={{ paddingTop: '5%' }}>
      <Header />
      <PaymentMethods />
      <Footer />
      <FooterEnd />
    </div>
  );
}
