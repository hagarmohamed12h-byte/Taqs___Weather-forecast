import { iconUrl } from "../lib/weather"

// The supplied icon set is daytime only, so clear and partly cloudy nights get a moon instead.
function Moon({ size, withCloud }) {
    return (
        <svg className="wicon" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
            <path d="M38 6a26 26 0 1 0 20 38A22 22 0 0 1 38 6z" fill="#E4EAFF" />
            {withCloud && (
                <g fill="#B9C6DE">
                    <ellipse cx="40" cy="48" rx="17" ry="9" />
                    <circle cx="33" cy="42" r="8" />
                    <circle cx="45" cy="41" r="6" />
                </g>
            )}
        </svg>
    )
}

export default function WeatherIcon({ kind, isDay = true, size = 48 }) {
    if (!isDay && kind === "sunny") return <Moon size={size} />;
    if (!isDay && kind === "partly-cloudy") return <Moon size={size} withCloud />;

    return <img className="wicon" src={iconUrl(kind)} width={size} height={size} alt="" />;
}
