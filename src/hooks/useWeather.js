import { useState, useRef, useCallback } from "react"
import { fetchForecast, fetchAirQuality } from "../lib/weather"

// Loads the forecast + air quality for a place. Keeps the previous data on screen while reloading.
export default function useWeather(unit) {
    const [state, setState] = useState({ status: "idle", forecast: null, air: null, error: null, updatedAt: 0 });
    const controllerRef = useRef(null);

    const load = useCallback(async (coords) => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        setState((s) => ({ ...s, status: "loading", error: null }));

        try {
            const [forecast, air] = await Promise.all([
                fetchForecast(coords, unit, controller.signal),
                fetchAirQuality(coords, controller.signal).catch((err) => {
                    if (err.name === "AbortError") throw err;
                    return null;
                }),
            ]);
            setState({ status: "ready", forecast, air, error: null, updatedAt: Date.now() });
        } catch (err) {
            if (err.name === "AbortError") return;
            setState((s) => ({ ...s, status: "error", error: err.code || "network" }));
        }
    }, [unit]);

    return { ...state, load };
}
