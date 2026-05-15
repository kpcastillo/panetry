import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, Clock, TrendingUp } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import RecentOrders from "../components/dashboard/RecentOrders";
import TopProducts from "../components/dashboard/TopProducts";
import RevenueChart from "../components/analitycs/RevenueChart";
import { fetchDashboardStats, fetchWeeklyRevenue } from "../lib/queries";
import { useOrderStore } from "../store/OrderStore";

export default function Dashboard() {
  const { orders, fetch } = useOrderStore();
  const [stats,  setStats]  = useState({ ordersToday: 0, inProduction: 0, revenue: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch();
    fetchDashboardStats().then(setStats).catch(console.error);
    fetchWeeklyRevenue().then(setChartData).catch(console.error);
  }, [fetch]);

  const bestseller = (() => {
    const counts = {};
    orders.forEach(o =>
      (o.order_items ?? []).forEach(i => {
        counts[i.product_name] = (counts[i.product_name] ?? 0) + i.quantity;
      })
    );
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  })();

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Good morning 🥐</h2>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Orders Today"  value={stats.ordersToday}                    sub="Today"              icon={ShoppingBag} accent="#e8c97e" />
        <StatCard label="Revenue"       value={`$${stats.revenue.toFixed(2)}`}        sub="Today's total"      icon={DollarSign}  accent="#c0392b" />
        <StatCard label="In Production" value={stats.inProduction}                   sub="Items baking now"   icon={Clock}       accent="#6b5e4e" />
        <StatCard label="Bestseller"    value={bestseller}                            sub="Most ordered item"  icon={TrendingUp}  accent="#1a1208" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <RevenueChart data={chartData} />
          <RecentOrders />
        </div>
        <TopProducts />
      </div>
    </div>
  );
}
