import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { WeatherData } from '../types';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWeather(): UseWeatherReturn {
  const { familyId } = useAuthStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheTimestamp = useRef<number>(0);

  const fetchWeather = useCallback(
    async (lat: number, lon: number, force = false) => {
      // Skip if cached and not forced
      if (!force && Date.now() - cacheTimestamp.current < CACHE_TTL_MS) return;

      setLoading(true);
      setError(null);
      try {
        const res = await api.get<{ success: boolean; data: WeatherData }>(
          `/api/weather?lat=${lat}&lon=${lon}`
        );
        setWeather(res.data.data);
        cacheTimestamp.current = Date.now();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!familyId) return;

    // Request browser geolocation; fall back to Cambridge UK default
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchWeather(coords.latitude, coords.longitude),
        () => fetchWeather(52.2053, 0.1218) // Cambridge default
      );
    } else {
      fetchWeather(52.2053, 0.1218);
    }

    // Refresh every 10 minutes
    const interval = setInterval(
      () => fetchWeather(52.2053, 0.1218, true),
      CACHE_TTL_MS
    );
    return () => clearInterval(interval);
  }, [familyId, fetchWeather]);

  const refresh = useCallback(() => {
    cacheTimestamp.current = 0;
    fetchWeather(52.2053, 0.1218, true);
  }, [fetchWeather]);

  return { weather, loading, error, refresh };
}
