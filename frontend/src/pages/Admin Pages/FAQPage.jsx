import Header from '../../components/Admin Components/AdminHeader/Header';
import FAQ from '../../components/Common Components/FAQ';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function FAQPage() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <FAQ />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
