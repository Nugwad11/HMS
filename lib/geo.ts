export type NigerianLocation = {
  /** A label that exists in CITIES, so detected values stay selectable. */
  label: string;
  state: string;
  lat: number;
  lng: number;
};

// One reference point per state, using the state capital. Labels prefer the
// familiar city name where CITIES offers both (Benin City/Edo, Ibadan/Oyo,
// Port Harcourt/Rivers) so a detected location always matches the profile list.
export const NIGERIAN_LOCATIONS: readonly NigerianLocation[] = [
  { label: "Abia", state: "Abia", lat: 5.5333, lng: 7.4833 },
  { label: "Abuja", state: "Federal Capital Territory", lat: 9.0765, lng: 7.3986 },
  { label: "Adamawa", state: "Adamawa", lat: 9.2035, lng: 12.4954 },
  { label: "Akwa Ibom", state: "Akwa Ibom", lat: 5.0378, lng: 7.9128 },
  { label: "Anambra", state: "Anambra", lat: 6.2109, lng: 7.074 },
  { label: "Bauchi", state: "Bauchi", lat: 10.3103, lng: 9.8439 },
  { label: "Bayelsa", state: "Bayelsa", lat: 4.9247, lng: 6.2642 },
  { label: "Benin City", state: "Edo", lat: 6.335, lng: 5.6037 },
  { label: "Benue", state: "Benue", lat: 7.7322, lng: 8.5391 },
  { label: "Borno", state: "Borno", lat: 11.8311, lng: 13.151 },
  { label: "Cross River", state: "Cross River", lat: 4.9757, lng: 8.3417 },
  { label: "Delta", state: "Delta", lat: 6.198, lng: 6.7306 },
  { label: "Ebonyi", state: "Ebonyi", lat: 6.3249, lng: 8.1137 },
  { label: "Ekiti", state: "Ekiti", lat: 7.6211, lng: 5.2214 },
  { label: "Enugu", state: "Enugu", lat: 6.4584, lng: 7.5464 },
  { label: "Gombe", state: "Gombe", lat: 10.2897, lng: 11.1673 },
  { label: "Ibadan", state: "Oyo", lat: 7.3775, lng: 3.947 },
  { label: "Imo", state: "Imo", lat: 5.4836, lng: 7.0333 },
  { label: "Jigawa", state: "Jigawa", lat: 11.7564, lng: 9.3389 },
  { label: "Kaduna", state: "Kaduna", lat: 10.5222, lng: 7.4383 },
  { label: "Kano", state: "Kano", lat: 12.0022, lng: 8.592 },
  { label: "Katsina", state: "Katsina", lat: 12.9908, lng: 7.6018 },
  { label: "Kebbi", state: "Kebbi", lat: 12.4539, lng: 4.1975 },
  { label: "Kogi", state: "Kogi", lat: 7.8023, lng: 6.7333 },
  { label: "Kwara", state: "Kwara", lat: 8.4966, lng: 4.5421 },
  { label: "Lagos", state: "Lagos", lat: 6.5244, lng: 3.3792 },
  { label: "Nasarawa", state: "Nasarawa", lat: 8.4939, lng: 8.5155 },
  { label: "Niger", state: "Niger", lat: 9.6139, lng: 6.5569 },
  { label: "Ogun", state: "Ogun", lat: 7.1557, lng: 3.3451 },
  { label: "Ondo", state: "Ondo", lat: 7.2571, lng: 5.2058 },
  { label: "Osun", state: "Osun", lat: 7.7827, lng: 4.5418 },
  { label: "Plateau", state: "Plateau", lat: 9.8965, lng: 8.8583 },
  { label: "Port Harcourt", state: "Rivers", lat: 4.8156, lng: 7.0498 },
  { label: "Sokoto", state: "Sokoto", lat: 13.0059, lng: 5.2476 },
  { label: "Taraba", state: "Taraba", lat: 8.8937, lng: 11.3775 },
  { label: "Yobe", state: "Yobe", lat: 11.7479, lng: 11.9608 },
  { label: "Zamfara", state: "Zamfara", lat: 12.1704, lng: 6.6641 },
] as const;

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function distanceKm(latA: number, lngA: number, latB: number, lngB: number): number {
  const dLat = toRadians(latB - latA);
  const dLng = toRadians(lngB - lngA);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(latA)) * Math.cos(toRadians(latB)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export type NearestLocation = NigerianLocation & { distanceKm: number };

export function nearestLocation(lat: number, lng: number): NearestLocation {
  let best: NearestLocation | null = null;
  for (const location of NIGERIAN_LOCATIONS) {
    const distance = distanceKm(lat, lng, location.lat, location.lng);
    if (!best || distance < best.distanceKm) {
      best = { ...location, distanceKm: distance };
    }
  }
  return best!;
}
