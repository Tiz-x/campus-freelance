import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollRestoration = () => {
  const location = useLocation();

  // Save scroll position when leaving a page
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(`scroll_${location.pathname}`, window.scrollY.toString());
    };

    window.addEventListener('beforeunload', saveScroll);
    
    return () => {
      window.removeEventListener('beforeunload', saveScroll);
      saveScroll();
    };
  }, [location.pathname]);

  // Restore scroll position when coming back to a page
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(`scroll_${location.pathname}`);
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll));
      }, 100);
    }
  }, [location.pathname]);
};