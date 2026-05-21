import { useEffect, useRef, useState } from "react";
import { Archive, AlertTriangle, XCircle, CheckCircle2, Plus, Minus, RotateCcw } from "lucide-react";
import { useProductsStore } from "../store/productsStore";
import StatCard from "../components/ui/StatCard";
import { STOCK_STATUS_STYLE } from "../lib/statusColors";

// ── Stock status helpers ──────────────────────────────────────────────────────

function stockStatus(stock) {
  if (stock === 0)  return "out";
  if (stock <= 5)   return "low";
  return "ok";
}


// ── Inline stock editor ───────────────────────────────────────────────────────

function StockCell({ product, onSet, onAdjust }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(String(product.stock));
  const inputRef = useRef(null);

  function startEdit() {
    setDraft(String(product.stock));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commit() {
    const val = parseInt(draft, 10);
    if (!isNaN(val) && val !== product.stock) onSet(product.id, val);
    setEditing(false);
  }

  function handleKey(e) {
    if (e.key === "Enter")  commit();
    if (e.key === "Escape") setEditing(false);
  }

  return (
    <div className="flex items-center gap-2">
      {/* Decrement */}
      <button
        onClick={() => onAdjust(product.id, -1)}
        disabled={product.stock === 0}
        className="w-6 h-6 rounded-full bg-dough hover:bg-dough/70 flex items-center justify-center transition-colors disabled:opacity-30"
      >
        <Minus size={11} />
      </button>

      {/* Editable number */}
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          className="w-14 text-center border border-smoke rounded-lg py-0.5 text-sm font-semibold outline-none"
        />
      ) : (
        <button
          onClick={startEdit}
          title="Click to edit"
          className="w-14 text-center text-sm font-semibold hover:bg-cream rounded-lg py-0.5 transition-colors"
        >
          {product.stock}
        </button>
      )}

      {/* Increment */}
      <button
        onClick={() => onAdjust(product.id, +1)}
        className="w-6 h-6 rounded-full bg-dough hover:bg-dough/70 flex items-center justify-center transition-colors"
      >
        <Plus size={11} />
      </button>
    </div>
  );
}

// ── Restock modal ─────────────────────────────────────────────────────────────

