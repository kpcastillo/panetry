import { useEffect, useRef, useState } from "react";
import {
  Save, CheckCircle2, Camera, MapPin, Phone,
  Mail, AtSign, Clock, User, BookOpen,
  Leaf, ShoppingCart, Store,
} from "lucide-react";
import { useProfileStore } from "../store/profileStore";
import { uploadBakeryImage } from "../lib/queries";

// ── Helpers ───────────────────────────────────────────────────────────────────

function FormCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-dough">
        <Icon size={15} className="text-smoke" />
        <h3 className="text-sm font-semibold text-crust uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

// ── Image uploader ────────────────────────────────────────────────────────────

function ImageUploader({ label, hint, value, type, onUploaded }) {
  const ref       = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");

  async function handle(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr("");
    try {
      const url = await uploadBakeryImage(file, type);
      onUploaded(url);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div
        onClick={() => ref.current?.click()}
        className="relative cursor-pointer rounded-xl overflow-hidden border border-dough hover:border-smoke transition-colors"
        style={{ height: type === "cover" ? 120 : 80 }}
      >
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-cream/60">
            <Camera size={18} className="text-smoke/50" />
            <span className="text-xs text-smoke/60">{busy ? "Uploading…" : hint}</span>
          </div>
        )}
        {value && (
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium flex items-center gap-1.5">
              <Camera size={14} /> Change photo
            </span>
          </div>
        )}
      </div>
      {err && <p className="text-xs text-jam mt-1">{err}</p>}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
    </div>
  );
}

// ── Storefront preview ────────────────────────────────────────────────────────

