import { supabase } from "./supabase";

// ── Orders ──────────────────────────────────────────────────────────────────

export async function fetchOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function createOrder({ customerName, customerEmail, notes, items }) {
  // items: [{ product_id, product_name, quantity, unit_price }]
  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({ customer_name: customerName, customer_email: customerEmail, notes, total })
    .select()
    .single();
  if (orderErr) throw orderErr;

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(items.map(i => ({ ...i, order_id: order.id })));
  if (itemsErr) throw itemsErr;

  return order;
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts({ availableOnly = false } = {}) {
  let query = supabase.from("products").select("*").order("name");
  if (availableOnly) query = query.eq("available", true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ── Dashboard stats ──────────────────────────────────────────────────────────

export async function fetchDashboardStats() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const [{ data: todayOrders }, { data: pendingOrders }, { data: revenue }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact" })
        .gte("created_at", `${today}T00:00:00`),
      supabase
        .from("orders")
        .select("id", { count: "exact" })
        .in("status", ["Pending", "Baking"]),
      supabase
        .from("orders")
        .select("total")
        .gte("created_at", `${today}T00:00:00`),
    ]);

  const todayRevenue = (revenue ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);

  return {
    ordersToday: todayOrders?.length ?? 0,
    inProduction: pendingOrders?.length ?? 0,
    revenue: todayRevenue,
  };
}

export async function fetchWeeklyRevenue() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at")
    .gte("created_at", `${days[0]}T00:00:00`);
  if (error) throw error;

  return days.map(day => ({
    day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
    revenue: (data ?? [])
      .filter(o => o.created_at.slice(0, 10) === day)
      .reduce((sum, o) => sum + (o.total ?? 0), 0),
  }));
}
