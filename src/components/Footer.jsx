export default function Footer({ t }) {
    return (
        <footer className="footer">
            <p>
                {t.dataBy}{" "}
                <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>.{" "}
                {t.mapBy}{" "}
                <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>.
            </p>
        </footer>
    )
}
