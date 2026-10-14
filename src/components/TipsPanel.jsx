import { buildAdvice } from "../lib/advice"

const ICONS = {
    umbrella: "M12 3v1M3 12a9 9 0 0 1 18 0H3zM12 12v6a2 2 0 0 0 4 0",
    sunscreen: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2",
    heat: "M12 3v11a4 4 0 1 0 0 0V3z",
    cold: "M12 2v20M4 7l16 10M20 7L4 17",
    jacket: "M8 3l-5 4 2 4 3-1v11h8V10l3 1 2-4-5-4a4 4 0 0 1-8 0z",
    wind: "M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8",
    air: "M4 9h10a3 3 0 1 0-3-3M4 14h14a3 3 0 1 1-3 3",
    fog: "M3 8h18M5 12h14M3 16h18M7 20h10",
    snow: "M12 2v20M4 7l16 10M20 7L4 17",
    nice: "M5 13l4 4L19 7",
}

export default function TipsPanel({ forecast, air, t, fmt }) {
    const tips = buildAdvice({ forecast, air, t, fmt });

    return (
        <section className="tips panel" aria-labelledby="tips-title">
            <h2 id="tips-title" className="section-title">{t.tipsTitle}</h2>
            <ul className="tips__list">
                {tips.map((tip) => {
                    const copy = t.tips[tip.key];
                    return (
                        <li key={tip.key} className="tip">
                            <svg className="tip__icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                                <path d={ICONS[tip.key] || ICONS.nice} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div>
                                <p className="tip__title">{copy.title}</p>
                                <p className="tip__body">{copy.body(...tip.args)}</p>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
