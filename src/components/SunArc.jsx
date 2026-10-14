import { minutesOfDay } from "../lib/weather"

const CX = 150;
const CY = 124;
const R = 110;

export default function SunArc({ sunrise, sunset, nowIso, t, fmt }) {
    const rise = minutesOfDay(sunrise);
    const set = minutesOfDay(sunset);
    const now = minutesOfDay(nowIso);
    const span = set - rise;

    const raw = span > 0 ? (now - rise) / span : 0;
    const sunIsUp = raw >= 0 && raw <= 1;
    const progress = Math.min(1, Math.max(0, raw));

    const angle = progress * Math.PI;
    const sunX = CX - R * Math.cos(angle);
    const sunY = CY - R * Math.sin(angle);

    const startX = CX - R;
    const trackPath = `M ${startX} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
    const donePath = `M ${startX} ${CY} A ${R} ${R} 0 0 1 ${sunX} ${sunY}`;

    const hours = Math.floor(span / 60);
    const minutes = span % 60;

    return (
        <figure className="arc" dir="ltr">
            <svg
                viewBox="0 0 300 140"
                role="img"
                aria-label={t.sunArcLabel(fmt.time(sunrise), fmt.time(sunset))}
            >
                <line className="arc__horizon" x1={startX - 16} y1={CY} x2={CX + R + 16} y2={CY} />
                <path className="arc__track" d={trackPath} fill="none" />
                {sunIsUp && progress > 0 && (
                    <path className="arc__done" d={donePath} fill="none" pathLength="1" />
                )}
                {sunIsUp && <circle className="arc__sun" cx={sunX} cy={sunY} r="8" />}
            </svg>
            <figcaption className="arc__caption">
                <div>
                    <p className="arc__label">{t.sunrise}</p>
                    <p className="arc__time num">{fmt.time(sunrise)}</p>
                </div>
                <p className="arc__note" dir="auto">
                    {sunIsUp ? t.daylight(fmt.num(hours), fmt.num(minutes)) : t.sunDown}
                </p>
                <div className="arc__end">
                    <p className="arc__label">{t.sunset}</p>
                    <p className="arc__time num">{fmt.time(sunset)}</p>
                </div>
            </figcaption>
        </figure>
    )
}
