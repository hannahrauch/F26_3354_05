import { STATUS } from '../config/sensors.js';
import { formatTime } from '../utils/format.js';

const SEVERITY_LABEL = {
  [STATUS.CRITICAL]: 'CRITICAL',
  [STATUS.WARNING]: 'WARNING',
  [STATUS.NORMAL]: 'NORMAL',
};

export default function AlertCenter({ alerts }) {
  return (
    <section className="panel" aria-labelledby="alerts-title">
      <header className="panel__header">
        <h2 id="alerts-title" className="panel__title">ACTIVE SAFETY ALERTS</h2>
        <span className="panel__subtitle">Conditions present right now</span>
      </header>

      {alerts.length === 0 ? (
        <div className="alert alert--normal">
          <span className="alert__severity">{SEVERITY_LABEL[STATUS.NORMAL]}</span>
          <span className="alert__message">All systems normal. No active alerts.</span>
        </div>
      ) : (
        <ul className="alert-list">
          {alerts.map((alert) => (
            <li key={alert.sensorId} className={`alert alert--${alert.severity}`}>
              <span className="alert__severity">{SEVERITY_LABEL[alert.severity]}</span>
              <div className="alert__body">
                <span className="alert__message">{alert.message}</span>
                <span className="alert__meta">
                  Sensor: {alert.label} · Since {formatTime(alert.since)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
