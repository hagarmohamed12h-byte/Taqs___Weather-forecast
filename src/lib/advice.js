import { conditionKey, aqiLevel, uvLevel } from "./weather"

const toCelsius = (value, imperial) => (imperial ? ((value - 32) * 5) / 9 : value);
const toKmh = (value, imperial) => (imperial ? value * 1.609344 : value);

// Turns the forecast into a short list of practical tips (most important first).
// Returns [{ key, args }]; the wording lives in i18n so it works in every language.
export function buildAdvice({ forecast, air, t, fmt }) {
    const { current, current_units: units, daily } = forecast;
    const imperial = units.temperature_2m.includes("F");
    const kind = conditionKey(current.weather_code);
    const tips = [];

    const rainChance = daily.precipitation_probability_max[0] ?? 0;
    const wet = ["rain", "drizzle", "storm"].includes(kind);
    if (wet || rainChance >= 40) {
        tips.push({ key: "umbrella", args: [fmt.num(Math.max(rainChance, wet ? 60 : 0))] });
    }

    if (kind === "snow") tips.push({ key: "snow", args: [] });
    if (kind === "fog") tips.push({ key: "fog", args: [] });

    const uv = daily.uv_index_max[0];
    if (uv != null && uv >= 6) {
        tips.push({ key: "sunscreen", args: [fmt.num1(uv), t.uvLevels[uvLevel(uv)]] });
    }

    const feelsC = toCelsius(current.apparent_temperature, imperial);
    const highC = toCelsius(daily.temperature_2m_max[0], imperial);
    if (highC >= 35) {
        tips.push({ key: "heat", args: [fmt.temp(daily.temperature_2m_max[0])] });
    } else if (feelsC <= 8) {
        tips.push({ key: "cold", args: [fmt.temp(current.apparent_temperature)] });
    } else if (feelsC <= 16) {
        tips.push({ key: "jacket", args: [fmt.temp(current.apparent_temperature)] });
    }

    if (toKmh(current.wind_speed_10m, imperial) >= 35) {
        const unit = imperial ? t.unit.mph : t.unit.kmh;
        tips.push({ key: "wind", args: [`${fmt.num(current.wind_speed_10m)} ${unit}`] });
    }

    const aqi = air?.current?.us_aqi;
    if (aqi != null && aqi > 100) {
        tips.push({ key: "air", args: [t.aqiLevels[aqiLevel(aqi)]] });
    }

    if (tips.length === 0) tips.push({ key: "nice", args: [] });
    return tips.slice(0, 4);
}
