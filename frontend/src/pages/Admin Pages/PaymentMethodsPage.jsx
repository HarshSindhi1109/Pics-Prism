import Header from '../../components/Admin Components/AdminHeader/Header';
import PaymentMethods from '../../components/Common Components/PaymentMethods';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function PaymentMethodsPage() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <PaymentMethods />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
