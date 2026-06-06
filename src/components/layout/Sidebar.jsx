import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Package,
  BarChart2, Archive, Store, UserCircle, X,
} from "lucide-react";

const links = [
  { to: "/",          label: "Dashboard",  icon: LayoutDashboard },
  { to: "/orders",    label: "Orders",     icon: ShoppingBag },
  { to: "/products",  label: "Products",   icon: Package },
  { to: "/inventory", label: "Inventory",  icon: Archive },
  { to: "/analytics", label: "Analytics",  icon: BarChart2 },
  { to: "/profile",   label: "Profile",    icon: UserCircle },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-smoke text-dough flex flex-col p-6
          transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:z-auto md:transition-none md:shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-2xl text-cream">Panetry</h1>
          <button
            onClick={onClose}
            className="md:hidden text-dough/50 hover:text-dough transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}   // close drawer on mobile after navigation
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

        {/* Storefront link */}
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
    </>
  );
}
