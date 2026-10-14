import { currentHourIndex, aqiLevel, uvLevel } from "../lib/weather"

export default function Metrics({ forecast, air, t, fmt }) {
    const { current, current_units: units, daily, hourly } = forecast;
    const imperial = units.temperature_2m.includes("F");

    const windUnit = units.wind_speed_10m.replace("mp/h", "mph");
    const precipUnit = units.precipitation.replace("inch", "in");
    const compassIndex = Math.round(current.wind_direction_10m / 45) % 8;

    const items = [
        { key: "feels", label: t.feelsLike, value: <span className="num">{fmt.temp(current.apparent_temperature)}</span> },
        { key: "humidity", label: t.humidity, value: <span className="num">{fmt.num(current.relative_humidity_2m)}%</span> },
        {
            key: "wind",
            label: t.wind,
            value: (
                <span className="metric__wind">
                    <svg
                        className="metric__arrow"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        aria-hidden="true"
                        style={{ transform: `rotate(${current.wind_direction_10m + 180}deg)` }}
                    >
                        <path d="M12 3v18M12 3l-6 7M12 3l6 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="num">{fmt.num1(current.wind_speed_10m)}</span>
                    <span className="metric__unit">{windUnit === "mph" ? t.unit.mph : t.unit.kmh}</span>
                </span>
            ),
            hint: t.compass[compassIndex],
        },
        {
            key: "precip",
            label: t.precipitation,
            value: (
                <span>
                    <span className="num">{fmt.num1(current.precipitation)}</span>{" "}
                    <span className="metric__unit">{precipUnit === "in" ? t.unit.inch : t.unit.mm}</span>
                </span>
            ),
            hint: daily.precipitation_probability_max[0] != null ? t.chanceToday(fmt.num(daily.precipitation_probability_max[0])) : null,
        },
    ];

    const uv = daily.uv_index_max[0];
    if (uv != null) {
        items.push({
            key: "uv",
            label: t.uv,
            value: <span className="num">{fmt.num1(uv)}</span>,
            hint: t.uvLevels[uvLevel(uv)],
        });
    }

    items.push({
        key: "pressure",
        label: t.pressure,
        value: (
            <span>
                <span className="num">{fmt.num(current.pressure_msl)}</span>{" "}
                <span className="metric__unit">{t.unit.hpa}</span>
            </span>
        ),
    });

    const visibility = hourly.visibility[currentHourIndex(forecast)];
    if (visibility != null) {
        const distance = imperial ? visibility / 1609.34 : visibility / 1000;
        items.push({
            key: "visibility",
            label: t.visibility,
            value: (
                <span>
                    <span className="num">{fmt.num1(distance)}</span>{" "}
                    <span className="metric__unit">{imperial ? t.unit.mi : t.unit.km}</span>
                </span>
            ),
        });
    }

    const aqi = air?.current?.us_aqi;
    if (aqi != null) {
        const level = aqiLevel(aqi);
        items.push({
            key: "aqi",
            label: t.aqi,
            value: (
                <span className="metric__aqi">
                    <span className={`aqi-dot aqi-dot--${level}`} aria-hidden="true" />
                    <span className="num">{fmt.num(aqi)}</span>
                </span>
            ),
            hint: t.aqiLevels[level],
        });
    }

    return (
        <section className="metrics" aria-label={t.details}>
            <dl className="metrics__grid">
                {items.map((item) => (
                    <div key={item.key} className="metric">
                        <dt className="metric__label">{item.label}</dt>
                        <dd className="metric__value">{item.value}</dd>
                        {item.hint && <dd className="metric__hint">{item.hint}</dd>}
                    </div>
                ))}
            </dl>
        </section>
    )
}
