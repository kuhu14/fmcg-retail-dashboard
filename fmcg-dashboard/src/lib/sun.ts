/** Approximate sunrise/sunset for a given date & coordinates (NOAA algorithm, ~2min accuracy). */
export function getSunTimes(date: Date, lat: number, lon: number): { sunrise: Date; sunset: Date } {
  const zenith = 90.833; // official sunrise/sunset (accounts for atmospheric refraction)
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const start = Date.UTC(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000) + 1;
  const lngHour = lon / 15;

  function compute(isSunrise: boolean): Date {
    const t = dayOfYear + ((isSunrise ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
    L = ((L % 360) + 360) % 360;

    let RA = deg * Math.atan(0.91764 * Math.tan(L * rad));
    RA = ((RA % 360) + 360) % 360;
    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA /= 15;

    const sinDec = 0.39782 * Math.sin(L * rad);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH =
      (Math.cos(zenith * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
    const cosHClamped = Math.max(-1, Math.min(1, cosH));

    let H = isSunrise ? 360 - deg * Math.acos(cosHClamped) : deg * Math.acos(cosHClamped);
    H /= 15;

    const T = H + RA - 0.06571 * t - 6.622;
    let UT = T - lngHour;
    UT = ((UT % 24) + 24) % 24;

    const hours = Math.floor(UT);
    const minutes = Math.floor((UT - hours) * 60);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes));
  }

  return { sunrise: compute(true), sunset: compute(false) };
}
