export default function AddAddressButton({ onClick, text = "Yeni adres", className = "" }) {
  return (
    <button
      className={`tf-btn btn-outline animate-hover-btn btn-address mb_20 new-address-btn ${className}`}
      onClick={onClick}
      type="button"
      style={{
        backgroundColor: "#fff",
        color: "#3c81b5",
        border: "1px solid #3c81b5",
        padding: "10px 20px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        marginBottom: "0",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: "1px solid #3c81b5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          lineHeight: "1",
          fontWeight: "bold",
        }}
      >
        +
      </span>
      <span>{text}</span>
    </button>
  );
}
