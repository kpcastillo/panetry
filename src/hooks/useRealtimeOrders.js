import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useNotificationStore } from "../store/notificationStore";
import { useOrderStore } from "../store/OrderStore";

const POLL_MS = 15_000; // check every 15 seconds

/**
 * Polls the orders table every 15 s for rows newer than mount time.
 * Works on Supabase free tier — no Realtime/Replication config needed.
 */
export function useRealtimeOrders() {
  const addNewOrder   = useNotificationStore(s => s.addNewOrder);
  const refreshOrders = useOrderStore(s => s.fetch);

  // Only notify about orders placed *after* the admin opened the dashboard
  const lastSeenAt = useRef(new Date().toISOString());

  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await supabase
          .from("orders")
          .select("id, customer_name, total, created_at")
          .gt("created_at", lastSeenAt.current)
          .order("created_at", { ascending: true });

        if (data?.length) {
          data.forEach(order => addNewOrder(order));
          lastSeenAt.current = data[data.length - 1].created_at;
          refreshOrders();
        }
      } catch (err) {
        console.warn("Order poll error:", err.message);
      }
    };

    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [addNewOrder, refreshOrders]);
}
