import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, CalendarDays } from "lucide-react";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import StatCard from "../components/ui/StatCard";
import {
  fetchAnalyticsSummary,
  fetchMonthlyRevenue,
  fetchTopProductsSales,
  fetchOrdersByStatus,
} from "../lib/queries";

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  cherry:  "#EDAFB8",
  ash:     "#B0C4B1",
  powder:  "#F7E1D7",
  dust:    "#DEDBD2",
  iron:    "#4A5759",
  dough:   "#f5ead7",
};

const STATUS_COLOR = {
  Pending:   P.powder,
  Baking:    P.cherry,
  Ready:     P.ash,
  Delivered: P.dust,
};

// ── Shared tooltip style ──────────────────────────────────────────────────────
const tooltipStyle = {
  contentStyle: {
    borderRadius: "12px",
    border: `1px solid ${P.dough}`,
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  cursor: { fill: `${P.ash}22` },
};

// ── Donut centre overlay (positioned absolutely over the chart) ───────────────
function DonutCenter({ total }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="font-display text-2xl font-bold" style={{ color: P.iron }}>{total}</span>
      <span className="text-xs mt-0.5" style={{ color: P.iron, opacity: 0.55 }}>total orders</span>
    </div>
  );
}

// ── Custom bar label for top products ─────────────────────────────────────────
function TopProductsLabel({ x, y, width, value }) {
  if (!value) return null;
  return (
    <text x={x + width + 6} y={y + 11} fill={P.iron} fontSize={11} dominantBaseline="middle">
      {value}
    </text>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 className="font-display text-lg mb-4">{children}</h3>;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [summary,    setSummary]    = useState(null);
  const [monthly,    setMonthly]    = useState([]);
  const [topProds,   setTopProds]   = useState([]);
  const [byStatus,   setByStatus]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [rangeTab,   setRangeTab]   = useState("30d"); // "7d" | "30d"

  useEffect(() => {
    Promise.all([
      fetchAnalyticsSummary(),
      fetchMonthlyRevenue(),
      fetchTopProductsSales(),
      fetchOrdersByStatus(),
    ])
      .then(([s, m, p, st]) => {
        setSummary(s);
        setMonthly(m);
        setTopProds(p);
        setByStatus(st);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Slice monthly data based on tab
  const chartData = rangeTab === "7d" ? monthly.slice(-7) : monthly;
  const totalOrders = byStatus.reduce((s, r) => s + r.count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-smoke text-sm animate-pulse">Loading analytics…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Analytics</h2>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${(summary?.totalRevenue ?? 0).toFixed(2)}`}
          sub="All time"
          icon={DollarSign}
          accent={P.ash}
        />
        <StatCard
          label="Total Orders"
          value={summary?.totalOrders ?? 0}
          sub="All time"
          icon={ShoppingBag}
          accent={P.cherry}
        />
        <StatCard
          label="Avg Order Value"
          value={`$${(summary?.avgOrderValue ?? 0).toFixed(2)}`}
          sub="Per order"
          icon={TrendingUp}
          accent={P.powder}
        />
        <StatCard
          label="This Month"
          value={summary?.monthOrders ?? 0}
          sub="Orders placed"
          icon={CalendarDays}
          accent={P.dust}
        />
      </div>

      {/* ── 30-day trend ────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Revenue &amp; Orders Trend</SectionTitle>
          <div className="flex gap-1">
            {["7d", "30d"].map(t => (
              <button
                key={t}
                onClick={() => setRangeTab(t)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  rangeTab === t ? "bg-smoke text-white" : "text-smoke hover:bg-dough"
                }`}
              >
                {t === "7d" ? "7 days" : "30 days"}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={P.ash}    stopOpacity={0.4} />
                <stop offset="95%" stopColor={P.ash}    stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={P.cherry} stopOpacity={0.35} />
                <stop offset="95%" stopColor={P.cherry} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={P.dough} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: P.iron }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              yAxisId="rev"
              orientation="left"
              tick={{ fontSize: 11, fill: P.iron }}
              tickFormatter={v => `$${v}`}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <YAxis
              yAxisId="ord"
              orientation="right"
              tick={{ fontSize: 11, fill: P.iron }}
              axisLine={false}
              tickLine={false}
              width={30}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(v, name) =>
                name === "revenue" ? [`$${Number(v).toFixed(2)}`, "Revenue"] : [v, "Orders"]
              }
              {...tooltipStyle}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={v => <span style={{ fontSize: 11, color: P.iron }}>{v === "revenue" ? "Revenue" : "Orders"}</span>}
            />
            <Area
              yAxisId="rev"
              type="monotone"
              dataKey="revenue"
              stroke={P.ash}
              fill="url(#gradRevenue)"
              strokeWidth={2}
              dot={false}
              activeDot={{ fill: P.ash, r: 4 }}
            />
            <Area
              yAxisId="ord"
              type="monotone"
              dataKey="orders"
              stroke={P.cherry}
              fill="url(#gradOrders)"
              strokeWidth={2}
              dot={false}
              activeDot={{ fill: P.cherry, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Bottom row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top products */}
        <Card className="lg:col-span-2">
          <SectionTitle>Top Products by Units Sold</SectionTitle>

          {topProds.length === 0 ? (
            <p className="text-sm text-smoke py-8 text-center">No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={topProds.length * 44 + 16}>
              <BarChart
                data={topProds}
                layout="vertical"
                margin={{ top: 0, right: 56, left: 8, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={P.dough} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: P.iron }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 12, fill: P.iron }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v, name) =>
                    name === "qty"
                      ? [v, "Units sold"]
                      : [`$${Number(v).toFixed(2)}`, "Revenue"]
                  }
                  {...tooltipStyle}
                />
                <Bar dataKey="qty" fill={P.ash} radius={[0, 6, 6, 0]} label={<TopProductsLabel />}>
                  {topProds.map((_, i) => {
                    const colors = [P.cherry, P.ash, P.powder, P.dust, P.cherry, P.ash, P.powder, P.dust];
                    return <Cell key={i} fill={colors[i % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Orders by status */}
        <Card>
          <SectionTitle>Orders by Status</SectionTitle>

          {totalOrders === 0 ? (
            <p className="text-sm text-smoke py-8 text-center">No orders yet.</p>
          ) : (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={byStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {byStatus.map(entry => (
                        <Cell key={entry.status} fill={STATUS_COLOR[entry.status] ?? P.dust} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, name) => [v, name]}
                      {...tooltipStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <DonutCenter total={totalOrders} />
              </div>

              {/* Legend */}
              <div className="mt-3 space-y-2">
                {byStatus.map(entry => (
                  <div key={entry.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_COLOR[entry.status] ?? P.dust }}
                      />
                      <span className="text-smoke">{entry.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-crust">{entry.count}</span>
                      <span className="text-xs text-smoke w-9 text-right">
                        {totalOrders ? Math.round((entry.count / totalOrders) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

      </div>
    </div>
  );
}
