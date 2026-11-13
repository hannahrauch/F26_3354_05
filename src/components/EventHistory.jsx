import { formatTime } from '../utils/format.js';

const KIND_LABEL = {
  raised: 'RAISED',
  cleared: 'CLEARED',
  system: 'SYSTEM',
};

export default function EventHistory({ history }) {
  return (
    <section className="panel" aria-labelledby="history-title">
      <header className="panel__header">
        <h2 id="history-title" className="panel__title">EVENT HISTORY</h2>
        <span className="panel__subtitle">Log of changes, including resolved events</span>
      </header>

      {history.length === 0 ? (
        <p className="empty-state">No events recorded yet.</p>
      ) : (
        <ol className="event-list">
          {history.map((event) => (
            <li key={event.id} className={`event event--${event.severity}`}>
              <time className="event__time">{formatTime(event.time)}</time>
              <span className={`event__kind event__kind--${event.kind}`}>{KIND_LABEL[event.kind]}</span>
              <span className="event__message">{event.message}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
