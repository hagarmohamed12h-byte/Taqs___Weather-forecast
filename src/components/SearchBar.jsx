import { useState, useEffect } from "react"
import { searchPlaces } from "../lib/weather"

export default function SearchBar({ lang, t, locating, onChoose, onSubmitQuery, onLocate }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);

    const trimmed = query.trim();
    const visible = trimmed.length >= 2 ? suggestions : [];
    const expanded = open && visible.length > 0;
    const separator = lang === "ar" ? "، " : ", ";

    useEffect(() => {
        if (trimmed.length < 2) return;

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const results = await searchPlaces(trimmed, lang, 5, controller.signal);
                setSuggestions(results);
            } catch (err) {
                if (err.name !== "AbortError") setSuggestions([]);
            }
        }, 250);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [trimmed, lang]);

    function choose(place) {
        setQuery("");
        setSuggestions([]);
        setOpen(false);
        setActive(-1);
        onChoose(place);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!trimmed) return;
        if (expanded && active >= 0) {
            choose(visible[active]);
            return;
        }
        setOpen(false);
        onSubmitQuery(trimmed);
    }

    function handleKeyDown(event) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, visible.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((i) => Math.max(i - 1, -1));
        } else if (event.key === "Escape") {
            setOpen(false);
            setActive(-1);
        }
    }

    function handleBlur(event) {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }

    return (
        <section className="search" aria-labelledby="search-title">
            <h1 id="search-title" className="search__title">{t.title}</h1>
            <form className="search__form" onSubmit={handleSubmit} role="search">
                <div className="search__field" onBlur={handleBlur}>
                    <svg className="search__icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                        <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        className="search__input"
                        type="text"
                        role="combobox"
                        aria-label={t.searchLabel}
                        aria-expanded={expanded}
                        aria-controls="city-suggestions"
                        aria-autocomplete="list"
                        aria-activedescendant={expanded && active >= 0 ? `suggestion-${active}` : undefined}
                        autoComplete="off"
                        placeholder={t.searchPlaceholder}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpen(true);
                            setActive(-1);
                        }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={handleKeyDown}
                    />
                    {expanded && (
                        <ul id="city-suggestions" className="search__list" role="listbox" aria-label={t.searchLabel}>
                            {visible.map((place, i) => (
                                <li
                                    key={`${place.id}-${i}`}
                                    id={`suggestion-${i}`}
                                    role="option"
                                    aria-selected={i === active}
                                    className={`search__option${i === active ? " search__option--active" : ""}`}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        choose(place);
                                    }}
                                >
                                    <span className="search__option-name">{place.name}</span>
                                    <span className="search__option-meta">
                                        {[place.admin1, place.country].filter(Boolean).join(separator)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button type="submit" className="btn btn--primary">{t.searchButton}</button>
                <button type="button" className="btn btn--ghost" onClick={onLocate} disabled={locating}>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {locating ? t.locating : t.locate}
                </button>
            </form>
        </section>
    )
}
