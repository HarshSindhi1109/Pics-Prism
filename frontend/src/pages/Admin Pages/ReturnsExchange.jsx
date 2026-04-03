import Header from '../../components/Admin Components/AdminHeader/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import ReturnsExchange from '../../components/Common Components/ReturnsExchange';

export default function ReturnsExchangePage() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <ReturnsExchange />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
