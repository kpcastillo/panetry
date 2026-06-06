import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Package, CheckCircle, XCircle, AlertTriangle, ImagePlus, Loader2 } from "lucide-react";
import { useProductsStore } from "../store/productsStore";
import { uploadProductImage } from "../lib/queries";
import StatCard from "../components/ui/StatCard";

const CATEGORIES = ["Bread", "Pastry", "Drink", "Other"];

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "Bread",
  image_url: "", available: true, stock: 0,
};

// ── Product form modal ────────────────────────────────────────────────────────

function ProductModal({ initial, onSave, onClose, saving }) {
  const [form,       setForm]      = useState(initial ?? EMPTY_FORM);
  const [uploading,  setUploading] = useState(false);
  const [preview,    setPreview]   = useState(initial?.image_url ?? "");
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      set("image_url", url);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
      setPreview(form.image_url); // revert preview
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dough">
          <h2 className="font-display text-lg">{initial ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose}><X size={18} className="text-smoke" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image upload */}
          <div>
            <label className="label">Photo</label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div
                className="w-20 h-20 rounded-xl bg-dough/50 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer border-2 border-dashed border-dough hover:border-smoke transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 size={20} className="text-smoke animate-spin" />
                ) : preview ? (
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={20} className="text-smoke/50" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                {/* File picker */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 border border-dough rounded-lg py-2 text-sm text-smoke hover:bg-cream transition-colors disabled:opacity-50"
                >
                  {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><ImagePlus size={14} /> Upload from computer</>}
                </button>
                {/* Manual URL fallback */}
                <input
                  type="url"
                  className="input text-xs"
                  value={form.image_url}
                  onChange={e => { set("image_url", e.target.value); setPreview(e.target.value); }}
                  placeholder="…or paste an image URL"
                />
              </div>
            </div>
          </div>

          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Name *</label>
              <input required className="input" value={form.name}
                onChange={e => set("name", e.target.value)} placeholder="Sourdough Loaf" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Short description shown on the storefront" />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price ($) *</label>
              <input required type="number" min="0" step="0.01" className="input"
                value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="label">Stock</label>
              <input type="number" min="0" className="input"
                value={form.stock} onChange={e => set("stock", e.target.value)} />
            </div>
          </div>

          {/* Available toggle */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set("available", !form.available)}
              className={`relative w-10 h-6 rounded-full transition-colors ${form.available ? "bg-jam" : "bg-dough"}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.available ? "left-5" : "left-1"}`} />
            </button>
            <span className="text-sm text-smoke">{form.available ? "Available on storefront" : "Hidden from storefront"}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-smoke hover:text-crust transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || uploading}
              className="px-5 py-2 bg-crust text-white text-sm font-medium rounded-xl hover:bg-crust/80 transition-colors disabled:opacity-50">
              {saving ? "Saving…" : initial ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onDelete, onToggle }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col transition-opacity ${product.available ? "" : "opacity-60"}`}>
      {product.image_url
        ? <img src={product.image_url} alt={product.name} className="w-full h-36 object-cover" />
        : <div className="w-full h-36 bg-dough/60 flex items-center justify-center text-5xl">🍞</div>
      }

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-display text-base leading-tight truncate">{product.name}</p>
            <p className="text-xs text-smoke mt-0.5">{product.category}</p>
          </div>
          <span className="text-sm font-semibold text-jam shrink-0">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>

        {product.description && (
          <p className="text-xs text-smoke line-clamp-2 leading-relaxed">{product.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1 border-t border-dough/50">
          {/* Stock badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            product.stock > 5 ? "bg-emerald-100 text-emerald-700" :
            product.stock > 0 ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-600"
          }`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>

          <div className="flex items-center gap-1">
            {/* Available toggle */}
            <button title={product.available ? "Hide from shop" : "Show in shop"}
              onClick={() => onToggle(product.id)}
              className="p-1.5 rounded-lg hover:bg-cream transition-colors">
              {product.available
                ? <CheckCircle size={15} className="text-emerald-600" />
                : <XCircle size={15} className="text-smoke/50" />}
            </button>

            {/* Edit */}
            <button title="Edit" onClick={() => onEdit(product)}
              className="p-1.5 rounded-lg hover:bg-cream transition-colors">
              <Pencil size={14} className="text-smoke" />
            </button>

            {/* Delete */}
            {confirming
              ? <div className="flex items-center gap-1 ml-1">
                  <span className="text-xs text-red-600">Delete?</span>
                  <button onClick={() => { onDelete(product.id); setConfirming(false); }}
                    className="text-xs text-red-600 font-semibold hover:underline">Yes</button>
                  <button onClick={() => setConfirming(false)}
                    className="text-xs text-smoke hover:underline">No</button>
                </div>
              : <button title="Delete" onClick={() => setConfirming(true)}
                  className="p-1.5 rounded-lg hover:bg-cream transition-colors">
                  <Trash2 size={14} className="text-smoke" />
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Products() {
  const { products, loading, error, fetch, create, update, delete: del, toggleAvailable } = useProductsStore();
  const [modal,   setModal]   = useState(null); // null | "new" | product object
  const [saving,  setSaving]  = useState(false);
  const [filter,  setFilter]  = useState("All");

  useEffect(() => { fetch(); }, [fetch]);

  const available   = products.filter(p => p.available).length;
  const outOfStock  = products.filter(p => p.stock === 0).length;
  const lowStock    = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  const visible = filter === "All" ? products : products.filter(p => p.category === filter);

  async function handleSave(fields) {
    setSaving(true);
    try {
      if (modal === "new") await create(fields);
      else                 await update(modal.id, fields);
      setModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Products</h2>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-crust text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-crust/80 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={products.length}  sub="In catalog"       icon={Package}       accent="#B0C4B1" />
        <StatCard label="Available"      value={available}        sub="On storefront"    icon={CheckCircle}   accent="#B0C4B1" />
        <StatCard label="Low Stock"      value={lowStock}         sub="5 or fewer left"  icon={AlertTriangle} accent="#EDAFB8" />
        <StatCard label="Out of Stock"   value={outOfStock}       sub="Needs restocking" icon={XCircle}       accent="#4A5759" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["All", ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === c ? "bg-crust text-white" : "bg-white text-smoke hover:bg-dough"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && <p className="py-12 text-center text-smoke text-sm animate-pulse">Loading products…</p>}
      {error   && <p className="py-8 text-center text-jam text-sm">Error: {error}</p>}

      {/* Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {visible.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={setModal}
                onDelete={del}
                onToggle={toggleAvailable}
              />
            ))}
          </div>
          {visible.length === 0 && (
            <p className="py-16 text-center text-smoke text-sm">No products found.</p>
          )}
        </>
      )}

      {/* Modal */}
      {modal && (
        <ProductModal
          initial={modal === "new" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
