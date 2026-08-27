import { useState } from "react";
import { api } from "../api/client";

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await api.login({
          username: formData.username,
          password: formData.password,
        });
        onSuccess(res.user);
      } else {
        const res = await api.register({
          username: formData.username,
          name: formData.name || formData.username,
          email: formData.email,
          password: formData.password,
        });
        onSuccess(res.user);
      }
      onClose();
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Log In
          </button>
          <button
            className={`modal-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        <h3 className="modal-title">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h3>
        <p className="modal-subtitle">
          {mode === "login"
            ? "Log in to customize your shopping cart & recovery testing."
            : "Sign up to track your personalized cart & AI recovery messages."}
        </p>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {mode === "register" && (
            <>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Syed"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="syed@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>{mode === "login" ? "Username or Email" : "Username"}</label>
            <input
              type="text"
              name="username"
              placeholder={mode === "login" ? "Username or email" : "e.g. syed123"}
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={4}
            />
          </div>

          <button type="submit" className="btn modal-submit-btn" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Log In"
              : "Create Account"}
          </button>
        </form>

        <div className="modal-footer">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                className="btn-switch-auth"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="btn-switch-auth"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
