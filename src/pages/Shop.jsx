import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Minus, X, ChevronRight } from "lucide-react";
import { useProductsStore } from "../store/productsStore";
import { createOrder } from "../lib/queries";

const CATEGORIES = ["All", "Bread", "Pastry"];

function CartDrawer({ cart, onUpdate, onClose, onSubmit, submitting }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="relative w-80 bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dough">
          <h2 className="font-display text-lg">Your Cart</h2>
          <button onClick={onClose}><X size={18} className="text-smoke" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 && (
            <p className="text-sm text-smoke text-center mt-8">Your cart is empty.</p>
          )}
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-crust">{item.name}</p>
                <p className="text-xs text-smoke">${item.price.toFixed(2)} ea.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdate(item.id, item.qty - 1)}
                  className="w-6 h-6 rounded-full bg-dough flex items-center justify-center"
                >
                  <Minus size={12} />
                </button>
                <span className="text-sm w-4 text-center">{item.qty}</span>
                <button
                  onClick={() => onUpdate(item.id, item.qty + 1)}
                  className="w-6 h-6 rounded-full bg-dough flex items-center justify-center"
                >
                  <Plus size={12} />
                </button>
              </div>
              <p className="text-sm font-semibold w-14 text-right">
                ${(item.price * item.qty).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-dough space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full bg-jam text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-jam/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Placing order…" : "Place Order"}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {product.image_url
        ? <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover" />
        : <div className="w-full h-40 bg-dough flex items-center justify-center text-4xl">🍞</div>
      }
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-display text-base leading-tight">{product.name}</h3>
          <span className="text-sm font-semibold text-jam ml-2 shrink-0">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>
        {product.description && (
          <p className="text-xs text-smoke mb-3 leading-relaxed">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
            {product.stock > 0 ? `${product.stock} left` : "Sold out"}
          </span>
          <button
            onClick={() => onAdd(product)}
            disabled={!product.available || product.stock === 0}
            className="flex items-center gap-1.5 bg-crust text-dough text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-crust/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const { products, loading, fetch } = useProductsStore();
  const [category,  setCategory]  = useState("All");
  const [cart,      setCart]      = useState([]);
  const [cartOpen,  setCartOpen]  = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]   = useState(false);

  useEffect(() => { fetch({ availableOnly: true }); }, [fetch]);

  const visible = category === "All"
    ? products
    : products.filter(p => p.category === category);

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      return existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { id: product.id, name: product.name, price: Number(product.price), qty: 1 }];
    });
  }

  function updateQty(id, qty) {
    setCart(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty } : i));
  }

  async function placeOrder() {
    if (!orderForm.name || cart.length === 0) return;
    setSubmitting(true);
    try {
      await createOrder({
        customerName:  orderForm.name,
        customerEmail: orderForm.email,
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
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      alert(`Order failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Store header */}
      <header className="bg-crust text-dough px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-smoke">Panetry</h1>
          <p className="text-xs text-dough/60 mt-0.5">Fresh baked, every morning</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 bg-butter/20 hover:bg-butter/30 text-smoke px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <ShoppingCart size={16} />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-jam text-white rounded-full text-xs flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-5 py-3 text-sm flex items-center gap-2">
            <ChevronRight size={16} /> Order placed! We'll start baking right away.
          </div>
        )}

        {/* Order form */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-8 flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs text-smoke uppercase tracking-widest block mb-1">Your name *</label>
            <input
              type="text"
              value={orderForm.name}
              onChange={e => setOrderForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Jane Doe"
              className="w-full border border-dough rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-smoke"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-smoke uppercase tracking-widest block mb-1">Email (optional)</label>
            <input
              type="email"
              value={orderForm.email}
              onChange={e => setOrderForm(p => ({ ...p, email: e.target.value }))}
              placeholder="for order updates"
              className="w-full border border-dough rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-smoke"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c ? "bg-crust text-dough" : "bg-white text-smoke hover:bg-dough"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {loading && <p className="text-sm text-smoke animate-pulse">Loading products…</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {visible.map(p => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))}
        </div>
        {!loading && visible.length === 0 && (
          <p className="text-sm text-smoke text-center py-12">No products available.</p>
        )}
      </main>

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onUpdate={updateQty}
          onClose={() => setCartOpen(false)}
          onSubmit={placeOrder}
          submitting={submitting}
        />
      )}
    </div>
  );
}
