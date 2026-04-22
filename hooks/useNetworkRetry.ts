import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * A robust production network hook that wraps async calls with automated exponential backoff retries.
 * Usage: const { execute, loading } = useNetworkRetry(fetchMyData);
 */
export function useNetworkRetry<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: RetryOptions = {}
) {
  const { maxRetries = 3, baseDelayMs = 1000, onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true);
      setError(null);
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          const result = await asyncFunction(...args);
          if (onSuccess) onSuccess(result);
          setLoading(false);
          return result;
        } catch (err: any) {
          attempt++;
          console.warn(`[Network] Attempt ${attempt} failed: ${err.message}`);
          
          if (attempt >= maxRetries) {
            setError(err);
            if (onError) onError(err);
            else Alert.alert('Network Error', 'Please check your internet connection and try again.');
            setLoading(false);
            return null;
          }
          
          // Exponential backoff
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      return null;
    },
    [asyncFunction, maxRetries, baseDelayMs, onSuccess, onError]
  );

  return { execute, loading, error };
}
