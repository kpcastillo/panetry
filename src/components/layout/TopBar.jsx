import { Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../../store/notificationStore";

export default function TopBar({ onMenuClick }) {
  const navigate     = useNavigate();
  const unreadCount  = useNotificationStore(s => s.unreadCount);
  const clearUnread  = useNotificationStore(s => s.clearUnread);

  function handleBell() {
    navigate("/orders");
    clearUnread();
  }

  const dateShort = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dateLong  = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <header className="h-14 bg-crust border-b border-dough flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-cream transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} className="text-smoke" />
        </button>

        <p className="text-sm text-smoke hidden sm:block">{dateLong}</p>
        <p className="text-sm text-smoke sm:hidden">{dateShort}</p>
      </div>

      {/* Bell with unread badge */}
      <button
        onClick={handleBell}
        className="relative p-2 rounded-lg hover:bg-cream transition-colors"
        aria-label={unreadCount > 0 ? `${unreadCount} new orders` : "Orders"}
      >
        <Bell size={18} className="text-smoke" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold leading-none animate-pulse"
            style={{ backgroundColor: "#EDAFB8" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}
