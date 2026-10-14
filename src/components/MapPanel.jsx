function formatOffset(seconds) {
    const sign = seconds < 0 ? "−" : "+";
    const abs = Math.abs(seconds);
    const hours = Math.floor(abs / 3600);
    const minutes = Math.floor((abs % 3600) / 60);
    return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

export default function MapPanel({ name, latitude, longitude, forecast, t, fmt }) {
    const dLon = 0.07;
    const dLat = 0.045;
    const bbox = [longitude - dLon, latitude - dLat, longitude + dLon, latitude + dLat]
        .map((n) => n.toFixed(5))
        .join(",");
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
    const largeMap = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=12/${latitude}/${longitude}`;

    return (
        <section className="map panel" aria-labelledby="map-title">
            <h2 id="map-title" className="visually-hidden">{t.mapTitle}</h2>
            <iframe
                className="map__frame"
                title={t.mapFrameTitle(name)}
                src={src}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
            <dl className="facts">
                <div className="fact">
                    <dt>{t.coordinates}</dt>
                    <dd>
                        <span className="num">{fmt.coord(latitude)}°</span> {latitude >= 0 ? t.cardinal.n : t.cardinal.s}
                        <br />
                        <span className="num">{fmt.coord(longitude)}°</span> {longitude >= 0 ? t.cardinal.e : t.cardinal.w}
                    </dd>
                </div>
                <div className="fact">
                    <dt>{t.elevation}</dt>
                    <dd><span className="num">{fmt.num(forecast.elevation)}</span> {t.unit.m}</dd>
                </div>
                <div className="fact">
                    <dt>{t.timezone}</dt>
                    <dd>
                        <span className="num">{forecast.timezone}</span>
                        <br />
                        <span className="num">{formatOffset(forecast.utc_offset_seconds)}</span>
                    </dd>
                </div>
            </dl>
            <a className="map__link" href={largeMap} target="_blank" rel="noreferrer">{t.openMap}</a>
        </section>
    )
}
