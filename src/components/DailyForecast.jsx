import WeatherIcon from "./WeatherIcon"
import { conditionKey } from "../lib/weather"

export default function DailyForecast({ forecast, selectedDay, onSelect, t, fmt }) {
    const { daily } = forecast;
    const mins = daily.temperature_2m_min;
    const maxs = daily.temperature_2m_max;
    const weekMin = Math.min(...mins);
    const weekMax = Math.max(...maxs);
    const span = weekMax - weekMin || 1;

    return (
        <section className="daily panel" aria-labelledby="daily-title">
            <h2 id="daily-title" className="section-title">{t.dailyTitle}</h2>
            <p className="section-hint">{t.dailyHint}</p>
            <ul className="daily__list">
                {daily.time.map((date, i) => {
                    const pop = daily.precipitation_probability_max[i];
                    const left = ((mins[i] - weekMin) / span) * 100;
                    const width = Math.max(((maxs[i] - mins[i]) / span) * 100, 6);
                    const selected = i === selectedDay;
                    const label = i === 0 ? t.today : i === 1 ? t.tomorrow : fmt.weekdayShort(date);

                    return (
                        <li key={date}>
                            <button
                                type="button"
                                className={`daily__row${selected ? " daily__row--active" : ""}`}
                                aria-pressed={selected}
                                aria-label={`${label}، ${t.dailyBar(fmt.temp(mins[i]), fmt.temp(maxs[i]))}`}
                                onClick={() => onSelect(i)}
                            >
                                <span className="daily__day">{label}</span>
                                <WeatherIcon kind={conditionKey(daily.weather_code[i])} size={34} />
                                <span className="daily__pop num">{pop != null && pop >= 10 ? `${fmt.num(pop)}%` : ""}</span>
                                <span className="daily__range">
                                    <span className="daily__low num">{fmt.temp(mins[i])}</span>
                                    <span className="daily__bar" aria-hidden="true">
                                        <span className="daily__fill" style={{ left: `${left}%`, width: `${width}%` }} />
                                    </span>
                                    <span className="daily__high num">{fmt.temp(maxs[i])}</span>
                                </span>
                            </button>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
