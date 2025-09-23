import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteLogger() {
  const location = useLocation();
  useEffect(() => {
    console.info('Navigated to', location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}
export default RouteLogger;
