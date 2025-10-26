import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteLogger() {
  const location = useLocation();
  useEffect(() => {
  // Removed info log for production safety
  }, [location.pathname, location.search]);
  return null;
}
export default RouteLogger;
