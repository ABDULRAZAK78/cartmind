import { useEffect, useState } from "react";
import { api } from "../api/client";

const PRODUCT_IMAGES = {
  "Wireless Earbuds Pro": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80",
  "Earbuds Charging Case": "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=500&auto=format&fit=crop&q=80",
  "Laptop Backpack": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
  "Laptop Sleeve 14-inch": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80",
  "Mechanical Keyboard": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80",
  "Wrist Rest Pad": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80",
  "Running Shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
  "Moisture-wick Socks (3-pack)": "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&auto=format&fit=crop&q=80",
  "Smart Fitness Band": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=80",
  "Fitness Band Strap (Spare)": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80",
  "Yoga Mat": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80",
  "Yoga Blocks (Set of 2)": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&auto=format&fit=crop&q=80",
  "Stainless Steel Water Bottle": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80",
  "Bottle Cleaning Brush Set": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&auto=format&fit=crop&q=80",
  "Study Desk Lamp": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80",
  "Desk Organizer Tray": "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=500&auto=format&fit=crop&q=80",
  "Cotton Hoodie": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80",
  "Thermal Innerwear Set": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop&q=80",
  "Bluetooth Speaker": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80",
  "Speaker Carry Pouch": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80",
};

const CATEGORY_FALLBACK_IMAGES = {
  electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
  accessories: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
  fitness: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
  apparel: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
  home: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80",
};

const getProductImage = (product) => {
  if (PRODUCT_IMAGES[product.name]) return PRODUCT_IMAGES[product.name];
  if (CATEGORY_FALLBACK_IMAGES[product.category]) return CATEGORY_FALLBACK_IMAGES[product.category];
  return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80";
};

const DEFAULT_SESSION_ID = "demo_customer_1";

export default function Shop({ onAbandon, user }) {
  const sessionId = user ? `user_${user.username}` : DEFAULT_SESSION_ID;
  const customerName = user ? (user.name || user.username) : "Guest";

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingState, setAddingState] = useState({});
  const [toast, setToast] = useState("");

  const loadData = () => {
    let mounted = true;
    setLoading(true);
    setError("");
    Promise.all([api.getProducts(), api.getCart(sessionId)])
      .then(([p, c]) => {
        if (!mounted) return;
        setProducts(Array.isArray(p) ? p : []);
        setCart(c || null);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Shop load error:", err);
        setError(err.message || "Failed to load products");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    return loadData();
  }, [sessionId]);

  const refreshCart = async () => {
    try {
      const c = await api.getCart(sessionId);
      setCart(c);
    } catch {}
  };

  const handleAdd = async (product) => {
    setAddingState((prev) => ({ ...prev, [product.id]: "loading" }));
    try {
      const updated = await api.addItem(sessionId, product.id, 1, customerName);
      if (updated && updated.items) {
        setCart(updated);
      } else {
        await refreshCart();
      }
      setAddingState((prev) => ({ ...prev, [product.id]: "added" }));
      setToast(`🛒 Added "${product.name}" to cart!`);
      setTimeout(() => {
        setAddingState((prev) => ({ ...prev, [product.id]: null }));
      }, 1500);
      setTimeout(() => {
        setToast("");
      }, 2500);
    } catch (err) {
      alert("Could not add to cart: " + err.message);
      setAddingState((prev) => ({ ...prev, [product.id]: null }));
    }
  };

  const handleRemove = async (productId) => {
    try {
      const updated = await api.removeItem(sessionId, productId);
      if (updated && updated.items) {
        setCart(updated);
      } else {
        await refreshCart();
      }
    } catch {}
  };

  const handleAbandon = async () => {
    try {
      await api.abandonCart(sessionId, customerName);
      onAbandon?.();
    } catch (err) {
      alert("Error abandoning cart: " + err.message);
    }
  };

  const scrollToCart = () => {
    const el = document.getElementById("cart-panel");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (loading) return <p className="muted">Loading shop...</p>;

  const totalItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div>
      {toast && <div className="toast-box">{toast}</div>}

      {error && (
        <div className="modal-error" style={{ marginBottom: "20px" }}>
          {error} —{" "}
          <button
            className="btn-link"
            style={{ color: "#fff", textDecoration: "underline", cursor: "pointer" }}
            onClick={loadData}
          >
            Click to retry
          </button>
        </div>
      )}

      <div className="panel cart-panel" id="cart-panel">
        <h3>Your Cart ({user ? user.name : "Guest Demo"})</h3>
        {cart?.items?.length ? (
          <ul className="cart-list">
            {cart.items.map((item) => (
              <li key={item.id} className="cart-line">
                <span>
                  {item.product.name} × {item.quantity} — ₹{item.subtotal}
                </span>
                <button className="btn-link" onClick={() => handleRemove(item.product.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Cart is empty — add something below.</p>
        )}
        <p className="total">Total: ₹{cart?.baseline_total ?? 0}</p>
        {cart?.items?.length > 0 && (
          <button className="btn btn-warning" onClick={handleAbandon}>
            Simulate: Leave without paying (abandon cart)
          </button>
        )}
      </div>

      <div className="grid">
        {products.map((p) => {
          const state = addingState[p.id];
          return (
            <div className="product-card" key={p.id}>
              <img
                src={getProductImage(p)}
                alt={p.name}
                className="product-img"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80";
                }}
              />
              <h4>{p.name}</h4>
              <p className="muted small">{p.description}</p>
              <p className="price">₹{p.price}</p>
              <button
                className={`btn ${state === "added" ? "btn-added" : ""}`}
                disabled={state === "loading"}
                onClick={() => handleAdd(p)}
              >
                {state === "loading"
                  ? "Adding..."
                  : state === "added"
                  ? "✓ Added to Cart"
                  : "Add to Cart"}
              </button>
            </div>
          );
        })}
      </div>

      {totalItemCount > 0 && (
        <div className="floating-cart-bar">
          <div className="floating-cart-info">
            <span className="floating-cart-count">🛒 {totalItemCount} item{totalItemCount > 1 ? "s" : ""} in cart</span>
            <span className="floating-cart-total">Total: ₹{cart?.baseline_total ?? 0}</span>
          </div>
          <div className="floating-cart-actions">
            <button className="btn-floating-view" onClick={scrollToCart}>
              View Cart ↑
            </button>
            <button className="btn-floating-abandon" onClick={handleAbandon}>
              Abandon & Test AI →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_SESSION_ID as SESSION_ID };