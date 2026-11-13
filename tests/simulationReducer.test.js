import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulationReducer, createInitialState, ACTION_TYPES } from '../src/state/simulationReducer.js';
import { getActiveAlerts, getSystemStatus } from '../src/state/selectors.js';
import { SENSOR_IDS, SENSORS, STATUS } from '../src/config/sensors.js';

function select(state, scenarioId) {
  return simulationReducer(state, { type: ACTION_TYPES.SELECT_SCENARIO, scenarioId, time: 0 });
}

function tickTimes(state, count) {
  let next = state;
  for (let i = 0; i < count; i += 1) {
    next = simulationReducer(next, { type: ACTION_TYPES.TICK, time: i + 1 });
  }
  return next;
}

function runToCompletion(state, limit = 500) {
  let next = state;
  for (let i = 0; i < limit && next.running; i += 1) {
    next = simulationReducer(next, { type: ACTION_TYPES.TICK, time: i + 1 });
  }
  return next;
}

test('initial state shows every sensor at its baseline and nominal', () => {
  const state = createInitialState(0);

  for (const id of SENSOR_IDS) {
    assert.equal(state.sensors[id].value, SENSORS[id].initial);
    assert.equal(state.sensors[id].status, STATUS.NORMAL);
  }
  assert.equal(state.running, false);
  assert.equal(getSystemStatus(state.sensors).label, 'SYSTEM OPERATIONAL');
  assert.deepEqual(getActiveAlerts(state.sensors), []);
});

test('engine overheating warns, then goes critical, then holds its final value', () => {
  let state = select(createInitialState(0), 'engineOverheat');
  assert.equal(state.running, true);

  state = tickTimes(state, 12);
  assert.equal(state.sensors.engineTemp.status, STATUS.NORMAL);

  state = tickTimes(state, 1);
  assert.equal(state.sensors.engineTemp.status, STATUS.WARNING);
  assert.equal(getSystemStatus(state.sensors).label, 'SYSTEM WARNING');

  state = tickTimes(state, 17);
  assert.equal(state.sensors.engineTemp.status, STATUS.CRITICAL);
  assert.equal(getSystemStatus(state.sensors).label, 'SYSTEM CRITICAL');

  state = runToCompletion(state);
  assert.equal(state.running, false);
  assert.equal(state.sensors.engineTemp.value, 950);
  assert.equal(state.scenarioId, 'engineOverheat');
});

test('low fuel reaches its critical threshold and the timer stops at the target', () => {
  let state = runToCompletion(select(createInitialState(0), 'lowFuel'));

  assert.equal(state.sensors.fuel.value, 8);
  assert.equal(state.sensors.fuel.status, STATUS.CRITICAL);
  assert.equal(state.running, false);
});

test('sensor failure marks one sensor unavailable and leaves the others nominal', () => {
  const state = select(createInitialState(0), 'sensorFailure');

  assert.equal(state.running, false);
  assert.equal(state.sensors.fuel.value, null);
  assert.equal(state.sensors.fuel.status, STATUS.UNAVAILABLE);

  for (const id of SENSOR_IDS.filter((sensorId) => sensorId !== 'fuel')) {
    assert.equal(state.sensors[id].status, STATUS.NORMAL);
    assert.equal(state.sensors[id].value, SENSORS[id].initial);
  }
});

test('normal operation restores baselines, clears alerts, and stops the simulation', () => {
  let state = runToCompletion(select(createInitialState(0), 'cabinPressure'));
  assert.equal(getActiveAlerts(state.sensors).length, 1);

  state = select(state, 'normal');

  assert.equal(state.running, false);
  assert.equal(state.sensors.cabinPressure.value, SENSORS.cabinPressure.initial);
  assert.deepEqual(getActiveAlerts(state.sensors), []);
  assert.equal(state.history[0].kind, 'system');
});

test('switching scenarios starts from baseline readings, not the previous scenario', () => {
  let state = runToCompletion(select(createInitialState(0), 'abnormalAirspeed'));
  assert.equal(state.sensors.airspeed.value, 180);

  state = select(state, 'abnormalAltitude');

  assert.equal(state.sensors.airspeed.value, SENSORS.airspeed.initial);
  assert.equal(state.sensors.airspeed.status, STATUS.NORMAL);
  assert.equal(state.running, true);
});

test('ticks are ignored when no scenario is running', () => {
  const state = createInitialState(0);
  assert.equal(simulationReducer(state, { type: ACTION_TYPES.TICK, time: 1 }), state);
});

test('history records raised and cleared events, newest first', () => {
  let state = runToCompletion(select(createInitialState(0), 'cabinPressure'));
  state = select(state, 'normal');

  const kinds = state.history.map((event) => event.kind);
  assert.ok(kinds.includes('raised'));
  assert.ok(kinds.includes('cleared'));
  assert.ok(state.history[0].id > state.history[state.history.length - 1].id);
});
