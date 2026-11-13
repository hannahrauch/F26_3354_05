// Pure state logic for the monitoring system. No timers live here: the
// useSimulation hook owns the single interval and dispatches TICK actions.
import { SENSORS, SENSOR_IDS, STATUS, getSensorStatus, buildAlertMessage } from '../config/sensors.js';
import { SCENARIO_BY_ID } from '../config/scenarios.js';
import { formatNumber } from '../utils/format.js';

export const HISTORY_LIMIT = 60;

export const ACTION_TYPES = {
  SELECT_SCENARIO: 'SELECT_SCENARIO',
  TICK: 'TICK',
};

export function createInitialState(time = Date.now()) {
  const sensors = {};
  for (const id of SENSOR_IDS) {
    const sensor = SENSORS[id];
    sensors[id] = { value: sensor.initial, status: getSensorStatus(sensor, sensor.initial), since: time };
  }

  return appendEvents(
    { scenarioId: 'normal', running: false, tickCount: 0, sensors, history: [], nextEventId: 1 },
    [{ time, sensorId: null, kind: 'system', severity: STATUS.NORMAL, message: 'Monitoring initialised. All sensors nominal.' }],
  );
}

export function simulationReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SELECT_SCENARIO:
      return selectScenario(state, action.scenarioId, action.time);
    case ACTION_TYPES.TICK:
      return tick(state, action.time);
    default:
      return state;
  }
}

function selectScenario(state, scenarioId, time) {
  const scenario = SCENARIO_BY_ID[scenarioId];
  if (!scenario) return state;

  // Every scenario starts from the baseline readings, so switching scenarios
  // never leaves values from the previous one behind.
  const next = applyReadings(
    { ...state, scenarioId, running: false, tickCount: 0 },
    baselineReadings(),
    scenario.failedSensors,
    time,
  );

  const message = scenario.id === 'normal'
    ? 'Normal operation selected. Readings reset to baseline.'
    : `Simulation started: ${scenario.label}`;

  return {
    ...appendEvents(next, [{ time, sensorId: null, kind: 'system', severity: STATUS.NORMAL, message }]),
    running: scenario.ramps.length > 0,
  };
}

function tick(state, time) {
  if (!state.running) return state;

  const scenario = SCENARIO_BY_ID[state.scenarioId];
  const currentReadings = Object.fromEntries(SENSOR_IDS.map((id) => [id, state.sensors[id].value]));
  const { readings, finished } = stepRamps(currentReadings, scenario.ramps);

  const next = applyReadings(
    { ...state, tickCount: state.tickCount + 1 },
    readings,
    scenario.failedSensors,
    time,
  );

  if (!finished) return next;

  return {
    ...appendEvents(next, [{
      time,
      sensorId: null,
      kind: 'system',
      severity: STATUS.NORMAL,
      message: `Simulation complete: ${scenario.label}. Final values held.`,
    }]),
    running: false,
  };
}

function baselineReadings() {
  return Object.fromEntries(SENSOR_IDS.map((id) => [id, SENSORS[id].initial]));
}

// Moves each ramped reading one step toward its target. Returns whether every
// ramp has reached its target, which tells the timer it can stop.
function stepRamps(readings, ramps) {
  const next = { ...readings };
  let finished = true;

  for (const { sensor: id, target, step } of ramps) {
    const current = next[id];
    if (current === null || current === target) continue;

    const direction = Math.sign(target - current);
    const moved = current + direction * step;
    const reached = direction > 0 ? moved >= target : moved <= target;

    next[id] = reached ? target : roundTwo(moved);
    if (!reached) finished = false;
  }

  return { readings: next, finished };
}

function roundTwo(value) {
  return Math.round(value * 100) / 100;
}

// Writes new readings into the sensor state, recomputes each status, and logs
// an event for every status change.
function applyReadings(state, readings, failedSensors, time) {
  const sensors = {};
  const events = [];

  for (const id of SENSOR_IDS) {
    const sensor = SENSORS[id];
    const previous = state.sensors[id];
    const value = failedSensors.includes(id) ? null : readings[id];
    const status = getSensorStatus(sensor, value);

    if (status === previous.status) {
      sensors[id] = { ...previous, value };
      continue;
    }

    sensors[id] = { value, status, since: time };
    events.push(describeChange(sensor, value, status, time));
  }

  return appendEvents({ ...state, sensors }, events);
}

function describeChange(sensor, value, status, time) {
  if (status === STATUS.NORMAL) {
    return {
      time,
      sensorId: sensor.id,
      kind: 'cleared',
      severity: STATUS.NORMAL,
      message: `${sensor.label} back within limits at ${formatNumber(value, sensor.decimals)} ${sensor.unit}`,
    };
  }

  return {
    time,
    sensorId: sensor.id,
    kind: 'raised',
    severity: status === STATUS.CRITICAL ? STATUS.CRITICAL : STATUS.WARNING,
    message: buildAlertMessage(sensor, value, status),
  };
}

// Events are passed in chronological order and stored newest first.
function appendEvents(state, events) {
  if (events.length === 0) return state;

  const stamped = events
    .map((event, index) => ({ ...event, id: state.nextEventId + index }))
    .reverse();

  return {
    ...state,
    nextEventId: state.nextEventId + events.length,
    history: [...stamped, ...state.history].slice(0, HISTORY_LIMIT),
  };
}
