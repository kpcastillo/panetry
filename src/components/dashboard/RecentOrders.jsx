import { useOrderStore } from "../../store/OrderStore";

const STATUS_COLOR = {
  Ready:     "bg-green-100 text-green-700",
  Baking:    "bg-yellow-100 text-yellow-700",
  Pending:   "bg-gray-100 text-gray-500",
  Delivered: "bg-gray-100 text-gray-400",
};

export default function RecentOrders() {
  const { orders, loading } = useOrderStore();
  const recent = orders.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-display text-lg mb-4">Recent Orders</h3>

      {loading && <p className="text-sm text-smoke animate-pulse">Loading…</p>}

      {!loading && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-smoke text-xs uppercase tracking-widest border-b">
              <th className="pb-2 text-left">Customer</th>
              <th className="pb-2 text-left">Items</th>
              <th className="pb-2 text-left">Status</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(o => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{o.customer_name}</td>
                <td className="py-3 text-smoke text-xs max-w-[180px] truncate">
                  {(o.order_items ?? []).map(i => `${i.product_name} ×${i.quantity}`).join(", ") || "—"}
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[o.status] ?? ""}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3 text-right font-medium">
                  ${Number(o.total ?? 0).toFixed(2)}
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={4} className="py-8 text-center text-smoke text-sm">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
