import ProductDetails from '../../components/Common Components/ProductDetails';
import Header from '../../components/Common Components/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function ProductDetailsPage() {
  return (
    <div style={{ paddingTop: '5%' }}>
      <Header />
      <ProductDetails />
      <Footer />
      <FooterEnd />
    </div>
  );
}
