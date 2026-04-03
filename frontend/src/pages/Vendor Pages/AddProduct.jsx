import AddProducts from '../../components/Admin Components/AddProducts';
import Header from '../../components/Vendor Components/VendorHeader/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function AddProduct() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <AddProducts />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
