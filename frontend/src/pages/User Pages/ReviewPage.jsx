import Reviews from '../../components/Common Components/Reviews';
import Header from '../../components/Common Components/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function ReviewPage() {
  return (
    <div style={{ paddingTop: '5%' }}>
      <Header />
      <Reviews />
      <Footer />
      <FooterEnd/>
    </div>
  );
}
