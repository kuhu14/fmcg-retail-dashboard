// General sunrise/sunset times (no geolocation) -- 6 AM to 6 PM is the
// common rough day/night split used when a real location isn't available.
export const GENERAL_SUNRISE_HOUR = 6;
export const GENERAL_SUNSET_HOUR = 18;

export function isDaytime(date: Date): boolean {
  const hours = date.getHours() + date.getMinutes() / 60;
  return hours >= GENERAL_SUNRISE_HOUR && hours < GENERAL_SUNSET_HOUR;
}
