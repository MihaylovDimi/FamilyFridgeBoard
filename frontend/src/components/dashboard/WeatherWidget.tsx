import { useWeather } from '../../hooks/useWeather';

/** Maps OpenWeatherMap icon codes to simple emoji */
function weatherEmoji(icon: string): string {
  if (icon.startsWith('01')) return '☀️';
  if (icon.startsWith('02') || icon.startsWith('03')) return '⛅';
  if (icon.startsWith('04')) return '☁️';
  if (icon.startsWith('09') || icon.startsWith('10')) return '🌧️';
  if (icon.startsWith('11')) return '⛈️';
  if (icon.startsWith('13')) return '❄️';
  if (icon.startsWith('50')) return '🌫️';
  return '🌡️';
}

export function WeatherWidget() {
  const { weather, loading, error } = useWeather();

  if (loading) {
    return (
      <div style={{ textAlign: 'right', color: 'var(--text-disabled)', fontSize: '0.8125rem' }}>
        Loading weather…
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        Weather unavailable
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'right', lineHeight: 1 }}>
      <div style={{ fontSize: '1.0625rem', color: '#e8e8f0' }}>
        {weatherEmoji(weather.icon)}&nbsp;{weather.temperature}°C
      </div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>
        {weather.description} · {weather.city}
      </div>
    </div>
  );
}
