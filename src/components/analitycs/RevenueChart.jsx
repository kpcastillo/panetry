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
              <stop offset="5%"  stopColor="#B0C4B1" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#B0C4B1" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#4A5759" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#4A5759" }} tickFormatter={v => `$${v}`} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={v => [`$${Number(v).toFixed(2)}`, "Revenue"]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #f5ead7", fontSize: 12 }}
            cursor={{ stroke: "#EDAFB8", strokeWidth: 1 }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#B0C4B1" fill="url(#rev)" strokeWidth={2} dot={{ fill: "#B0C4B1", r: 3 }} activeDot={{ fill: "#EDAFB8", r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
