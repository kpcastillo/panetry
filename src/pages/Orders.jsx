import { Fragment, useEffect, useState } from "react";
import { ShoppingBag, Clock, CheckCircle2, Truck, ChevronDown } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import { useOrderStore } from "../store/OrderStore";

const STATUS = {
  Pending:   { bg: "bg-amber-100",   text: "text-amber-800"   },
  Baking:    { bg: "bg-blue-100",    text: "text-blue-800"    },
  Ready:     { bg: "bg-emerald-100", text: "text-emerald-700" },
  Delivered: { bg: "bg-gray-100",    text: "text-gray-500"    },
};

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

export default function Orders() {
  const { orders, loading, error, fetch, updateStatus } = useOrderStore();
  const [tab, setTab]           = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetch(); }, [fetch]);

  const count  = s => orders.filter(o => o.status === s).length;
  const visible = tab === "All" ? orders : orders.filter(o => o.status === tab);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Orders</h2>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.length}        sub="All time"            icon={ShoppingBag}  accent="#e8c97e" />
        <StatCard label="Pending"      value={count("Pending")}     sub="Awaiting production" icon={Clock}        accent="#e8c97e" />
        <StatCard label="Ready"        value={count("Ready")}       sub="Ready for pickup"    icon={CheckCircle2} accent="#1a1208" />
        <StatCard label="Delivered"    value={count("Delivered")}   sub="Completed today"     icon={Truck}        accent="#c0392b" />
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
          <table className="w-full text-sm">
            <thead>
              <tr className="text-smoke text-xs uppercase tracking-widest border-b border-dough bg-cream/50">
                <th className="py-3 px-5 text-left">Order</th>
                <th className="py-3 px-5 text-left">Customer</th>
                <th className="py-3 px-5 text-left">Items</th>
                <th className="py-3 px-5 text-left">Date</th>
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
                    <td className="py-3.5 px-5 text-smoke max-w-xs truncate">
                      {itemsSummary(order.order_items)}
                    </td>
                    <td className="py-3.5 px-5 text-smoke">{fmtDate(order.created_at)}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS[order.status]?.bg} ${STATUS[order.status]?.text}`}>
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
                        <div className="flex flex-wrap items-start gap-8 text-sm">
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
                          <div className="ml-auto">
                            <p className="text-xs text-smoke uppercase tracking-widest mb-2">Update status</p>
                            <div className="flex flex-wrap gap-2">
                              {STATUSES.map(s => (
                                <button
                                  key={s}
                                  onClick={e => { e.stopPropagation(); updateStatus(order.id, s); }}
                                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    order.status === s
                                      ? `${STATUS[s].bg} ${STATUS[s].text} border-transparent`
                                      : "border-dough text-smoke hover:bg-cream"
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && visible.length === 0 && (
          <p className="py-16 text-center text-smoke text-sm">No orders found.</p>
        )}
      </div>
    </div>
  );
}
