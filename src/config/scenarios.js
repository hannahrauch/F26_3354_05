// Emergency scenarios
// values that move toward a target, one step per timer tick
// failedSensors: sensors that stop transmitting (shown as SENSOR UNAVAILABLE)

export const TICK_MS = 1000;

export const SCENARIOS = [
  {
    id: 'normal',
    label: 'Normal Operation',
    description: 'All sensors report baseline readings.',
    ramps: [],
    failedSensors: [],
  },
  {
    id: 'engineOverheat',
    label: 'Engine Overheating',
    description: 'Engine temperature climbs toward 950 °C.',
    ramps: [{ sensor: 'engineTemp', target: 950, step: 12 }],
    failedSensors: [],
  },
  {
    id: 'lowFuel',
    label: 'Low Fuel',
    description: 'Fuel level drains toward 8 %.',
    ramps: [{ sensor: 'fuel', target: 8, step: 2 }],
    failedSensors: [],
  },
  {
    id: 'abnormalAltitude',
    label: 'Abnormal Altitude',
    description: 'Uncommanded descent toward 15,000 ft.',
    ramps: [{ sensor: 'altitude', target: 15000, step: 1000 }],
    failedSensors: [],
  },
  {
    id: 'abnormalAirspeed',
    label: 'Abnormal Airspeed',
    description: 'Airspeed bleeds off toward 180 kt.',
    ramps: [{ sensor: 'airspeed', target: 180, step: 15 }],
    failedSensors: [],
  },
  {
    id: 'cabinPressure',
    label: 'Cabin Pressure Loss',
    description: 'Cabin pressure decays toward 6.5 PSI.',
    ramps: [{ sensor: 'cabinPressure', target: 6.5, step: 0.3 }],
    failedSensors: [],
  },
  {
    id: 'sensorFailure',
    label: 'Sensor Failure',
    description: 'Fuel Level sensor stops transmitting data.',
    ramps: [],
    failedSensors: ['fuel'],
  },
];

export const SCENARIO_BY_ID = Object.fromEntries(SCENARIOS.map((scenario) => [scenario.id, scenario]));
