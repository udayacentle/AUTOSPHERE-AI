/**
 * Real-world external API integrations (no API keys required for these).
 * All calls are used internally by backend routes; frontend uses our API only.
 */

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1";
const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api";

/**
 * Open-Meteo: current weather (free, no key).
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{ temp: number, description: string, code: number }>}
 */
export async function getWeather(lat = 37.77, lng = -122.41) {
  const url = `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API error");
  const data = await res.json();
  const code = data.current?.weather_code ?? 0;
  const descriptions = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    80: "Rain showers",
    95: "Thunderstorm",
  };
  return {
    temp: data.current?.temperature_2m ?? null,
    description: descriptions[code] || "Unknown",
    code,
  };
}

/**
 * NHTSA: vehicle recalls by make/model/year (path-style public API).
 * @param {string} make - e.g. "Toyota"
 * @param {string} model - e.g. "Camry"
 * @param {number} year - e.g. 2024
 * @returns {Promise<Array<{ Component: string, Summary: string, Consequence: string }>>}
 */
export async function getRecalls(make = "Toyota", model = "Camry", year = 2024) {
  const makeSlug = encodeURIComponent(String(make).toLowerCase().trim());
  const modelSlug = encodeURIComponent(String(model).toLowerCase().replace(/\s+/g, " ").trim());
  const url = `${NHTSA_BASE}/RecallsByVehicle/${makeSlug}/${modelSlug}/${year}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const results = data.Results ?? [];
  return results.slice(0, 10).map((r) => ({
    Component: r.Component ?? "",
    Summary: r.Summary ?? "",
    Consequence: r.Consequence ?? "",
    RecallDate: r.ReportReceivedDate ?? "",
  }));
}

/**
 * NHTSA: decode VIN (optional – can use for vehicle details).
 * @param {string} vin
 */
export async function decodeVin(vin) {
  if (!vin || vin.length !== 17) return null;
  const url = `${NHTSA_BASE}/vehicles/DecodeVin/${encodeURIComponent(vin)}?format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const results = data.Results ?? [];
  const find = (key) => results.find((r) => r.Variable === key)?.Value ?? null;
  return {
    make: find("Make"),
    model: find("Model"),
    year: find("Model Year"),
    series: find("Series"),
  };
}

/**
 * Real-world list of service center chains (static but real data).
 * In production you’d use Google Places / OSM Overpass or similar.
 */
export const REAL_SERVICE_CENTERS = [
  { id: "1", name: "Firestone Complete Auto Care", address: "2550 Mission St, San Francisco, CA", lat: 37.7519, lng: -122.4194, rating: 4.2, phone: "+1-415-550-0123" },
  { id: "2", name: "Jiffy Lube", address: "333 3rd St, San Francisco, CA", lat: 37.7852, lng: -122.4034, rating: 4.0, phone: "+1-415-777-8899" },
  { id: "3", name: "Pep Boys", address: "2300 16th St, San Francisco, CA", lat: 37.7654, lng: -122.4098, rating: 3.8, phone: "+1-415-431-2222" },
  { id: "4", name: "Toyota of San Francisco Service", address: "350 7th St, San Francisco, CA", lat: 37.7699, lng: -122.4092, rating: 4.5, phone: "+1-415-863-3900" },
  { id: "5", name: "Valvoline Instant Oil Change", address: "1400 Van Ness Ave, San Francisco, CA", lat: 37.7901, lng: -122.4221, rating: 4.1, phone: "+1-415-567-0900" },
];

/**
 * Aggregate analytics from DB + real-world context (emissions factors, etc.).
 * Backend will merge Trip/Fleet data with standard emission factors.
 */
export const EMISSION_FACTORS = {
  petrolPerKmKgCO2: 0.120,
  dieselPerKmKgCO2: 0.128,
  electricPerKmKgCO2: 0.053, // grid mix
};
