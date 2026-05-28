const theme = {
  container: {
    padding: "20px",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    color: "#000"
  },

  /* ✅ WHITE CARD (FIXED) */
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "15px",

    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    color: "#000"
  },

  /* BUTTON (keeps modern look) */
  button: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",

    background: "#1d4ed8",
    color: "white",
    marginRight: "10px",
    transition: "0.2s ease"
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",

    background: "#fff",
    color: "#000",

    marginBottom: "12px",
    width: "100%"
  },

  header: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#fff" /* keep header readable on dark bg */
  }
};

export default theme;