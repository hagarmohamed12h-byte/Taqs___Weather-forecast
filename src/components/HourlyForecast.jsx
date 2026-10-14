import WeatherIcon from "./WeatherIcon"
import { conditionKey, getHours } from "../lib/weather"

const COL = 64;
const CHART_H = 100;
const PAD_TOP = 28;
const PAD_BOTTOM = 14;

export default function HourlyForecast({ forecast, day, t, fmt }) {
    const hours = getHours(forecast, day);
    if (hours.length === 0) return null;

    const temps = hours.map((h) => h.temp);
    const max = Math.max(...temps);
    const min = Math.min(...temps);
    const range = max - min || 1;

    const points = hours.map((h, i) => ({
        x: i * COL + COL / 2,
        y: PAD_TOP + ((max - h.temp) / range) * (CHART_H - PAD_TOP - PAD_BOTTOM),
    }));
    const width = hours.length * COL;
    const subtitle = day === 0 ? t.next24 : fmt.weekdayLong(forecast.daily.time[day]);

    return (
        <section className="hourly" aria-labelledby="hourly-title">
            <div className="hourly__head">
                <h2 id="hourly-title" className="section-title">{t.hourlyTitle}</h2>
                <p className="hourly__sub">{subtitle}</p>
            </div>
            <div className="hourly__scroller" tabIndex={0} role="region" aria-labelledby="hourly-title">
                <div className="hourly__track" style={{ width }}>
                    <svg className="hourly__chart" width={width} height={CHART_H} viewBox={`0 0 ${width} ${CHART_H}`} aria-hidden="true">
                        <polyline className="hourly__line" fill="none" points={points.map((p) => `${p.x},${p.y}`).join(" ")} />
                        {points.map((p, i) => {
                            const isNow = i === 0 && day === 0;
                            return (
                                <g key={hours[i].time}>
                                    <circle className={isNow ? "hourly__dot hourly__dot--now" : "hourly__dot"} cx={p.x} cy={p.y} r={isNow ? 5 : 3.5} />
                                    <text className="hourly__temp" x={p.x} y={p.y - 12} textAnchor="middle">{fmt.temp(hours[i].temp)}</text>
                                </g>
                            )
                        })}
                    </svg>
                    <ol className="hourly__list">
                        {hours.map((h, i) => (
                            <li key={h.time} className="hourly__hour" style={{ width: COL }}>
                                <WeatherIcon kind={conditionKey(h.code)} isDay={h.isDay} size={36} />
                                <span className="hourly__time">{i === 0 && day === 0 ? t.now : fmt.hour(h.time)}</span>
                                <span className="hourly__pop num">{h.pop != null && h.pop >= 10 ? `${fmt.num(h.pop)}%` : "\u00A0"}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    )
}
