import {useState, useEffect} from 'react';
import Sidebar from '../../components/common/Sidebar';
import ViewReceipts from '../../components/common/viewReceipt/ViewReceipts';
import ReceiptEntry from '@/components/common/newReceipt/ReceiptEntry';
import Overview from '@/components/common/overview/Overview';
import Nav from '@/components/ui/Nav';
import ComingSoon from '@/components/common/Reports';

export default function DeoDashboard() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeNav, setActiveNav] = useState(() => {
    return localStorage.getItem('activeNav') ?? 'overview';
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarVisible(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('activeNav', activeNav);
  }, [activeNav]);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  const renderContent = () => {
    switch (activeNav) {
      case 'overview':
        return <Overview onNavigate={setActiveNav} />;
      case 'addReceipt':
        return <ReceiptEntry />;
      case 'viewReceipts':
        return <ViewReceipts />;
      case 'reports':
        return <ComingSoon />;
      default:
        return <Overview onNavigate={setActiveNav} />;
    }
  };

  return (
    <div className='flex flex-col h-screen bg-gray-50 overflow-hidden'>
      <div className='flex flex-1 overflow-hidden relative'>
        <Sidebar
          sidebarVisible={sidebarVisible}
          isMobile={isMobile}
          setSidebarVisible={setSidebarVisible}
          activeNav={activeNav}
          onNavClick={setActiveNav}
        />

        <main
          className={`flex flex-col flex-1 overflow-auto h-full transition-all duration-300 ${
            isMobile && sidebarVisible ? 'ml-0 opacity-50' : 'ml-0'
          }`}>
          <div className='sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3'>
            <Nav onToggleSidebar={toggleSidebar} />
          </div>

          <div className='m-2 my-0 flex-1 flex bg-white/50 rounded-2xl'>
            {renderContent()}
          </div>
        </main>

        {isMobile && sidebarVisible && (
          <div
            className='fixed inset-0 bg-black/10 z-40 md:hidden'
            onClick={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
}
