import { STATUS } from '../config/sensors.js';

const LABELS = {
  [STATUS.NORMAL]: 'NORMAL',
  [STATUS.WARNING]: 'WARNING',
  [STATUS.CRITICAL]: 'CRITICAL',
  [STATUS.UNAVAILABLE]: 'SENSOR UNAVAILABLE',
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status}`}>{LABELS[status]}</span>;
}
