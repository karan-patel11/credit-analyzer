import { useState, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { API_BASE_URL } from '../utils/constants';
import { simulateDelay } from '../data/mockData';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { demoMode } = useAppContext();
  const abortControllerRef = useRef(null);

  const request = useCallback(async (endpoint, options = {}, mockHandler = null) => {
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      if (demoMode && mockHandler) {
        await simulateDelay();
        const data = await mockHandler();
        setLoading(false);
        return data;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return null;
      }
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [demoMode]);

  return { request, loading, error };
};
