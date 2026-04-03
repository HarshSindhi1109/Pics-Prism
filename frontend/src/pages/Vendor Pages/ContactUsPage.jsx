import Header from '../../components/Vendor Components/VendorHeader/Header';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';
import ContactUs from '../../components/Common Components/ContactUs';

export default function ContactUsPage() {
  return (
    <div>
      <Header />
      <div style={{ paddingTop: '5%' }}>
        <ContactUs />
      </div>
      <Footer />
      <FooterEnd />
    </div>
  );
}
