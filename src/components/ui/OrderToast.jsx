import { X, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../../store/notificationStore";

const TOAST_TTL = 6000;

// ── Single toast card ─────────────────────────────────────────────────────────
function OrderToast({ id, order }) {
  const { dismiss, clearUnread } = useNotificationStore();
  const navigate = useNavigate();

  function viewOrders() {
    navigate("/orders");
    clearUnread();
    dismiss(id);
  }

  const total    = `$${Number(order.total ?? 0).toFixed(2)}`;
  const customer = order.customer_name ?? "New customer";

  return (
    <div className="toast-card relative bg-white rounded-2xl shadow-xl border border-dough w-72 overflow-hidden">
      {/* Body */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        {/* Icon */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#EDAFB820" }}>
          <ShoppingBag size={14} style={{ color: "#EDAFB8" }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-crust leading-tight">New order 🥐</p>
          <p className="text-xs text-smoke truncate mt-0.5">{customer}</p>
          <p className="text-sm font-bold mt-1" style={{ color: "#4A5759" }}>{total}</p>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => dismiss(id)}
          className="text-smoke/40 hover:text-smoke transition-colors mt-0.5 shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* View link */}
      <button
        onClick={viewOrders}
        className="w-full text-left px-4 pb-3 text-xs font-medium hover:underline"
        style={{ color: "#B0C4B1" }}
      >
        View order →
      </button>

      {/* Progress bar — depletes over TOAST_TTL */}
      <div className="h-0.5 w-full" style={{ backgroundColor: "#EDAFB830" }}>
        <div
          className="h-full"
          style={{
            backgroundColor: "#EDAFB8",
            animation: `toast-progress ${TOAST_TTL}ms linear forwards`,
            transformOrigin: "left",
          }}
        />
      </div>
    </div>
  );
}

// ── Container — rendered once in Layout ──────────────────────────────────────
export default function ToastContainer() {
  const toasts = useNotificationStore(s => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3 items-end">
      {toasts.map(({ id, order }) => (
        <OrderToast key={id} id={id} order={order} />
      ))}
    </div>
  );
}
