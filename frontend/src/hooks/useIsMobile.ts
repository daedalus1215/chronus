import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 599px)';

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches);
    };
    setIsMobile(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
};
