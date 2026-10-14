import { placeName } from "../lib/weather"

export default function Favorites({ favorites, activeKey, onSelect, onRemove, t }) {
    if (favorites.length === 0) return null;

    return (
        <nav className="favs" aria-label={t.saved}>
            <ul className="favs__list">
                {favorites.map((fav) => {
                    const name = placeName(fav, t);
                    const active = fav.key === activeKey;
                    return (
                        <li key={fav.key} className={`chip${active ? " chip--active" : ""}`}>
                            <button
                                type="button"
                                className="chip__main"
                                aria-current={active ? "true" : undefined}
                                onClick={() => onSelect(fav)}
                            >
                                {name}
                            </button>
                            <button
                                type="button"
                                className="chip__remove"
                                aria-label={t.removeNamed(name)}
                                onClick={() => onRemove(fav.key)}
                            >
                                <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                            </button>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
