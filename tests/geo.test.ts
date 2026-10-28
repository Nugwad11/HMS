import assert from "node:assert/strict";
import { test } from "node:test";
import { CITIES } from "../lib/data.ts";
import { NIGERIAN_LOCATIONS, distanceKm, nearestLocation } from "../lib/geo.ts";

const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

test("every detected location label is a selectable city or state", () => {
  const cities = new Set<string>(CITIES);
  for (const location of NIGERIAN_LOCATIONS) {
    assert.ok(cities.has(location.label), `${location.label} is not in CITIES`);
  }
});

test("the location list has no duplicate labels", () => {
  const labels = NIGERIAN_LOCATIONS.map((location) => location.label);
  assert.equal(new Set(labels).size, labels.length);
});

test("all 36 states and the FCT are covered", () => {
  const states = new Set(NIGERIAN_LOCATIONS.map((location) => location.state));
  for (const state of STATES) {
    assert.ok(states.has(state), `${state} is missing from NIGERIAN_LOCATIONS`);
  }
  assert.ok(states.has("Federal Capital Territory"));
});

test("nearest location resolves Lagos Island to Lagos", () => {
  const match = nearestLocation(6.455, 3.3841);
  assert.equal(match.label, "Lagos");
  assert.ok(match.distanceKm < 10);
});

test("nearest location resolves Kano city centre to Kano", () => {
  const match = nearestLocation(12.0045, 8.5919);
  assert.equal(match.label, "Kano");
  assert.ok(match.distanceKm < 5);
});

test("nearest location resolves a non-capital town to its state", () => {
  const match = nearestLocation(5.0378, 7.9128); // Uyo
  assert.equal(match.label, "Akwa Ibom");
});

test("haversine distance is zero for the same point and symmetric", () => {
  assert.equal(distanceKm(6.5244, 3.3792, 6.5244, 3.3792), 0);
  const forward = distanceKm(6.5244, 3.3792, 12.0022, 8.592);
  const backward = distanceKm(12.0022, 8.592, 6.5244, 3.3792);
  assert.ok(Math.abs(forward - backward) < 0.0001);
  assert.ok(forward > 800 && forward < 900, `unexpected Lagos to Kano distance: ${forward}`);
});

test("a location outside Nigeria is far beyond the acceptance radius", () => {
  const match = nearestLocation(51.5074, -0.1278); // London
  assert.ok(match.distanceKm > 500, `London resolved too close: ${match.distanceKm}`);
});
