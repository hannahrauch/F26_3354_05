import { useEffect, useState } from 'react';
import { formatDateTime } from '../utils/format.js';

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return now;
}

export default function Header({ aircraftId, systemStatus, running }) {
  const now = useClock();

  return (
    <header className="header">
      <div className="header__brand">
        <h1 className="header__title">AIRCRAFT SAFETY MONITORING SYSTEM</h1>
        <div className="header__aircraft">
          AIRCRAFT ID <strong>{aircraftId}</strong>
        </div>
      </div>

      <div className={`status-banner status-banner--${systemStatus.level}`} role="status" aria-live="polite">
        <span className="led" aria-hidden="true" />
        {systemStatus.label}
      </div>

      <div className="header__right">
        <div className={`sim-indicator ${running ? 'sim-indicator--running' : ''}`}>
          <span className="led" aria-hidden="true" />
          {running ? 'SIMULATION RUNNING' : 'SIMULATION IDLE'}
        </div>
        <time className="header__clock" dateTime={now.toISOString()}>
          {formatDateTime(now)}
        </time>
      </div>
    </header>
  );
}
