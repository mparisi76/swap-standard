export async function lookupZipCode(
  zip: string,
): Promise<{ lat: number; lng: number; label: string }> {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) throw new Error("ZIP not found");
  const data = await res.json();
  const place = data.places[0];
  return {
    lat: parseFloat(place.latitude),
    lng: parseFloat(place.longitude),
    label: `${place["place name"]}, ${place["state abbreviation"]} ${zip}`,
  };
}

const EARTH_RADIUS_MILES = 3958.8;

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function boundingBox(lat: number, lng: number, radiusMiles: number) {
  const latDelta = radiusMiles / 69;
  const lngDelta = radiusMiles / (69 * Math.cos((lat * Math.PI) / 180));
  return {
    lat_min: lat - latDelta,
    lat_max: lat + latDelta,
    lng_min: lng - lngDelta,
    lng_max: lng + lngDelta,
  };
}
