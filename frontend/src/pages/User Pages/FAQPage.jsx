import FAQ from '../../components/Common Components/FAQ';
import Header from '../../components/Common Components/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function FAQPage() {
  return (
    <div style={{ paddingTop: '5%' }}>
      <Header />
      <FAQ />
      <Footer />
      <FooterEnd />
    </div>
  );
}
