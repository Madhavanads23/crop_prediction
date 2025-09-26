import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';

export function useRefreshHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [refreshPageName, setRefreshPageName] = useState('');

  useEffect(() => {
    // Store current page info when page changes
    const pageInfo = {
      pathname: location.pathname,
      timestamp: Date.now(),
      pageName: getPageName(location.pathname)
    };
    localStorage.setItem('agrismart_currentPage', JSON.stringify(pageInfo));

    // Check if this page load is due to a refresh
    const checkIfRefreshed = () => {
      const refreshFlag = sessionStorage.getItem('agrismart_pageRefreshed');
      const lastPage = sessionStorage.getItem('agrismart_lastPage');
      
      if (refreshFlag === 'true' && lastPage) {
        // Only show modal if not on home page and it's the same page that was refreshed
        if (location.pathname !== '/' && location.pathname === lastPage) {
          setRefreshPageName(getPageName(location.pathname));
          // Small delay to ensure page is fully loaded
          setTimeout(() => {
            setShowRefreshModal(true);
          }, 300);
          sessionStorage.removeItem('agrismart_pageRefreshed');
          sessionStorage.removeItem('agrismart_lastPage');
        }
      }
    };

    // Set refresh flag in sessionStorage before page unloads
    const handleBeforeUnload = () => {
      if (location.pathname !== '/') {
        sessionStorage.setItem('agrismart_pageRefreshed', 'true');
        sessionStorage.setItem('agrismart_lastPage', location.pathname);
      }
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check for refresh on component mount with slight delay
    setTimeout(checkIfRefreshed, 100);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname]);

  // Helper function to get user-friendly page names
  const getPageName = (pathname: string): string => {
    switch (pathname) {
      case '/':
        return 'Home';
      case '/dashboard':
        return 'AgriSmart Dashboard';
      case '/auth':
        return 'Authentication';
      default:
        return pathname.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Handle modal choices
  const handleStayOnPage = () => {
    setShowRefreshModal(false);
  };

  const handleGoHome = () => {
    setShowRefreshModal(false);
    navigate('/');
  };

  return {
    showRefreshModal,
    refreshPageName,
    handleStayOnPage,
    handleGoHome
  };
}