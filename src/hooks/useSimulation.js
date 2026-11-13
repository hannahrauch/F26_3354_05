import { useCallback, useEffect, useReducer } from 'react';
import { simulationReducer, createInitialState, ACTION_TYPES } from '../state/simulationReducer.js';
import { TICK_MS } from '../config/scenarios.js';

// Owns the simulation state and the one timer that drives running scenarios.
export function useSimulation() {
  const [state, dispatch] = useReducer(simulationReducer, undefined, createInitialState);
  const { scenarioId, running } = state;

  // Exactly one interval exists while a scenario is running. The effect's
  // cleanup clears it on scenario change, completion, or unmount.
  useEffect(() => {
    if (!running) return undefined;

    const intervalId = setInterval(() => {
      dispatch({ type: ACTION_TYPES.TICK, time: Date.now() });
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [running, scenarioId]);

  const selectScenario = useCallback((id) => {
    dispatch({ type: ACTION_TYPES.SELECT_SCENARIO, scenarioId: id, time: Date.now() });
  }, []);

  return { state, selectScenario };
}
