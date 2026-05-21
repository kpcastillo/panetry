import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Minus, X, ChevronRight, Leaf } from "lucide-react";
import { useProductsStore } from "../store/productsStore";
import { createOrder } from "../lib/queries";

const CATEGORIES = ["All", "Bread", "Pastry", "Drink", "Other"];

// ── Cart drawer ───────────────────────────────────────────────────────────────

function CartDrawer({ cart, onUpdate, onClose, name, email, onNameChange, onEmailChange, onSubmit, submitting }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative w-80 bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dough">
          <h2 className="font-display text-lg">Your Order</h2>
          <button onClick={onClose}><X size={18} className="text-smoke" /></button>
        </div>

        {/* Customer info */}
        <div className="px-5 py-4 border-b border-dough space-y-3">
          <div>
            <label className="label">Your name *</label>
            <input
              className="input" value={name} onChange={e => onNameChange(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div>
            <label className="label">Email (optional)</label>
            <input
              type="email" className="input" value={email} onChange={e => onEmailChange(e.target.value)}
              placeholder="for order confirmation"
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 && (
            <p className="text-sm text-smoke text-center mt-8">No items yet — add something!</p>
          )}
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-smoke">${item.price.toFixed(2)} ea.</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onUpdate(item.id, item.qty - 1)}
                  className="w-6 h-6 rounded-full bg-dough hover:bg-dough/70 flex items-center justify-center transition-colors">
                  <Minus size={11} />
                </button>
                <span className="text-sm w-5 text-center font-medium">{item.qty}</span>
                <button onClick={() => onUpdate(item.id, item.qty + 1)}
                  className="w-6 h-6 rounded-full bg-dough hover:bg-dough/70 flex items-center justify-center transition-colors">
                  <Plus size={11} />
                </button>
              </div>
              <p className="text-sm font-semibold w-14 text-right">${(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-dough space-y-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            onClick={onSubmit}
            disabled={submitting || cart.length === 0 || !name.trim()}
            className="w-full bg-jam text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-jam/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Placing order…" : "Place Order →"}
          </button>
          {!name.trim() && cart.length > 0 && (
            <p className="text-xs text-center text-smoke">Add your name above to continue</p>
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

function ProductCard({ product, qty, onAdd, onRemove }) {
  const soldOut = !product.available || product.stock === 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {product.image_url
        ? <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover" />
        : (
          <div className="w-full h-40 bg-dough/50 flex items-center justify-center">
            <span className="text-5xl select-none">
              {product.category === "Pastry" ? "🥐" : product.category === "Drink" ? "☕" : "🍞"}
            </span>
          </div>
        )
      }

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-sm leading-snug">{product.name}</h3>
          <span className="text-sm font-bold text-jam shrink-0">${Number(product.price).toFixed(2)}</span>
        </div>
        {product.description && (
          <p className="text-xs text-smoke leading-relaxed line-clamp-2 mb-3">{product.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            soldOut ? "bg-gray-100 text-gray-400" :
            product.stock <= 5 ? "bg-amber-100 text-amber-700" :
            "bg-emerald-100 text-emerald-700"
          }`}>
            {soldOut ? "Sold out" : product.stock <= 5 ? `Only ${product.stock} left` : "Available"}
          </span>

          {soldOut ? null : qty > 0 ? (
            <div className="flex items-center gap-2">
              <button onClick={() => onRemove(product.id)}
                className="w-7 h-7 rounded-full bg-dough hover:bg-dough/70 flex items-center justify-center transition-colors">
                <Minus size={12} />
              </button>
              <span className="text-sm font-semibold w-4 text-center">{qty}</span>
              <button onClick={() => onAdd(product)}
                className="w-7 h-7 rounded-full bg-crust text-white flex items-center justify-center hover:bg-crust/80 transition-colors">
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button onClick={() => onAdd(product)}
              className="flex items-center gap-1.5 bg-crust text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-crust/80 transition-colors">
              <Plus size={12} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Shop() {
  const { products, loading, fetch } = useProductsStore();
  const [category,   setCategory]   = useState("All");
  const [cart,       setCart]       = useState([]);
  const [cartOpen,   setCartOpen]   = useState(false);
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);

  useEffect(() => { fetch({ availableOnly: true }); }, [fetch]);

  const visible = category === "All" ? products : products.filter(p => p.category === category);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  function addToCart(product) {
    setCart(prev => {
      const hit = prev.find(i => i.id === product.id);
      return hit
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { id: product.id, name: product.name, price: Number(product.price), qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      return item.qty <= 1 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  }

  function updateQty(id, qty) {
    setCart(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty } : i));
  }

  async function placeOrder() {
    if (!name.trim() || cart.length === 0) return;
    setSubmitting(true);
    try {
      await createOrder({
        customerName:  name.trim(),
        customerEmail: email.trim() || null,
        items: cart.map(i => ({
          product_id:   i.id,
          product_name: i.name,
          quantity:     i.qty,
          unit_price:   i.price,
        })),
      });
      setCart([]);
      setCartOpen(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert(`Order failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-crust px-8 py-5 flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="flex items-center gap-2">
            <Leaf size={18} className="text-butter" />
            <h1 className="font-display text-xl text-dough">Panetry</h1>
          </div>
          <p className="text-xs text-dough/60 mt-0.5 ml-6">Fresh baked, every morning</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 text-dough px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <ShoppingCart size={16} />
          <span>Order</span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-jam text-white rounded-full text-xs flex items-center justify-center font-bold leading-none">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Success banner */}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-5 py-3 text-sm flex items-center gap-2">
            <ChevronRight size={16} />
            <span>Order placed! We'll start baking right away. 🥐</span>
          </div>
        )}

        {/* Hero */}
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl mb-2">Today's Menu</h2>
          <p className="text-smoke text-sm">Everything baked fresh each morning. Order by 8am for same-day pickup.</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c ? "bg-crust text-white" : "bg-white text-smoke hover:bg-dough"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading && <p className="py-12 text-center text-smoke text-sm animate-pulse">Loading menu…</p>}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {visible.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                qty={cart.find(i => i.id === p.id)?.qty ?? 0}
                onAdd={addToCart}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        )}
        {!loading && visible.length === 0 && (
          <p className="py-16 text-center text-smoke text-sm">Nothing available in this category right now.</p>
        )}

        {/* Floating order button on mobile */}
        {cartCount > 0 && !cartOpen && (
          <button
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-jam text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 hover:bg-jam/80 transition-colors"
          >
            <ShoppingCart size={16} />
            View order · {cartCount} item{cartCount !== 1 ? "s" : ""}
          </button>
        )}
      </main>

      {/* Cart drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onUpdate={updateQty}
          onClose={() => setCartOpen(false)}
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
          onSubmit={placeOrder}
          submitting={submitting}
        />
      )}
    </div>
  );
}
