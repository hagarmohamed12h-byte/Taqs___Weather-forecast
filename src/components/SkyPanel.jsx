import WeatherIcon from "./WeatherIcon"
import SunArc from "./SunArc"
import { conditionKey, conditionLabel } from "../lib/weather"

export default function SkyPanel({ name, forecast, isFav, onToggleFav, t, fmt }) {
    const { current, daily } = forecast;
    const kind = conditionKey(current.weather_code);
    const isDay = current.is_day === 1;

    return (
        <section className="sky" aria-labelledby="sky-city">
            <div className="sky__head">
                <div>
                    <h2 id="sky-city" className="sky__city">{name}</h2>
                    <p className="sky__date">{fmt.longDate(current.time)}</p>
                    <p className="sky__time">{t.localTime(fmt.time(current.time))}</p>
                </div>
                <button
                    type="button"
                    className="star"
                    aria-pressed={isFav}
                    aria-label={isFav ? t.unsave : t.save}
                    title={isFav ? t.unsave : t.save}
                    onClick={onToggleFav}
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                        <path
                            d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.6l6.1-.8z"
                            fill={isFav ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            <div className="sky__body">
                <div className="sky__main">
                    <div className="sky__reading">
                        <WeatherIcon kind={kind} isDay={isDay} size={96} />
                        <p className="sky__temp num">{fmt.temp(current.temperature_2m)}</p>
                    </div>
                    <div className="sky__summary">
                        <p className="sky__condition">{conditionLabel(t, kind, isDay)}</p>
                        <p className="sky__range">
                            <span>{t.high} <span className="num">{fmt.temp(daily.temperature_2m_max[0])}</span></span>
                            <span>{t.low} <span className="num">{fmt.temp(daily.temperature_2m_min[0])}</span></span>
                        </p>
                    </div>
                </div>
                <SunArc
                    sunrise={daily.sunrise[0]}
                    sunset={daily.sunset[0]}
                    nowIso={current.time}
                    t={t}
                    fmt={fmt}
                />
            </div>
        </section>
    )
}
