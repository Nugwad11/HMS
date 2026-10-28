import { CITIES } from "@/lib/data";
import { nearestLocation } from "@/lib/geo";

const MAX_DISTANCE_KM = 500;
const GOOGLE_TIMEOUT_MS = 6000;

type GeocodeComponent = { long_name?: string; short_name?: string };
type GeocodeResult = { address_components?: GeocodeComponent[] };
type GeocodeResponse = { status?: string; results?: GeocodeResult[] };

const normalizeArea = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, " ").replace(/\s+state$/, "");

const CITY_BY_NAME = new Map(CITIES.map((city) => [normalizeArea(city), city]));

const ALIASES = new Map<string, string>([
  ["federal capital territory", "Abuja"],
  ["fct", "Abuja"],
  ["abuja fct", "Abuja"],
  ["abuja federal capital territory", "Abuja"],
  ["port harcourt city", "Port Harcourt"],
  ["uyo", "Akwa Ibom"],
  ["maiduguri", "Borno"],
  ["yenagoa", "Bayelsa"],
  ["makurdi", "Benue"],
  ["calabar", "Cross River"],
  ["asaba", "Delta"],
  ["abakaliki", "Ebonyi"],
  ["ado ekiti", "Ekiti"],
  ["ado-ekiti", "Ekiti"],
  ["owerri", "Imo"],
  ["dutse", "Jigawa"],
  ["birnin kebbi", "Kebbi"],
  ["lokoja", "Kogi"],
  ["ilorin", "Kwara"],
  ["lafia", "Nasarawa"],
  ["minna", "Niger"],
  ["abeokuta", "Ogun"],
  ["akure", "Ondo"],
  ["osogbo", "Osun"],
  ["jos", "Plateau"],
  ["jalingo", "Taraba"],
  ["damaturu", "Yobe"],
  ["gusau", "Zamfara"],
  ["umuahia", "Abia"],
  ["yola", "Adamawa"],
  ["awka", "Anambra"],
]);

function matchKnownArea(value: string): string | null {
  if (!value) return null;
  const key = normalizeArea(value);
  return CITY_BY_NAME.get(key) ?? ALIASES.get(key) ?? null;
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function googleArea(lat: number, lng: number, key: string): Promise<string | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("region", "ng");
  url.searchParams.set("key", key);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GOOGLE_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as GeocodeResponse;
    if (data.status !== "OK" || !Array.isArray(data.results)) return null;

    for (const result of data.results) {
      for (const component of result.address_components ?? []) {
        const match = matchKnownArea(component.short_name ?? "") ?? matchKnownArea(component.long_name ?? "");
        if (match) return match;
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const latParam = params.get("lat");
  const lngParam = params.get("lng");

  if (!latParam || !lngParam) {
    return json({ error: "Send lat and lng from the device location." }, 400);
  }

  const lat = Number(latParam);
  const lng = Number(lngParam);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return json({ error: "Send a valid lat and lng." }, 400);
  }

  const nearest = nearestLocation(lat, lng);
  if (nearest.distanceKm > MAX_DISTANCE_KM) {
    return json(
      { error: "That location looks like it is outside Nigeria. Choose your city or state from the list." },
      422,
    );
  }

  const key = process.env.GOOGLE_GEOCODING_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;
  const googleMatch = key ? await googleArea(lat, lng, key) : null;

  return json({
    location: googleMatch ?? nearest.label,
    source: googleMatch ? "google" : "offline",
    approximate: !googleMatch,
    distanceKm: Math.round(nearest.distanceKm),
  });
}
