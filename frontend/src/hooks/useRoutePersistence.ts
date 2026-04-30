import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useRoutePersistence = () => {
  const location = useLocation();

  useEffect(() => {
    // Save all routes except public ones
    if (location.pathname !== '/' && 
        location.pathname !== '/login' && 
        location.pathname !== '/signup' &&
        location.pathname !== '/select-role') {
      sessionStorage.setItem('lastRoute', location.pathname);
    }
  }, [location.pathname]);
};

export const getLastRoute = () => {
  return sessionStorage.getItem('lastRoute');
};

export const clearSavedRoute = () => {
  sessionStorage.removeItem('lastRoute');
};