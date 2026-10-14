const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const weatherCodeMap = {
    0: "sunny",
    1: "partly-cloudy", 2: "partly-cloudy",
    3: "overcast",
    45: "fog", 48: "fog",
    51: "drizzle", 53: "drizzle", 55: "drizzle", 56: "drizzle", 57: "drizzle",
    61: "rain", 63: "rain", 65: "rain", 66: "rain", 67: "rain",
    80: "rain", 81: "rain", 82: "rain",
    71: "snow", 73: "snow", 75: "snow", 77: "snow", 85: "snow", 86: "snow",
    95: "storm", 96: "storm", 99: "storm",
};

export const DEFAULT_PLACES = {
    en: { id: 360630, name: "Cairo", country: "Egypt", latitude: 30.06263, longitude: 31.24967, lang: "en" },
    ar: { id: 360630, name: "القاهرة", country: "مصر", latitude: 30.06263, longitude: 31.24967, lang: "ar" },
};

export const DEFAULT_PLACE_ID = 360630;

// Saved data can come from an older version or be edited by hand, so check its shape before using it.
export function isValidPlace(p) {
    return Boolean(p) && Number.isFinite(p.latitude) && Number.isFinite(p.longitude);
}

// The default city has a name in each language, so switching language swaps it automatically.
export function localizePlace(place, lang) {
    if (!isValidPlace(place)) return DEFAULT_PLACES[lang];
    if (place.id === DEFAULT_PLACE_ID && !place.isCurrent) return DEFAULT_PLACES[lang];
    return place;
}

export function conditionKey(code) {
    return weatherCodeMap[code] || "sunny";
}

export function conditionLabel(t, kind, isDay) {
    if (kind === "sunny" && !isDay) return t.conditions.clear;
    return t.conditions[kind];
}

// The sky theme drives the whole palette (see data-sky in App.css).
export function skyTheme(kind, isDay) {
    if (kind === "storm") return "storm";
    if (kind === "snow") return "snow";
    if (kind === "rain" || kind === "drizzle") return "rain";
    if (kind === "overcast" || kind === "fog") return "cloud";
    return isDay ? "sun" : "night";
}

export function iconUrl(kind) {
    return new URL(`../assets/images/icon-${kind}.webp`, import.meta.url).href;
}

export function placeKey(p) {
    return `${p.latitude.toFixed(2)},${p.longitude.toFixed(2)}`;
}

export function placeName(p, t) {
    return p.isCurrent ? t.myLocation : p.name;
}

export function placeLabel(p, t, lang) {
    if (p.isCurrent) return t.myLocation;
    return [p.name, p.country].filter(Boolean).join(lang === "ar" ? "، " : ", ");
}

export function toPlace(r, lang) {
    return {
        id: r.id,
        name: r.name,
        admin1: r.admin1,
        country: r.country,
        latitude: r.latitude,
        longitude: r.longitude,
        lang,
    };
}

export function currentHourIndex(forecast) {
    const hour = forecast.current.time.slice(0, 13);
    const i = forecast.hourly.time.findIndex((t) => t.slice(0, 13) === hour);
    return i >= 0 ? i : 0;
}

export function getHours(forecast, day) {
    const { hourly } = forecast;
    const start = day === 0 ? currentHourIndex(forecast) : day * 24;
    const hours = [];
    for (let i = start; i < Math.min(start + 24, hourly.time.length); i++) {
        hours.push({
            time: hourly.time[i],
            temp: hourly.temperature_2m[i],
            code: hourly.weather_code[i],
            isDay: hourly.is_day[i] === 1,
            pop: hourly.precipitation_probability[i],
        });
    }
    return hours;
}

export function aqiLevel(aqi) {
    if (aqi <= 50) return 0;
    if (aqi <= 100) return 1;
    if (aqi <= 150) return 2;
    if (aqi <= 200) return 3;
    if (aqi <= 300) return 4;
    return 5;
}

export function uvLevel(uv) {
    if (uv < 3) return 0;
    if (uv < 6) return 1;
    if (uv < 8) return 2;
    if (uv < 11) return 3;
    return 4;
}

export function minutesOfDay(iso) {
    return parseInt(iso.slice(11, 13), 10) * 60 + parseInt(iso.slice(14, 16), 10);
}

function apiError(code, message) {
    const err = new Error(message);
    err.code = code;
    return err;
}

async function getJson(url, signal) {
    let response;
    try {
        response = await fetch(url, { signal });
    } catch (err) {
        if (err.name === "AbortError") throw err;
        throw apiError("network", "Network error");
    }
    if (!response.ok) throw apiError("network", `Request failed with status ${response.status}`);
    return response.json();
}

export function fetchForecast({ latitude, longitude }, unit, signal) {
    const imperial = unit === "F";
    const unitParams = imperial
        ? "&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch"
        : "&wind_speed_unit=kmh&temperature_unit=celsius&precipitation_unit=mm";

    const params = [
        `latitude=${latitude}`,
        `longitude=${longitude}`,
        "timezone=auto",
        "forecast_days=7",
        "current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,precipitation,wind_speed_10m,wind_direction_10m,pressure_msl",
        "hourly=temperature_2m,weather_code,is_day,precipitation_probability,visibility",
        "daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max",
    ].join("&");

    return getJson(`${FORECAST_URL}?${params}${unitParams}`, signal);
}

// Air quality is a bonus: if it fails, the rest of the dashboard still works.
export function fetchAirQuality({ latitude, longitude }, signal) {
    return getJson(`${AIR_URL}?latitude=${latitude}&longitude=${longitude}&current=us_aqi`, signal);
}

export async function searchPlaces(name, lang, count, signal) {
    const url = `${GEO_URL}?name=${encodeURIComponent(name)}&count=${count}&language=${lang}&format=json`;
    const data = await getJson(url, signal);
    return (data.results || []).map((r) => toPlace(r, lang));
}
