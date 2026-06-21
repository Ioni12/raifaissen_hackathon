import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    referralCode: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.email ||
      !formData.password ||
      (isRegister && !formData.name)
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        await register(
          formData.name,
          formData.email,
          formData.password,
          formData.referralCode,
        );
        navigate("/onboarding");
      } else {
        await login(formData.email, formData.password);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard} className="animate-fade-in">
        {/* Brand Header */}
        <div style={styles.brandHeader}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 20 L80 80 M80 20 L20 80"
                stroke="var(--accent)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M20 20 H40 V40"
                stroke="var(--accent)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M80 20 H60 V40"
                stroke="var(--accent)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 80 H40 V60"
                stroke="var(--accent)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M80 80 H60 V60"
                stroke="var(--accent)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 style={styles.brandText}>
            Raiffeisen{" "}
            <span style={{ color: "var(--accent)", fontWeight: 900 }}>
              YOUTH
            </span>
          </h2>
          <p style={styles.tagline}>
            {isRegister ? "Start your journey with us." : "Welcome back."}
          </p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <div className="input-group">
              <label className="input-label" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isRegister && (
            <div className="input-group">
              <label className="input-label" htmlFor="referralCode">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                id="referralCode"
                name="referralCode"
                className="input"
                placeholder="e.g., RY-JONI-ABCD"
                value={formData.referralCode}
                onChange={handleChange}
              />
              <span style={styles.inputHint}>
                If a friend invited you, enter their code for 5 bonus stars!
              </span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: "8px" }}
            disabled={loading}
          >
            {loading ? (
              <div
                className="spinner"
                style={{ width: "20px", height: "20px" }}
              />
            ) : isRegister ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={styles.toggleFooter}>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {isRegister
              ? "Already have an account?"
              : "Don't have an account yet?"}{" "}
          </span>
          <button
            type="button"
            style={styles.toggleBtn}
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? "Sign In" : "Get Started"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundImage:
      "radial-gradient(circle at center, rgba(255, 214, 0, 0.08) 0%, transparent 65%)",
  },
  glassCard: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-xl)",
    padding: "40px 32px",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "var(--shadow-lg)",
  },
  brandHeader: {
    textAlign: "center",
    marginBottom: "28px",
  },
  brandText: {
    fontSize: "1.8rem",
    marginTop: "8px",
    fontFamily: "var(--font-display)",
  },
  tagline: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    marginTop: "6px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  errorAlert: {
    background: "rgba(255, 77, 46, 0.1)",
    border: "1px solid rgba(255, 77, 46, 0.3)",
    color: "#FF6D55",
    borderRadius: "var(--radius-sm)",
    padding: "12px 16px",
    fontSize: "0.85rem",
    lineHeight: 1.4,
    marginBottom: "20px",
  },
  inputHint: {
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  toggleFooter: {
    textAlign: "center",
    marginTop: "24px",
    borderTop: "1px solid var(--border)",
    paddingTop: "20px",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "var(--accent)",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.88rem",
    cursor: "pointer",
    padding: 0,
    marginLeft: "4px",
    textDecoration: "underline",
  },
};
