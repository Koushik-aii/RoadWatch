import { useEffect, useState } from 'react';
import { getAnalyticsDashboard } from '../services/analyticsApi';

export function useAnalytics(filters, { pollMs = 30000 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await getAnalyticsDashboard(filters);
        if (!cancelled) {
          setData(next);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Analytics unavailable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    load();
    const interval = setInterval(load, pollMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    filters.district,
    filters.severity,
    filters.startDate,
    filters.endDate,
    filters.maxPoints,
    pollMs,
  ]);

  return { data, loading, error };
}
