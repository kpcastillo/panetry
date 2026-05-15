import { Bell } from "lucide-react";

export default function TopBar() {
  return (
    <header className="h-14 bg-crust border-b border-dough flex items-center justify-between px-6">
      <p className="text-sm text-smoke">
        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </p>
      <button className="p-2 rounded-lg hover:bg-cream transition-colors">
        <Bell size={18} className="text-smoke" />
      </button>
    </header>
  );
}