function RestockModal({ products, onSave, onClose }) {
  const [amounts, setAmounts] = useState(
    Object.fromEntries(products.map(p => [p.id, ""]))
  );

  function handleSave() {
    const updates = products
      .filter(p => amounts[p.id] !== "" && !isNaN(parseInt(amounts[p.id], 10)))
      .map(p => ({ id: p.id, stock: p.stock + parseInt(amounts[p.id], 10) }));
    onSave(updates);
  }

  const toRestock = products.filter(p => stockStatus(p.stock) !== "ok");
  const shown = toRestock.length > 0 ? toRestock : products;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dough">
          <div>
            <h2 className="font-display text-lg">Restock</h2>
            <p className="text-xs text-smoke mt-0.5">Enter how many units to add</p>
          </div>
          <button onClick={onClose} className="text-smoke hover:text-crust text-xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          {shown.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-smoke">{p.stock} currently in stock</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-smoke">+</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={amounts[p.id]}
                  onChange={e => setAmounts(a => ({ ...a, [p.id]: e.target.value }))}
                  className="w-20 text-center border border-dough rounded-lg py-1.5 text-sm outline-none focus:border-smoke"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3 pt-2 border-t border-dough">
          <button onClick={onClose} className="px-4 py-2 text-sm text-smoke hover:text-crust">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-crust text-white text-sm font-medium rounded-xl hover:bg-crust/80 transition-colors"
          >
            Apply Restock
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const FILTERS = ["All", "In Stock", "Low Stock", "Out of Stock"];

export default function Inventory() {
  const { products, loading, error, fetch, setStock, adjustStock } = useProductsStore();
  const [filter,  setFilter]  = useState("All");
  const [restock, setRestock] = useState(false);
  const [sort,    setSort]    = useState("name"); // "name" | "stock-asc" | "stock-desc"

  useEffect(() => { fetch(); }, [fetch]);

  // Stats
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock   = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const inStock    = products.filter(p => p.stock > 5).length;
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);

  // Filter
  const filtered = products.filter(p => {
    if (filter === "Out of Stock") return p.stock === 0;
    if (filter === "Low Stock")    return p.stock > 0 && p.stock <= 5;
    if (filter === "In Stock")     return p.stock > 5;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "stock-asc")  return a.stock - b.stock;
    if (sort === "stock-desc") return b.stock - a.stock;
    return a.name.localeCompare(b.name);
  });

  async function handleRestock(updates) {
    await Promise.all(updates.map(u => setStock(u.id, u.stock)));
    setRestock(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Inventory</h2>
        <button
          onClick={() => setRestock(true)}
          className="flex items-center gap-2 bg-crust text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-crust/80 transition-colors"
        >
          <RotateCcw size={15} /> Restock
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total SKUs"   value={products.length} sub="Products tracked"   icon={Archive}       accent="#B0C4B1" />
        <StatCard label="In Stock"     value={inStock}         sub="More than 5 units"  icon={CheckCircle2}  accent="#B0C4B1" />
        <StatCard label="Low Stock"    value={lowStock}        sub="5 or fewer left"    icon={AlertTriangle} accent="#EDAFB8" />
        <StatCard label="Out of Stock" value={outOfStock}      sub="Needs restocking"   icon={XCircle}       accent="#4A5759" />
      </div>

      {/* Alerts */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle size={15} />
            <span>
              {outOfStock > 0 && <strong>{outOfStock} item{outOfStock > 1 ? "s" : ""} out of stock</strong>}
              {outOfStock > 0 && lowStock > 0 && " · "}
              {lowStock > 0 && <span>{lowStock} item{lowStock > 1 ? "s" : ""} running low</span>}
            </span>
          </div>
          <button
            onClick={() => setRestock(true)}
            className="text-xs font-semibold text-amber-800 underline hover:no-underline"
          >
            Restock now
          </button>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-dough gap-4 flex-wrap">
          {/* Filter tabs */}
          <div className="flex gap-1">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f ? "bg-crust text-white" : "text-smoke hover:bg-cream"
                }`}
              >
                {f}
                <span className="ml-1.5 opacity-60">
                  {f === "All"          ? products.length  :
                   f === "In Stock"     ? inStock          :
                   f === "Low Stock"    ? lowStock         : outOfStock}
                </span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-xs border border-dough rounded-lg px-2 py-1.5 text-smoke outline-none"
          >
            <option value="name">Sort: Name</option>
            <option value="stock-asc">Sort: Stock ↑</option>
            <option value="stock-desc">Sort: Stock ↓</option>
          </select>
        </div>

        {/* States */}
        {loading && <p className="py-16 text-center text-smoke text-sm animate-pulse">Loading inventory…</p>}
        {error   && <p className="py-8  text-center text-jam  text-sm">Error: {error}</p>}

        {/* Table */}
        {!loading && !error && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-smoke text-xs uppercase tracking-widest border-b border-dough bg-cream/50">
                <th className="py-3 px-5 text-left">Product</th>
                <th className="py-3 px-5 text-left">Category</th>
                <th className="py-3 px-5 text-left">Status</th>
                <th className="py-3 px-5 text-left">Stock</th>
                <th className="py-3 px-5 text-left">
                  <span className="text-[10px] normal-case font-normal text-smoke/60">
                    Click number to type · +/- to adjust
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(product => {
                const status = stockStatus(product.stock);
                const meta   = STOCK_STATUS_STYLE[status];
                return (
                  <tr
                    key={product.id}
                    className="border-b border-dough/50 hover:bg-cream/40 transition-colors"
                  >
                    {/* Product */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-dough/60 flex items-center justify-center text-lg shrink-0">
                            {product.category === "Pastry" ? "🥐" : product.category === "Drink" ? "☕" : "🍞"}
                          </div>
                        )}
                        <span className="font-medium text-crust">{product.name}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-5 text-smoke">{product.category}</td>

                    {/* Status */}
                    <td className="py-3 px-5">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: meta.backgroundColor, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </td>

                    {/* Stock editor */}
                    <td className="py-3 px-5">
                      <StockCell
                        product={product}
                        onSet={setStock}
                        onAdjust={adjustStock}
                      />
                    </td>

                    {/* Total value */}
                    <td className="py-3 px-5 text-smoke text-xs">
                      {product.stock > 0
                        ? `$${(product.stock * Number(product.price)).toFixed(2)} value`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer totals */}
            {sorted.length > 0 && (
              <tfoot>
                <tr className="border-t border-dough bg-cream/30">
                  <td colSpan={3} className="py-3 px-5 text-xs text-smoke font-medium">
                    {sorted.length} product{sorted.length !== 1 ? "s" : ""}
                  </td>
                  <td className="py-3 px-5 text-sm font-semibold text-crust">
                    {sorted.reduce((s, p) => s + p.stock, 0)} units
                  </td>
                  <td className="py-3 px-5 text-xs text-smoke font-medium">
                    ${sorted.reduce((s, p) => s + p.stock * Number(p.price), 0).toFixed(2)} total value
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        )}

        {!loading && !error && sorted.length === 0 && (
          <p className="py-16 text-center text-smoke text-sm">No products match this filter.</p>
        )}
      </div>

      {/* Restock modal */}
      {restock && (
        <RestockModal
          products={products}
          onSave={handleRestock}
          onClose={() => setRestock(false)}
        />
      )}
    </div>
  );
}
