// Demonstration thresholds only. These teaching values are configurable and
// are NOT certified aircraft operating limits.
import { formatNumber } from '../utils/format.js';

export const STATUS = {
  NORMAL: 'normal',
  WARNING: 'warning',
  CRITICAL: 'critical',
  UNAVAILABLE: 'unavailable',
};

// `high` triggers when the value rises to the bound, `low` when it falls to it.
export const SENSORS = {
  engineTemp: {
    id: 'engineTemp',
    label: 'Engine Temperature',
    unit: '°C',
    initial: 450,
    min: 0,
    max: 1000,
    decimals: 0,
    display: 'circular',
    high: { warning: 600, critical: 800 },
  },
  fuel: {
    id: 'fuel',
    label: 'Fuel Level',
    unit: '%',
    initial: 72,
    min: 0,
    max: 100,
    decimals: 0,
    display: 'circular',
    low: { warning: 25, critical: 10 },
  },
  altitude: {
    id: 'altitude',
    label: 'Altitude',
    unit: 'ft',
    initial: 35000,
    min: 0,
    max: 45000,
    decimals: 0,
    display: 'digital',
    low: { warning: 30000, critical: 20000 },
    high: { warning: 40000, critical: 42000 },
  },
  airspeed: {
    id: 'airspeed',
    label: 'Airspeed',
    unit: 'kt',
    initial: 480,
    min: 0,
    max: 600,
    decimals: 0,
    display: 'digital',
    low: { warning: 250, critical: 200 },
    high: { warning: 520, critical: 580 },
  },
  cabinPressure: {
    id: 'cabinPressure',
    label: 'Cabin Pressure',
    unit: 'PSI',
    initial: 11.8,
    min: 0,
    max: 15,
    decimals: 1,
    display: 'digital',
    low: { warning: 10, critical: 8 },
  },
};

export const SENSOR_IDS = Object.keys(SENSORS);

export function getSensorStatus(sensor, value) {
  if (value === null || value === undefined) return STATUS.UNAVAILABLE;

  if (sensor.high) {
    if (value >= sensor.high.critical) return STATUS.CRITICAL;
    if (value >= sensor.high.warning) return STATUS.WARNING;
  }
  if (sensor.low) {
    if (value <= sensor.low.critical) return STATUS.CRITICAL;
    if (value <= sensor.low.warning) return STATUS.WARNING;
  }
  return STATUS.NORMAL;
}

export function buildAlertMessage(sensor, value, status) {
  if (status === STATUS.UNAVAILABLE) {
    return `${sensor.label}: no data received from sensor`;
  }

  const isHigh = Boolean(sensor.high) && value >= sensor.high.warning;
  const bounds = isHigh ? sensor.high : sensor.low;
  const limit = status === STATUS.CRITICAL ? bounds.critical : bounds.warning;
  const level = status === STATUS.CRITICAL ? 'CRITICAL' : 'WARNING';

  return `${level}: ${sensor.label} ${isHigh ? 'above' : 'below'} ${formatNumber(limit, sensor.decimals)} ${sensor.unit} (reading ${formatNumber(value, sensor.decimals)} ${sensor.unit})`;
}

// Position of a value along the sensor's scale, 0–100.
export function toPercent(sensor, value) {
  const ratio = (value - sensor.min) / (sensor.max - sensor.min);
  return Math.min(100, Math.max(0, ratio * 100));
}

// Percentages where the threshold limits sit on the scale (used for bar ticks).
export function getThresholdMarkers(sensor) {
  return [sensor.low, sensor.high]
    .filter(Boolean)
    .flatMap((bounds) => [toPercent(sensor, bounds.warning), toPercent(sensor, bounds.critical)]);
}
