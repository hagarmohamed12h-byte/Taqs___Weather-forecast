export default function Segmented({ label, value, onChange, options }) {
    return (
        <div className="segmented" role="group" aria-label={label}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    className="segmented__btn"
                    aria-pressed={value === opt.value}
                    onClick={() => onChange(opt.value)}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    )
}
