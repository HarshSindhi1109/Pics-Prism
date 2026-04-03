import Blogs from '../../components/Common Components/Blogs';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import Header from '../../components/Common Components/Header';

export default function BlogPage() {
  return (
    <div style={{ paddingTop: '5%' }}>
      <Header />
      <Blogs />
      <Footer />
      <FooterEnd/>
    </div>
  );
}
