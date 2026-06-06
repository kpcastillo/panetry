import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import ToastContainer from "../ui/OrderToast";
import { useRealtimeOrders } from "../../hooks/useRealtimeOrders";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Start listening for new orders as soon as the admin shell loads
  useRealtimeOrders();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-cream">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
