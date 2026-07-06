import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export function ClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center', lineHeight: 1 }}>
      <div
        style={{
          fontFamily: 'ui-monospace, "Cascadia Code", "Courier New", monospace',
          fontSize: '2.125rem',
          fontWeight: 200,
          color: '#ffffff',
          letterSpacing: '0.1em',
        }}
      >
        {format(now, 'HH:mm')}
      </div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>
        {format(now, 'EEEE d MMMM yyyy')}
      </div>
    </div>
  );
}
