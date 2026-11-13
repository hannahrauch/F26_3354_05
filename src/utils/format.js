export function formatNumber(value, decimals = 0) {
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatTime(ms) {
  return new Date(ms).toLocaleTimeString('en-GB', { hour12: false });
}

export function formatDateTime(date) {
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${day}  ${date.toLocaleTimeString('en-GB', { hour12: false })}`;
}
