import { useEffect, useState } from "react";
import { api } from "../api/client";

const REASON_LABELS = {
  price_sensitivity: "Price sensitivity",
  indecision: "Indecision",
  distraction: "Distraction",
  unclear_value: "Unclear value",
};

export default function Dashboard() {
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [generating, setGenerating] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [carts, dash] = await Promise.all([api.getAbandonedCarts(), api.getDashboard()]);
    setAbandonedCarts(carts);
    setDashboard(dash);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Find the unrecovered decision made for the current abandoned session, if any.
  const decisionFor = (sessionId) =>
    dashboard?.decisions?.find((d) => d.session_id === sessionId && !d.recovered);

  const handleGenerate = async (sessionId) => {
    setGenerating((g) => ({ ...g, [sessionId]: true }));
    try {
      await api.generateRecovery(sessionId);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setGenerating((g) => ({ ...g, [sessionId]: false }));
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePay = async (sessionId, decision, cart) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Could not load Razorpay checkout. Check your internet connection.");
      return;
    }

    const order = await api.createOrder(sessionId, decision.discount_percent);

    const rzp = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.razorpay_order_id,
      name: "CartMind Demo Store",
      description: `Recovered order for ${cart.customer_name}`,
      handler: async (response) => {
        const verifyResult = await api.verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        if (verifyResult.verified) {
          await api.markRecovered(decision.id, order.amount_inr);
          await load();
        } else {
          alert("Payment signature verification failed.");
        }
      },
      theme: { color: "#2563eb" },
    });

    rzp.open();
  };

  if (loading) return <p className="muted">Loading dashboard...</p>;

  return (
    <div>
      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-value">₹{dashboard.metrics.total_recovered}</span>
          <span className="metric-label">Revenue Recovered by AI</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">{dashboard.metrics.carts_recovered}/{dashboard.metrics.carts_attempted}</span>
          <span className="metric-label">Carts Recovered</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">{dashboard.metrics.recovery_rate_percent}%</span>
          <span className="metric-label">Recovery Rate</span>
        </div>
        <div className="metric-card metric-risk">
          <span className="metric-value">
            ₹{(dashboard.metrics.total_abandoned_value - dashboard.metrics.total_recovered).toFixed(2)}
          </span>
          <span className="metric-label">Still At Risk (would be lost without AI)</span>
        </div>
      </div>

      <h3>Abandoned Carts</h3>
      {abandonedCarts.length === 0 && (
        <p className="muted">
          No abandoned carts yet — go to the Shop tab, add items, then hit "Leave without paying".
        </p>
      )}

      {abandonedCarts.map((cart) => {
        const decision = decisionFor(cart.session_id);
        return (
          <div className="panel recovery-card" key={cart.id}>
            <div className="recovery-header">
              <strong>{cart.customer_name}</strong> ({cart.session_id}) — ₹{cart.baseline_total}
              <span className={`badge badge-${cart.status}`}>{cart.status}</span>
            </div>
            <ul className="cart-list small">
              {cart.items.map((item) => (
                <li key={item.id}>{item.product.name} × {item.quantity}</li>
              ))}
            </ul>

            {!decision && (
              <button
                className="btn"
                disabled={generating[cart.session_id]}
                onClick={() => handleGenerate(cart.session_id)}
              >
                {generating[cart.session_id] ? "AI is thinking..." : "🤖 Generate AI Recovery Message"}
              </button>
            )}

            {decision && (
              <div className="ai-box">
                <p className="ai-reason">
                  Likely reason: <strong>{REASON_LABELS[decision.likely_reason] || decision.likely_reason}</strong>
                </p>
                <div className="email-mock">
                  <div className="email-mock-header">
                    <span>📧 To: {cart.customer_name.toLowerCase().replace(" ", ".")}@example.com</span>
                    <span className="email-mock-subject">Subject: Still thinking about it? We saved your cart 🛒</span>
                  </div>
                  <div className="email-mock-body">{decision.recovery_message}</div>
                  {decision.discount_percent > 0 && (
                    <div className="email-mock-cta">
                      Use code SAVE{decision.discount_percent} at checkout — {decision.discount_percent}% off
                    </div>
                  )}
                </div>
                {!decision.recovered ? (
                  <button className="btn btn-success" onClick={() => handlePay(cart.session_id, decision, cart)}>
                    Customer returns & pays (Razorpay test checkout)
                  </button>
                ) : (
                  <p className="recovered-tag">✅ Recovered ₹{decision.recovered_amount}</p>
                )}
                <details className="audit-details">
                  <summary>View raw AI reasoning (audit log)</summary>
                  <pre>{decision.raw_model_output}</pre>
                </details>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}