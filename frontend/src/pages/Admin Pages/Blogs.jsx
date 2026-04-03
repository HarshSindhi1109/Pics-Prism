import Header from '../../components/Admin Components/AdminHeader/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import Blogs from '../../components/Admin Components/Manage Blogs/index';

export default function ManageBlogsPage() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <Blogs />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
