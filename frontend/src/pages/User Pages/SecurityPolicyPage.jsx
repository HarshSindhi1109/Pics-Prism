import Header from '../../components/Common Components/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import SecurityPolicy from '../../components/Common Components/SecurityPolicy';

export default function SecurityPolicyPage() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <SecurityPolicy />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
