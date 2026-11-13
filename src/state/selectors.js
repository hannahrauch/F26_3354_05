import { SENSORS, SENSOR_IDS, STATUS, buildAlertMessage } from '../config/sensors.js';

// Active alerts are derived from the current sensor statuses, so they clear
// automatically when a reading returns to normal.
export function getActiveAlerts(sensors) {
  return SENSOR_IDS
    .filter((id) => sensors[id].status !== STATUS.NORMAL)
    .map((id) => {
      const { value, status, since } = sensors[id];
      return {
        sensorId: id,
        label: SENSORS[id].label,
        severity: status === STATUS.CRITICAL ? STATUS.CRITICAL : STATUS.WARNING,
        message: buildAlertMessage(SENSORS[id], value, status),
        since,
      };
    })
    .sort((a, b) => (b.severity === STATUS.CRITICAL) - (a.severity === STATUS.CRITICAL));
}

export function getSystemStatus(sensors) {
  const statuses = SENSOR_IDS.map((id) => sensors[id].status);

  if (statuses.includes(STATUS.CRITICAL)) {
    return { level: STATUS.CRITICAL, label: 'SYSTEM CRITICAL' };
  }
  if (statuses.includes(STATUS.WARNING) || statuses.includes(STATUS.UNAVAILABLE)) {
    return { level: STATUS.WARNING, label: 'SYSTEM WARNING' };
  }
  return { level: STATUS.NORMAL, label: 'SYSTEM OPERATIONAL' };
}
