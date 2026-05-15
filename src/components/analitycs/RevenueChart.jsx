import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const FALLBACK = [
  { day: "Mon", revenue: 0 },
  { day: "Tue", revenue: 0 },
  { day: "Wed", revenue: 0 },
  { day: "Thu", revenue: 0 },
  { day: "Fri", revenue: 0 },
  { day: "Sat", revenue: 0 },
  { day: "Sun", revenue: 0 },
];

export default function RevenueChart({ data }) {
  const chartData = data?.length ? data : FALLBACK;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-display text-lg mb-4">Weekly Revenue</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#e8c97e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#e8c97e" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
          <Tooltip formatter={v => [`$${Number(v).toFixed(2)}`, "Revenue"]} />
          <Area type="monotone" dataKey="revenue" stroke="#e8c97e" fill="url(#rev)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
