const KEY = "user_location";

export interface UserLocation {
  lat: number;
  lng: number;
  label: string; // e.g. "Portland, OR 97201" or "Current location"
}

export function getUserLocation(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserLocation) : null;
  } catch {
    return null;
  }
}

export function setUserLocation(loc: UserLocation): void {
  localStorage.setItem(KEY, JSON.stringify(loc));
}

export function clearUserLocation(): void {
  localStorage.removeItem(KEY);
}
