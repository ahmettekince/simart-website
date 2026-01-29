export default function CircularLoading({ text = "Yükleniyor...", size = 40, color = "#3c81b5" }) {
    return (
        <div style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
            <div
                className="spinner-border"
                role="status"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderWidth: "3px",
                    borderColor: color,
                    borderRightColor: "transparent"
                }}
            >
                <span className="visually-hidden">{text}</span>
            </div>
            {text && (
                <div style={{ fontSize: "14px", color: "#666" }}>{text}</div>
            )}
        </div>
    );
}