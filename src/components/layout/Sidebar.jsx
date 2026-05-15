import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package, BarChart2, Archive, Store } from "lucide-react";

const links = [
  { to: "/",          label: "Dashboard",  icon: LayoutDashboard },
  { to: "/orders",    label: "Orders",     icon: ShoppingBag },
  { to: "/products",  label: "Products",   icon: Package },
  { to: "/inventory", label: "Inventory",  icon: Archive },
  { to: "/analytics", label: "Analytics",  icon: BarChart2 },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-smoke text-dough flex flex-col p-6">
      <h1 className="font-display text-2xl text-cream mb-10">Panetry</h1>
      

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive ? "bg-cream text-crust" : "hover:bg-white/10"}`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Storefront link at bottom */}
      <a
        href="/shop"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-dough/60 hover:text-dough hover:bg-white/10 transition-colors mt-4 border-t border-white/10 pt-4"
      >
        <Store size={16} />
        View Storefront ↗
      </a>
    </aside>
  );
}
