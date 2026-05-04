import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useApi } from './useApi';

export const useHealth = () => {
  const { demoMode, setHealthStatus } = useAppContext();
  const { request } = useApi();

  useEffect(() => {
    let mounted = true;
    let intervalId;

    const checkHealth = async () => {
      if (demoMode) {
        if (mounted) {
          setHealthStatus({ api: true, mysql: true, redis: true });
        }
        return;
      }

      try {
        const response = await request('/health/ready');
        if (mounted && response) {
          setHealthStatus({
            api: response.status === 'ok',
            mysql: response.components?.mysql === 'ok',
            redis: response.components?.redis === 'ok'
          });
        }
      } catch (error) {
        if (mounted) {
          setHealthStatus({ api: false, mysql: false, redis: false });
        }
      }
    };

    checkHealth(); // Initial check

    if (!demoMode) {
      intervalId = setInterval(checkHealth, 15000); // Poll every 15s
    }

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [demoMode, setHealthStatus, request]);
};
