import { useEffect } from 'react';

export function usePolling(fetchFn, intervalMs, deps = []) {
  useEffect(() => {
    fetchFn();
    const interval = setInterval(fetchFn, intervalMs);
    return () => clearInterval(interval);
  }, deps);
}
