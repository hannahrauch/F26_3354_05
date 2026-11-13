import { SCENARIOS, SCENARIO_BY_ID } from '../config/scenarios.js';

export default function SimulationControls({ activeId, running, onSelect }) {
  const active = SCENARIO_BY_ID[activeId];

  return (
    <section className="panel" aria-labelledby="controls-title">
      <header className="panel__header">
        <h2 id="controls-title" className="panel__title">SIMULATION CONTROL CENTER</h2>
        <span className="panel__subtitle">
          ACTIVE: {active.label.toUpperCase()}
          {running ? ' · RUNNING' : ''}
        </span>
      </header>

      <div className="scenario-buttons">
        {SCENARIOS.map((scenario, index) => {
          const isActive = scenario.id === activeId;
          return (
            <button
              key={scenario.id}
              type="button"
              className={`scenario-button ${isActive ? 'scenario-button--active' : ''}`}
              aria-pressed={isActive}
              title={scenario.description}
              onClick={() => onSelect(scenario.id)}
            >
              <span className="scenario-button__index">{index + 1}</span>
              {scenario.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
