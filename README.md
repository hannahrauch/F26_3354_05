# Team 5 - Aerostotle
# Aircraft Safety Monitoring System

A React prototype of an aircraft safety monitoring dashboard for Aerostotle - Team 05's CS 3354 Project. It simulates sensor data and emergency scenarios, then shows how a monitoring system might detect and report unsafe conditions.

This is **not** a flight simulator. There is no flight physics or aircraft control. The flight instruments are static decorative displays.

## Requirements

- Node.js 18 or newer
- npm

## How to run

```bash
npm install
npm run dev
```

Open the local address Vite prints (generally will be http://localhost:5173).

Other commands:

```bash
npm test          # run the simulation logic tests
npm run build     # production build into dist/
npm run preview   # serve the production build
```

## What it does

- **Simulation Control Center**: Has 7 different scenarios. The active one is highlighted. Only one scenario runs at a time, driven by a single interval.
- **Flight Instruments**: altitude, airspeed, heading, and attitude dials. Static values only.
- **Aircraft Safety Monitoring**: Five sensors with a reading, unit, gauge or bar, and a status badge.
  - Engine Temperature and Fuel Level use circular gauges.
  - Altitude, Airspeed, and Cabin Pressure use digital readouts with a bar. Tick marks show the threshold positions.
- **Active Safety Alerts**: The conditions present right now, with sensor, severity, and time they began. Critical alerts are listed first.
- **Event History**: A log of every raised, cleared, and system event, newest first. It keeps resolved events, so it is separate from the active list.
- **Header**: Aircraft ID, a system status that changes between OPERATIONAL, WARNING, and CRITICAL, a simulation running or idle indicator, and the date and time.

### Scenarios

| Scenario | Behaviour |
| --- | --- |
| Normal Operation | Restores the five baseline readings, clears alerts, and stops any running scenario. |
| Engine Overheating | Temperature climbs toward 950 °C. Warning at 600 °C, critical at 800 °C. |
| Low Fuel | Fuel drains toward 8 %. Warning at 25 %, critical at 10 %. |
| Abnormal Altitude | Uncommanded descent toward 15,000 ft. Warning below 30,000 ft, critical below 20,000 ft. |
| Abnormal Airspeed | Airspeed bleeds toward 180 kt. Warning below 250 kt, critical below 200 kt. |
| Cabin Pressure Loss | Pressure decays toward 6.5 PSI. Warning below 10.0 PSI, critical below 8.0 PSI. |
| Sensor Failure | The Fuel Level sensor stops transmitting. Its reading shows as SENSOR FAILURE and its status is gray. Other sensors stay nominal. |

## Changing the thresholds

All demonstration limits and sensor baselines are in [src/config/sensors.js](src/config/sensors.js). The scenario targets and rates are in [src/config/scenarios.js](src/config/scenarios.js). Edit those files to change the behaviour. Nothing else needs to change.

The thresholds are demonstration values. They are **not** certified aircraft operating limits.

## Project structure

```
src/
  config/
    sensors.js            sensor definitions, thresholds, status and message rules
    scenarios.js          emergency scenarios and the timer interval
  state/
    simulationReducer.js  pure state logic: scenario selection, ticks, event log
    selectors.js          derived values: active alerts and system status
  hooks/
    useSimulation.js      owns the state and the single simulation interval
  components/
    Header.jsx            title, aircraft ID, status banner, clock
    SimulationControls.jsx
    FlightInstruments.jsx static decorative dials
    SensorPanel.jsx       sensor cards, circular gauges, digital readouts
    StatusBadge.jsx
    AlertCenter.jsx       active safety alerts
    EventHistory.jsx      event log
  utils/format.js         number and time formatting
  App.jsx                 layout
  App.css                 cockpit styling and responsive layout
tests/
  simulationReducer.test.js
```

## How the simulation works

- `useSimulation` holds the state in a reducer. It starts one `setInterval` while a scenario is running, and the effect cleanup clears it when the scenario changes, completes, or the component unmounts. Two timers cannot run at once.
- Each tick moves the ramped readings one step toward their target. The timer stops when every target is reached. The final values stay on screen.
- Status is recalculated on every change. A change in status adds an entry to the event history.
- Data is simulated in the browser. There are no sensor connections, external APIs, or backend since this is simply a demonstration. Additionally, as students we don't actually have the budget to complete this project with a real aircraft.
