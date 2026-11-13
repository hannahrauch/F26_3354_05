import { SENSORS, SENSOR_IDS, STATUS, toPercent, getThresholdMarkers } from '../config/sensors.js';
import { formatNumber } from '../utils/format.js';
import StatusBadge from './StatusBadge.jsx';

const ARC_FRACTION = 0.75; // gauge sweeps 270°
const GAUGE_RADIUS = 50;
const GAUGE_LENGTH = 2 * Math.PI * GAUGE_RADIUS * ARC_FRACTION;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

function CircularGauge({ percent, status, valueText, unit }) {
  const fillOffset = GAUGE_LENGTH * (1 - percent / 100);

  return (
    <div className="gauge">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r={GAUGE_RADIUS}
          className="gauge__track"
          strokeDasharray={`${GAUGE_LENGTH} ${GAUGE_CIRCUMFERENCE}`}
          transform="rotate(135 60 60)"
        />
        {status !== STATUS.UNAVAILABLE && (
          <circle
            cx="60"
            cy="60"
            r={GAUGE_RADIUS}
            className="gauge__fill"
            strokeDasharray={`${GAUGE_LENGTH} ${GAUGE_CIRCUMFERENCE}`}
            strokeDashoffset={fillOffset}
            transform="rotate(135 60 60)"
          />
        )}
      </svg>
      <div className="gauge__center">
        <span className="gauge__value">{valueText}</span>
        {unit && <span className="gauge__unit">{unit}</span>}
      </div>
    </div>
  );
}

function BarReadout({ sensor, percent, status, valueText }) {
  return (
    <div className="digital-readout">
      <div className="digital-readout__value">
        {status === STATUS.UNAVAILABLE ? (
          <span className="digital-readout__fault">--- SENSOR FAILURE</span>
        ) : (
          <>
            <span className="digital-readout__number">{valueText}</span>
            <span className="digital-readout__unit">{sensor.unit}</span>
          </>
        )}
      </div>
      <div className="bar" aria-hidden="true">
        {status !== STATUS.UNAVAILABLE && <div className="bar__fill" style={{ width: `${percent}%` }} />}
        {getThresholdMarkers(sensor).map((marker, index) => (
          <span key={index} className="bar__marker" style={{ left: `${marker}%` }} />
        ))}
      </div>
    </div>
  );
}

function SensorCard({ sensor, reading }) {
  const { value, status } = reading;
  const isUnavailable = status === STATUS.UNAVAILABLE;
  const percent = isUnavailable ? 0 : toPercent(sensor, value);
  const valueText = isUnavailable ? '---' : formatNumber(value, sensor.decimals);

  return (
    <article className={`sensor-card sensor-card--${status}`} aria-label={`${sensor.label}, ${status}`}>
      <header className="sensor-card__header">
        <span className="sensor-card__name">{sensor.label}</span>
        <span className="led" aria-hidden="true" />
      </header>

      {sensor.display === 'circular' ? (
        <CircularGauge percent={percent} status={status} valueText={isUnavailable ? 'N/A' : valueText} unit={sensor.unit} />
      ) : (
        <BarReadout sensor={sensor} percent={percent} status={status} valueText={valueText} />
      )}

      <footer className="sensor-card__footer">
        <StatusBadge status={status} />
      </footer>
    </article>
  );
}

export default function SensorPanel({ sensors }) {
  return (
    <section className="panel" aria-labelledby="sensors-title">
      <header className="panel__header">
        <h2 id="sensors-title" className="panel__title">AIRCRAFT SAFETY MONITORING</h2>
        <span className="panel__subtitle">Demonstration thresholds, not certified limits</span>
      </header>

      <div className="sensor-grid">
        {SENSOR_IDS.map((id) => (
          <SensorCard key={id} sensor={SENSORS[id]} reading={sensors[id]} />
        ))}
      </div>
    </section>
  );
}
