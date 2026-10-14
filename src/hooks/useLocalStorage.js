import { useState, useEffect } from "react"

// Keeps a piece of state in localStorage. Falls back to plain state if storage is blocked.
export default function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw !== null ? JSON.parse(raw) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Storage unavailable (private mode, quota). The app keeps working without it.
        }
    }, [key, value]);

    return [value, setValue];
}
