export default function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border-l-4 shadow-sm`} >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-smoke uppercase tracking-widest">{label}</span>
        {Icon && <Icon size={16} className="text-smoke" />}
      </div>
      <p className="font-display text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-smoke mt-1">{sub}</p>}
    </div>
  );
}