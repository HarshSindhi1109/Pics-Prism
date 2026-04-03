import Header from '../../components/Admin Components/AdminHeader/Header';
import AddVendorUsers from '../../components/Admin Components/AddVendorUsers';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function AddVendorUsersPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ height: '100px' }}></div> {/* Spacer */}
        <div style={{ flex: 1 }}>
          <AddVendorUsers />
        </div>
        <Footer />
        <FooterEnd />
      </div>
    </div>
  );
}