function StorefrontPreview({ draft }) {
  const name    = draft.bakery_name || "Your Bakery";
  const tagline = draft.tagline     || "Fresh baked, every morning";
  const story   = draft.story;
  const owner   = draft.owner_name;
  const hours   = draft.hours;
  const loc     = draft.location;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Preview label */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-dough">
        <Store size={13} className="text-smoke" />
        <span className="text-xs font-semibold text-smoke uppercase tracking-widest">Storefront preview</span>
      </div>

      {/* Simulated shop header */}
      <div className="bg-smoke px-5 py-4 flex items-center gap-3">
        {draft.logo_url ? (
          <img src={draft.logo_url} alt="logo" className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white/20" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Leaf size={16} className="text-dough/70" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-display text-base text-cream leading-tight truncate">{name}</p>
          <p className="text-xs text-dough/60 truncate">{tagline}</p>
        </div>
        <div className="ml-auto shrink-0 flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5">
          <ShoppingCart size={12} className="text-dough/70" />
          <span className="text-xs text-dough/70">Order</span>
        </div>
      </div>

      {/* Cover image strip */}
      {draft.cover_url && (
        <img src={draft.cover_url} alt="cover" className="w-full h-24 object-cover" />
      )}

      {/* Our Story snippet */}
      {story && (
        <div className="px-5 py-4 border-b border-dough/60">
          <p className="text-xs font-semibold text-smoke uppercase tracking-widest mb-2">Our Story</p>
          {owner && (
            <p className="text-xs font-medium text-crust mb-1">{owner}</p>
          )}
          <p className="text-xs text-smoke leading-relaxed line-clamp-4">{story}</p>
        </div>
      )}

      {/* Hours / location */}
      {(hours || loc) && (
        <div className="px-5 py-4 space-y-1.5">
          {loc && (
            <div className="flex items-center gap-2 text-xs text-smoke">
              <MapPin size={11} className="shrink-0" />{loc}
            </div>
          )}
          {hours && (
            <div className="flex items-center gap-2 text-xs text-smoke">
              <Clock size={11} className="shrink-0" />{hours}
            </div>
          )}
        </div>
      )}

      {!story && !hours && !loc && (
        <div className="px-5 py-6 text-center text-xs text-smoke/50">
          Fill in the form to see your storefront come to life
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const EMPTY = {
  bakery_name: "", tagline: "",
  story: "", owner_name: "", owner_bio: "",
  location: "", phone: "", email: "", instagram: "", hours: "",
  logo_url: "", cover_url: "",
};

export default function Profile() {
  const { profile, loading, saving, error, fetch, save } = useProfileStore();
  const [draft,  setDraft]  = useState(EMPTY);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => {
    if (profile) setDraft({ ...EMPTY, ...profile });
  }, [profile]);

  function set(key, val) {
    setDraft(d => ({ ...d, [key]: val }));
  }

  function bind(key) {
    return {
      value: draft[key] ?? "",
      onChange: e => set(key, e.target.value),
    };
  }

  async function handleSave() {
    try {
      await save(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // error shown from store
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-smoke text-sm animate-pulse">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl">Bakery Profile</h2>
          <p className="text-sm text-smoke mt-0.5">Customize how your bakery looks and reads on the storefront</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            saved
              ? "bg-crust/20 text-crust"
              : "bg-smoke text-white hover:bg-smoke/80"
          } disabled:opacity-50`}
        >
          {saved
            ? <><CheckCircle2 size={15} /> Saved!</>
            : <><Save size={15} /> {saving ? "Saving…" : "Save changes"}</>
          }
        </button>
      </div>

      {error && (
        <p className="text-sm text-jam bg-jam/10 rounded-xl px-4 py-3">Error: {error}</p>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ── Left: form ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Identity */}
          <FormCard title="Identity" icon={Store}>
            <Field label="Bakery name">
              <input className="input" placeholder="e.g. The Golden Crumb" {...bind("bakery_name")} />
            </Field>
            <Field label="Tagline">
              <input className="input" placeholder="e.g. Slow bakes, honest ingredients" {...bind("tagline")} />
            </Field>
          </FormCard>

          {/* The baker */}
          <FormCard title="The Baker" icon={User}>
            <Field label="Your name">
              <input className="input" placeholder="e.g. Maria Solis" {...bind("owner_name")} />
            </Field>
            <Field label="Short bio">
              <textarea
                rows={3}
                className="input resize-none"
                placeholder="A sentence or two about yourself — your background, what drives you to bake…"
                {...bind("owner_bio")}
              />
            </Field>
          </FormCard>

          {/* Story */}
          <FormCard title="Our Story" icon={BookOpen}>
            <Field label="Your story">
              <textarea
                rows={7}
                className="input resize-none leading-relaxed"
                placeholder="Tell customers who you are, how you got started, what makes your bread special. This appears in the 'Our Story' section of your storefront."
                {...bind("story")}
              />
              <p className="text-xs text-smoke/60 mt-1.5">
                {(draft.story || "").length} characters — aim for 100–400 for best readability
              </p>
            </Field>
          </FormCard>

          {/* Hours & Contact */}
          <FormCard title="Hours & Contact" icon={Clock}>
            <Field label="Opening hours">
              <input className="input" placeholder="e.g. Mon–Fri 7am–3pm · Sat 8am–1pm" {...bind("hours")} />
            </Field>
            <Field label="Location / address">
              <input className="input" placeholder="e.g. 412 Maple St, Provo UT" {...bind("location")} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke/50" />
                  <input className="input pl-8" placeholder="(801) 555-0100" {...bind("phone")} />
                </div>
              </Field>
              <Field label="Email">
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke/50" />
                  <input type="email" className="input pl-8" placeholder="hello@yourbakery.com" {...bind("email")} />
                </div>
              </Field>
            </div>
            <Field label="Instagram">
              <div className="relative">
                <AtSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke/50" />
                <input className="input pl-8" placeholder="@yourbakery" {...bind("instagram")} />
              </div>
            </Field>
          </FormCard>

          {/* Media */}
          <FormCard title="Photos" icon={Camera}>
            <div className="grid grid-cols-2 gap-4">
              <ImageUploader
                label="Logo"
                hint="Click to upload"
                type="logo"
                value={draft.logo_url}
                onUploaded={url => set("logo_url", url)}
              />
              <ImageUploader
                label="Cover image"
                hint="Best at 1200 × 400 px"
                type="cover"
                value={draft.cover_url}
                onUploaded={url => set("cover_url", url)}
              />
            </div>
            <p className="text-xs text-smoke/60">
              The logo appears in the storefront header. The cover image sits just below it.
            </p>
          </FormCard>

        </div>

        {/* ── Right: live preview ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 lg:sticky top-6">
          <StorefrontPreview draft={draft} />
        </div>

      </div>
    </div>
  );
}
