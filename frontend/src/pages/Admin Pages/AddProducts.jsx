import AddProduct from '../../components/Admin Components/AddProducts';
import Header from '../../components/Admin Components/AdminHeader/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function AddProducts() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <AddProduct />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
