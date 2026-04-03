import Categories from '../../components/Common Components/Categories';
import Header from '../../components/Common Components/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function CategoriesPage() {
  return (
    <div style={{ paddingTop: '5%' }}>
      <Header />
      <Categories />
      <Footer />
      <FooterEnd/>
    </div>
  );
}
