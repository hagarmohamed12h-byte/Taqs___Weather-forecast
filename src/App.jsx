import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import Favorites from './components/Favorites'
import SkyPanel from './components/SkyPanel'
import TipsPanel from './components/TipsPanel'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import Metrics from './components/Metrics'
import MapPanel from './components/MapPanel'
import Footer from './components/Footer'
import useLocalStorage from './hooks/useLocalStorage'
import useWeather from './hooks/useWeather'
import { LANGS, messages, detectLang, makeFormat } from './lib/i18n'
import {
  DEFAULT_PLACES,
  conditionKey,
  skyTheme,
  placeKey,
  placeName,
  placeLabel,
  searchPlaces,
  isValidPlace,
} from './lib/weather'

const INITIAL_LANG = detectLang();

function Skeleton() {
  return (
    <div className="dashboard dashboard--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--sky" />
      <div className="skeleton skeleton--hourly" />
      <div className="skeleton skeleton--daily" />
    </div>
  )
}

export default function App() {
  const [lang, setLang] = useLocalStorage("taqs.lang", INITIAL_LANG);
  const [unit, setUnit] = useLocalStorage("taqs.unit", "C");
  const [savedPlace, setSavedPlace] = useLocalStorage("taqs.place", null);
  const [favorites, setFavorites] = useLocalStorage("taqs.favorites", []);
  const [selectedDay, setSelectedDay] = useState(0);
  const [searchError, setSearchError] = useState(null);
  const [locating, setLocating] = useState(false);

  const safeLang = messages[lang] ? lang : "en";
  const t = messages[safeLang];
  const fmt = makeFormat(safeLang);

  // Saved data may come from an older version, so fall back to the default city if it looks wrong.
  const place = isValidPlace(savedPlace) ? savedPlace : DEFAULT_PLACES[safeLang];
  const weather = useWeather(unit);
  const { load } = weather;
  const { latitude, longitude } = place;

  useEffect(() => {
    load({ latitude, longitude });
  }, [latitude, longitude, load]);

  useEffect(() => {
    document.documentElement.lang = safeLang;
    document.documentElement.dir = LANGS[safeLang].dir;
    document.title = t.docTitle;
  }, [safeLang, t.docTitle]);

  // When the language changes, re-fetch the saved city's name in the new language.
  useEffect(() => {
    if (!savedPlace || !savedPlace.id || savedPlace.lang === safeLang) return;
    const controller = new AbortController();
    searchPlaces(savedPlace.name, safeLang, 10, controller.signal)
      .then((results) => {
        const match = results.find((r) => r.id === savedPlace.id);
        if (match) setSavedPlace(match);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [safeLang, savedPlace, setSavedPlace]);

  function selectPlace(next) {
    setSearchError(null);
    setSelectedDay(0);
    setSavedPlace(next);
  }

  async function searchCity(query) {
    setSearchError(null);
    try {
      const results = await searchPlaces(query, safeLang, 1);
      if (results.length === 0) {
        setSearchError("cityNotFound");
        return;
      }
      selectPlace(results[0]);
    } catch {
      setSearchError("network");
    }
  }

  function locate() {
    if (!navigator.geolocation) {
      setSearchError("geoUnsupported");
      return;
    }
    setSearchError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        selectPlace({ isCurrent: true, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      (err) => {
        setLocating(false);
        setSearchError(err.code === 1 ? "geoDenied" : "geoFailed");
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }

  const activeKey = placeKey(place);
  const isFav = favorites.some((f) => f.key === activeKey);

  function toggleFavorite() {
    if (isFav) {
      setFavorites(favorites.filter((f) => f.key !== activeKey));
    } else {
      setFavorites([...favorites, { ...place, key: activeKey }]);
    }
  }

  const { status, forecast, air, error, updatedAt } = weather;
  const errorKey = searchError || (status === "error" ? error : null);
  const canRetry = !searchError && status === "error";
  const sky = forecast
    ? skyTheme(conditionKey(forecast.current.weather_code), forecast.current.is_day === 1)
    : "sun";
  const updatedLabel = updatedAt
    ? t.updatedAt(new Intl.DateTimeFormat(LANGS[safeLang].locale, { hour: "numeric", minute: "2-digit" }).format(updatedAt))
    : null;

  return (
    <div className="app" data-sky={sky}>
      <a className="skip-link" href="#main">{t.skip}</a>
      <div className="wrapper">
        <Header lang={safeLang} setLang={setLang} unit={unit} setUnit={setUnit} t={t} />
        <main id="main" className="main">
          <SearchBar
            lang={safeLang}
            t={t}
            locating={locating}
            onChoose={selectPlace}
            onSubmitQuery={searchCity}
            onLocate={locate}
          />
          <Favorites
            favorites={favorites}
            activeKey={activeKey}
            onSelect={selectPlace}
            onRemove={(key) => setFavorites(favorites.filter((f) => f.key !== key))}
            t={t}
          />

          {errorKey && (
            <div className="notice" role="alert">
              <p>{t.errors[errorKey] ?? t.errors.network}</p>
              {canRetry && (
                <button type="button" className="btn btn--ghost" onClick={() => load({ latitude, longitude })}>
                  {t.retry}
                </button>
              )}
            </div>
          )}

          {forecast ? (
            <>
              <div className="updated">
                <span>{updatedLabel}</span>
                <button
                  type="button"
                  className="updated__btn"
                  onClick={() => load({ latitude, longitude })}
                  disabled={status === "loading"}
                  aria-label={t.refresh}
                  title={t.refresh}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className={status === "loading" ? "spin" : undefined}>
                    <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className={`dashboard${status === "loading" ? " dashboard--busy" : ""}`} aria-busy={status === "loading"}>
                <div className="dashboard__sky">
                  <SkyPanel
                    name={placeLabel(place, t, safeLang)}
                    forecast={forecast}
                    isFav={isFav}
                    onToggleFav={toggleFavorite}
                    t={t}
                    fmt={fmt}
                  />
                </div>
                <div className="dashboard__tips"><TipsPanel forecast={forecast} air={air} t={t} fmt={fmt} /></div>
                <div className="dashboard__hourly">
                  <HourlyForecast forecast={forecast} day={selectedDay} t={t} fmt={fmt} />
                </div>
                <div className="dashboard__daily">
                  <DailyForecast forecast={forecast} selectedDay={selectedDay} onSelect={setSelectedDay} t={t} fmt={fmt} />
                </div>
                <div className="dashboard__metrics"><Metrics forecast={forecast} air={air} t={t} fmt={fmt} /></div>
                <div className="dashboard__map">
                  <MapPanel
                    name={placeName(place, t)}
                    latitude={latitude}
                    longitude={longitude}
                    forecast={forecast}
                    t={t}
                    fmt={fmt}
                  />
                </div>
              </div>
            </>
          ) : (
            status !== "error" && (
              <>
                <p className="visually-hidden" role="status">{t.loading}</p>
                <Skeleton />
              </>
            )
          )}
        </main>
        <Footer t={t} />
      </div>
    </div>
  )
}
