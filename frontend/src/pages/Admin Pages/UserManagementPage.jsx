// UserManagementPage.jsx
import Header from '../../components/Admin Components/AdminHeader/Header';
import UserManagement from '../../components/Admin Components/UserManagement';
import Footer from '../../components/Common Components/Footer';
import FooterEnd from '../../components/Common Components/FooterEnd';

export default function UserManagementPage() {
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
          <UserManagement />
        </div>
        <Footer />
        <FooterEnd />
      </div>
    </div>
  );
}
