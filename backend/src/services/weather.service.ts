import axios from 'axios';
import { WeatherResponse } from '../types';

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch current weather from OpenWeatherMap for a given lat/lon.
 * The API key is kept server-side and never exposed to the client.
 */
export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherResponse> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    throw new Error('OpenWeatherMap API key is not configured.');
  }

  const response = await axios.get(`${OPENWEATHER_BASE}/weather`, {
    params: {
      lat,
      lon,
      appid: apiKey,
      units: 'metric',
    },
    timeout: 5000,
  });

  const data = response.data;

  return {
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: data.weather[0]?.description ?? 'Unknown',
    icon: data.weather[0]?.icon ?? '01d',
    city: data.name ?? 'Unknown',
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind?.speed ?? 0),
  };
}
