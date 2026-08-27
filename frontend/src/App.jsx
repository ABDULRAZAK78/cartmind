import { useState, useEffect, useRef } from "react";
import Shop from "./pages/Shop";
import Dashboard from "./pages/Dashboard";
import AuthModal from "./components/AuthModal";
import { api } from "./api/client";
import "./App.css";

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function App() {
  const [tab, setTab] = useState("shop");
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const revealRef = useReveal();

  useEffect(() => {
    api
      .getMe()
      .then((res) => {
        if (res?.user) setUser(res.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    setUser(null);
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">RecoverCart</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => setTab("shop")}>
            Shop
          </button>
          <button className="nav-link" onClick={() => setTab("dashboard")}>
            Dashboard
          </button>
          {user ? (
            <div className="user-badge">
              <span className="user-pill">👤 {user.name || user.username}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          ) : (
            <div className="user-badge">
              <button className="btn-auth-outline" onClick={() => openAuth("login")}>
                Log In
              </button>
              <button className="cta-small" onClick={() => openAuth("register")}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className="hero">
        <span className="hero-badge">Razorpay AI Builder Internship 2026 · Track 1</span>
        <h1 className="hero-title">
          Beyond <span className="accent">Checkout.</span>
        </h1>
        <p className="hero-subtitle">
          AI that notices when a customer walks away — and brings them back with the right message.
        </p>

        <nav className="tabs">
          <button className={tab === "shop" ? "tab active" : "tab"} onClick={() => setTab("shop")}>
            Shop (Customer View)
          </button>
          <button className={tab === "dashboard" ? "tab active" : "tab"} onClick={() => setTab("dashboard")}>
            Merchant Dashboard
          </button>
        </nav>
      </section>

      <div className="reveal" ref={revealRef}>
        <main>
          {tab === "shop" ? (
            <Shop user={user} onAbandon={() => setTab("dashboard")} />
          ) : (
            <Dashboard />
          )}
        </main>
      </div>

      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />
    </div>
  );
}