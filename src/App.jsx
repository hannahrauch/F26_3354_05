import { useSimulation } from './hooks/useSimulation.js';
import { getActiveAlerts, getSystemStatus } from './state/selectors.js';
import Header from './components/Header.jsx';
import SimulationControls from './components/SimulationControls.jsx';
import FlightInstruments from './components/FlightInstruments.jsx';
import SensorPanel from './components/SensorPanel.jsx';
import AlertCenter from './components/AlertCenter.jsx';
import EventHistory from './components/EventHistory.jsx';

const AIRCRAFT_ID = 'AS-01';

export default function App() {
  const { state, selectScenario } = useSimulation();
  const systemStatus = getSystemStatus(state.sensors);
  const alerts = getActiveAlerts(state.sensors);

  return (
    <div className="app">
      <Header aircraftId={AIRCRAFT_ID} systemStatus={systemStatus} running={state.running} />

      <main className="dashboard">
        <div className="dashboard__full">
          <SimulationControls activeId={state.scenarioId} running={state.running} onSelect={selectScenario} />
        </div>

        <div className="dashboard__full">
          <FlightInstruments />
        </div>

        <div className="dashboard__full">
          <SensorPanel sensors={state.sensors} />
        </div>

        <AlertCenter alerts={alerts} />
        <EventHistory history={state.history} />
      </main>

      <footer className="app-footer">
        Training prototype. Simulated data only. Thresholds are configurable demonstration values, not certified aircraft operating limits.
      </footer>
    </div>
  );
}
