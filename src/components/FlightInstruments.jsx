// Static, decorative instruments. They show fixed values and never update.
const CENTER = 100;
const RADIUS = 88;

function polar(angleDeg, radius = RADIUS) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

function Dial({ title, readout, children }) {
  return (
    <figure className="instrument">
      <svg viewBox="0 0 200 200" role="img" aria-label={`${title} indicator, ${readout}`}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS + 8} className="instrument__bezel" />
        <circle cx={CENTER} cy={CENTER} r={RADIUS} className="instrument__face" />
        {children}
      </svg>
      <figcaption>
        <span className="instrument__title">{title}</span>
        <strong className="instrument__readout">{readout}</strong>
      </figcaption>
    </figure>
  );
}

// Labelled ticks around a full circle. labels[i] sits at angle i * 360 / labels.length.
function TickRing({ labels }) {
  const step = 360 / labels.length;
  return labels.map((label, index) => {
    const angle = index * step;
    const outer = polar(angle, RADIUS - 2);
    const inner = polar(angle, RADIUS - 12);
    const text = polar(angle, RADIUS - 24);
    return (
      <g key={label}>
        <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} className="instrument__tick" />
        <text x={text.x} y={text.y} className="instrument__label" textAnchor="middle" dominantBaseline="middle">
          {label}
        </text>
      </g>
    );
  });
}

function Needle({ angle, className = 'instrument__needle' }) {
  const tip = polar(angle, RADIUS - 22);
  const tail = polar(angle + 180, 14);
  return <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} className={className} />;
}

function AltitudeIndicator() {
  // 0–50,000 ft around the dial, needle at a fixed 35,000 ft.
  const labels = ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45'];
  return (
    <Dial title="ALTITUDE" readout="35,000 FT">
      <TickRing labels={labels} />
      <Needle angle={(35000 / 50000) * 360} />
      <circle cx={CENTER} cy={CENTER} r={4} className="instrument__hub" />
    </Dial>
  );
}

function AirspeedIndicator() {
  // 270° sweep, 0–600 kt, needle at a fixed 480 kt.
  const sweep = 270;
  const start = -135;
  const angleFor = (kt) => start + (kt / 600) * sweep;
  const labels = [0, 100, 200, 300, 400, 500, 600];
  return (
    <Dial title="AIRSPEED" readout="480 KT">
      {labels.map((kt) => {
        const angle = angleFor(kt);
        const outer = polar(angle, RADIUS - 2);
        const inner = polar(angle, RADIUS - 12);
        const text = polar(angle, RADIUS - 24);
        return (
          <g key={kt}>
            <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} className="instrument__tick" />
            <text x={text.x} y={text.y} className="instrument__label" textAnchor="middle" dominantBaseline="middle">
              {kt / 100}
            </text>
          </g>
        );
      })}
      <Needle angle={angleFor(480)} />
      <circle cx={CENTER} cy={CENTER} r={4} className="instrument__hub" />
    </Dial>
  );
}

function CompassIndicator() {
  // Card rotated so heading 270° sits under the lubber line at the top.
  const heading = 270;
  const cardLabels = [
    { text: 'N', angle: 0 },
    { text: '3', angle: 30 },
    { text: '6', angle: 60 },
    { text: 'E', angle: 90 },
    { text: '12', angle: 120 },
    { text: '15', angle: 150 },
    { text: 'S', angle: 180 },
    { text: '21', angle: 210 },
    { text: '24', angle: 240 },
    { text: 'W', angle: 270 },
    { text: '30', angle: 300 },
    { text: '33', angle: 330 },
  ];
  return (
    <Dial title="HEADING" readout="HDG 270°">
      <g transform={`rotate(${-heading} ${CENTER} ${CENTER})`}>
        {cardLabels.map(({ text, angle }) => {
          const outer = polar(angle, RADIUS - 2);
          const inner = polar(angle, RADIUS - 12);
          const label = polar(angle, RADIUS - 24);
          const isCardinal = ['N', 'E', 'S', 'W'].includes(text);
          return (
            <g key={text}>
              <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} className="instrument__tick" />
              <text
                x={label.x}
                y={label.y}
                className={isCardinal ? 'instrument__label instrument__label--cardinal' : 'instrument__label'}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${angle} ${label.x} ${label.y})`}
              >
                {text}
              </text>
            </g>
          );
        })}
      </g>
      <polygon points={`${CENTER},${CENTER - RADIUS + 2} ${CENTER - 6},${CENTER - RADIUS - 8} ${CENTER + 6},${CENTER - RADIUS - 8}`} className="instrument__lubber" />
    </Dial>
  );
}

function ArtificialHorizon() {
  // Level flight: sky above the horizon, ground below, fixed aircraft symbol.
  return (
    <Dial title="ATTITUDE" readout="PITCH 0° · BANK 0°">
      <defs>
        <clipPath id="horizon-clip">
          <circle cx={CENTER} cy={CENTER} r={RADIUS} />
        </clipPath>
      </defs>
      <g clipPath="url(#horizon-clip)">
        <rect x="0" y="0" width="200" height={CENTER} className="instrument__sky" />
        <rect x="0" y={CENTER} width="200" height="200" className="instrument__ground" />
        <line x1="0" y1={CENTER} x2="200" y2={CENTER} className="instrument__horizon-line" />
        {[-20, -10, 10, 20].map((deg) => {
          const y = CENTER - deg * 2;
          return <line key={deg} x1={CENTER - 22} y1={y} x2={CENTER + 22} y2={y} className="instrument__pitch-line" />;
        })}
      </g>
      <path d={`M ${CENTER - 40} ${CENTER} L ${CENTER - 14} ${CENTER} L ${CENTER - 8} ${CENTER + 6}`} className="instrument__aircraft" />
      <path d={`M ${CENTER + 40} ${CENTER} L ${CENTER + 14} ${CENTER} L ${CENTER + 8} ${CENTER + 6}`} className="instrument__aircraft" />
      <circle cx={CENTER} cy={CENTER} r={4} className="instrument__aircraft-dot" />
    </Dial>
  );
}

export default function FlightInstruments() {
  return (
    <section className="panel" aria-labelledby="instruments-title">
      <header className="panel__header">
        <h2 id="instruments-title" className="panel__title">FLIGHT INSTRUMENTS</h2>
        <span className="panel__subtitle">Decorative display · static values</span>
      </header>

      <div className="instrument-grid">
        <AltitudeIndicator />
        <AirspeedIndicator />
        <CompassIndicator />
        <ArtificialHorizon />
      </div>
    </section>
  );
}
