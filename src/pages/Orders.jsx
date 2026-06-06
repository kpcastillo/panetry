import { Fragment, useEffect, useState } from "react";
import { ShoppingBag, Clock, CheckCircle2, Truck, ChevronDown, Printer } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import { useOrderStore } from "../store/OrderStore";
import { useNotificationStore } from "../store/notificationStore";
import { useProfileStore } from "../store/profileStore";
import { ORDER_STATUS_STYLE } from "../lib/statusColors";

const STATUSES = ["Pending", "Baking", "Ready", "Delivered"];
const TABS = ["All", ...STATUSES];

function fmt(val) {
  return `$${Number(val ?? 0).toFixed(2)}`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function itemsSummary(orderItems = []) {
  return orderItems.map(i => `${i.product_name} ×${i.quantity}`).join(", ") || "—";
}

// ── Print slip ────────────────────────────────────────────────────────────────

function printOrderSlip(order, bakeryName = "Panetry") {
  const win = window.open("", "_blank", "width=420,height=640");
  if (!win) { alert("Please allow pop-ups to print order slips."); return; }

  const rows = (order.order_items ?? [])
    .map(i => `
      <tr>
        <td>${i.product_name} ×${i.quantity}</td>
        <td style="text-align:right">$${(i.quantity * (i.unit_price ?? 0)).toFixed(2)}</td>
      </tr>`)
    .join("");

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Order #${order.id.slice(0, 8).toUpperCase()}</title>
  <style>
    *  { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', monospace;
      max-width: 340px; margin: 0 auto; padding: 28px 20px;
      color: #1a1208; font-size: 13px; line-height: 1.5;
    }
    .center  { text-align: center; }
    .name    { font-size: 22px; font-weight: 700; letter-spacing: 3px; }
    .sub     { font-size: 10px; color: #888; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px; }
    .dash    { border-top: 1px dashed #ccc; margin: 14px 0; }
    .row     { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .muted   { color: #888; }
    table    { width: 100%; border-collapse: collapse; }
    td       { padding: 3px 0; vertical-align: top; }
    td:last-child { text-align: right; white-space: nowrap; padding-left: 8px; }
    .total   { font-weight: 700; font-size: 15px; }
    .badge   { display: inline-block; border: 1px solid #999; padding: 1px 7px; border-radius: 3px; font-size: 11px; }
    .notes   { font-size: 12px; color: #555; font-style: italic; }
    .footer  { text-align: center; font-size: 11px; color: #aaa; margin-top: 22px; line-height: 1.8; }
    @media print { @page { margin: 8mm; } }
  </style>
</head>
<body>
  <div class="center">
    <div class="name">${bakeryName.toUpperCase()}</div>
    <div class="sub">Order Slip</div>
  </div>
  <div class="dash"></div>
  <div class="row"><span class="muted">Order #</span><span>${order.id.slice(0, 8).toUpperCase()}</span></div>
  <div class="row"><span class="muted">Date</span><span>${new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
  <div class="row"><span class="muted">Customer</span><span>${order.customer_name}</span></div>
  ${order.customer_email ? `<div class="row"><span class="muted">Email</span><span>${order.customer_email}</span></div>` : ""}
  <div class="row"><span class="muted">Status</span><span class="badge">${order.status}</span></div>
  <div class="dash"></div>
  <table>${rows}</table>
  <div class="dash"></div>
  <div class="row total"><span>TOTAL</span><span>${fmt(order.total)}</span></div>
  ${order.notes ? `<div class="dash"></div><div class="notes">Notes: ${order.notes}</div>` : ""}
  <div class="footer">
    <div>— Thank you! —</div>
    <div>We'll let you know when your order is ready 🥐</div>
  </div>
  <script>setTimeout(() => { window.print(); }, 200);</script>
</body>
</html>`);
  win.document.close();
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Orders() {
  const { orders, loading, error, fetch, updateStatus } = useOrderStore();
  const clearUnread  = useNotificationStore(s => s.clearUnread);
  const profile      = useProfileStore(s => s.profile);
  const [tab, setTab]           = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { clearUnread(); }, [clearUnread]);  // clear bell badge on arrival

  const count   = s => orders.filter(o => o.status === s).length;
  const visible = tab === "All" ? orders : orders.filter(o => o.status === tab);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Orders</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.length}      sub="All time"            icon={ShoppingBag}  accent="#B0C4B1" />
        <StatCard label="Pending"      value={count("Pending")}   sub="Awaiting production" icon={Clock}        accent="#F7E1D7" />
        <StatCard label="Ready"        value={count("Ready")}     sub="Ready for pickup"    icon={CheckCircle2} accent="#EDAFB8" />
        <StatCard label="Delivered"    value={count("Delivered")} sub="Completed today"     icon={Truck}        accent="#DEDBD2" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-dough px-4 gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setExpanded(null); }}
              className={`py-3 px-4 text-sm whitespace-nowrap border-b-2 transition-colors ${
                tab === t
                  ? "border-jam text-jam font-semibold"
                  : "border-transparent text-smoke hover:text-crust"
              }`}
            >
              {t}
              {t !== "All" && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t ? "bg-jam/10 text-jam" : "bg-dough text-smoke"
                }`}>
                  {count(t)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <p className="py-16 text-center text-smoke text-sm animate-pulse">Loading orders…</p>
        )}
        {error && (
          <p className="py-8 text-center text-jam text-sm">Error: {error}</p>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-smoke text-xs uppercase tracking-widest border-b border-dough bg-cream/50">
                  <th className="py-3 px-5 text-left">Order</th>
                  <th className="py-3 px-5 text-left">Customer</th>
                  <th className="py-3 px-5 text-left hidden md:table-cell">Items</th>
                  <th className="py-3 px-5 text-left hidden sm:table-cell">Date</th>
                  <th className="py-3 px-5 text-left">Status</th>
                  <th className="py-3 px-5 text-right">Total</th>
                  <th className="py-3 px-5"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(order => (
                  <Fragment key={order.id}>
                    <tr
                      className="border-b border-dough/60 hover:bg-cream/50 cursor-pointer transition-colors"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    >
                      <td className="py-3.5 px-5 font-mono text-xs text-smoke">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-crust">{order.customer_name}</td>
                      <td className="py-3.5 px-5 text-smoke max-w-xs truncate hidden md:table-cell">
                        {itemsSummary(order.order_items)}
                      </td>
                      <td className="py-3.5 px-5 text-smoke hidden sm:table-cell">{fmtDate(order.created_at)}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={ORDER_STATUS_STYLE[order.status]}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-semibold">{fmt(order.total)}</td>
                      <td className="py-3.5 px-5 text-right">
                        <ChevronDown
                          size={14}
                          className={`text-smoke transition-transform inline-block ${expanded === order.id ? "rotate-180" : ""}`}
                        />
                      </td>
                    </tr>

                    {expanded === order.id && (
                      <tr className="bg-cream/40 border-b border-dough/60">
                        <td colSpan={7} className="px-5 py-4">
                          <div className="flex flex-wrap items-start gap-6 text-sm">
                            <div>
                              <p className="text-xs text-smoke uppercase tracking-widest mb-1">Items</p>
                              {(order.order_items ?? []).length > 0
                                ? order.order_items.map(i => (
                                    <p key={i.id} className="text-crust">
                                      {i.product_name} ×{i.quantity}
                                      <span className="text-smoke ml-1">{fmt(i.unit_price)} ea.</span>
                                    </p>
                                  ))
                                : <p className="text-smoke">—</p>
                              }
                            </div>
                            <div>
                              <p className="text-xs text-smoke uppercase tracking-widest mb-1">Total</p>
                              <p className="text-crust font-semibold">{fmt(order.total)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-smoke uppercase tracking-widest mb-1">Email</p>
                              <p className="text-crust">{order.customer_email || "—"}</p>
                            </div>
                            {order.notes && (
                              <div>
                                <p className="text-xs text-smoke uppercase tracking-widest mb-1">Notes</p>
                                <p className="text-crust">{order.notes}</p>
                              </div>
                            )}

                            {/* Actions: status + print */}
                            <div className="flex flex-wrap items-end gap-6">
                              <div>
                                <p className="text-xs text-smoke uppercase tracking-widest mb-2">Update status</p>
                                <div className="flex flex-wrap gap-2">
                                  {STATUSES.map(s => (
                                    <button
                                      key={s}
                                      onClick={e => { e.stopPropagation(); updateStatus(order.id, s); }}
                                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                        order.status === s ? "" : "border-dough text-smoke hover:bg-cream"
                                      }`}
                                      style={order.status === s
                                        ? { ...ORDER_STATUS_STYLE[s], borderColor: "transparent" }
                                        : undefined}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Print button */}
                              <button
                                onClick={e => { e.stopPropagation(); printOrderSlip(order, profile?.bakery_name); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dough text-smoke text-xs font-medium hover:bg-cream transition-colors"
                              >
                                <Printer size={13} /> Print slip
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <p className="py-16 text-center text-smoke text-sm">No orders found.</p>
        )}
      </div>
    </div>
  );
}
