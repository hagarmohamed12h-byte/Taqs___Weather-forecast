import Segmented from "./Segmented"

export default function Header({ lang, setLang, unit, setUnit, t }) {
    return (
        <header className="header">
            <a className="brand" href="./" aria-label={t.appName}>
                <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M3 24a13 13 0 0 1 26 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="7.6" cy="14" r="3" fill="var(--accent)" />
                </svg>
                <span className="brand__name">{t.appName}</span>
            </a>
            <div className="header__controls">
                <Segmented
                    label={t.language}
                    value={lang}
                    onChange={setLang}
                    options={[
                        { value: "ar", label: "العربية" },
                        { value: "en", label: "EN" },
                    ]}
                />
                <Segmented
                    label={t.units}
                    value={unit}
                    onChange={setUnit}
                    options={[
                        { value: "C", label: <span className="num">°C</span> },
                        { value: "F", label: <span className="num">°F</span> },
                    ]}
                />
            </div>
        </header>
    )
}
