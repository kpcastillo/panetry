import { supabase } from "./supabase";

// ── Storage ───────────────────────────────────────────────────────────────────

export async function uploadProductImage(file) {
  const ext  = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: false });
  if (error) throw error;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);
  return data.publicUrl;
}

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

export async function createProduct(fields) {
  const { data, error } = await supabase
    .from("products")
    .insert(fields)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, fields) {
  const { data, error } = await supabase
    .from("products")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function updateStock(id, stock) {
  const { error } = await supabase
    .from("products")
    .update({ stock })
    .eq("id", id);
  if (error) throw error;
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

// ── Bakery profile ────────────────────────────────────────────────────────────

/** Fetch the single bakery profile row (returns null if not yet created) */
export async function fetchBakeryProfile() {
  const { data, error } = await supabase
    .from("bakery_profile")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Create or update the bakery profile */
export async function upsertBakeryProfile(fields) {
  const { id: _omit, ...rest } = fields; // strip id if passed in
  const { data, error } = await supabase
    .from("bakery_profile")
    .upsert({ id: "default", ...rest, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Upload a logo or cover image, returns the public URL */
export async function uploadBakeryImage(file, type = "logo") {
  const ext  = file.name.split(".").pop();
  const path = `profile-${type}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

/** All-time KPI summary */
export async function fetchAnalyticsSummary() {
  const { data, error } = await supabase
    .from("orders")
    .select("total, status, created_at");
  if (error) throw error;

  const rows = data ?? [];
  const totalRevenue   = rows.reduce((s, o) => s + (o.total ?? 0), 0);
  const totalOrders    = rows.length;
  const avgOrderValue  = totalOrders ? totalRevenue / totalOrders : 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthOrders = rows.filter(o => new Date(o.created_at) >= monthStart).length;

  return { totalRevenue, totalOrders, avgOrderValue, monthOrders };
}

/** Daily revenue + order count for the last 30 days */
export async function fetchMonthlyRevenue() {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });

  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at")
    .gte("created_at", `${days[0]}T00:00:00`);
  if (error) throw error;

  const rows = data ?? [];
  return days.map((day, idx) => {
    const dayRows = rows.filter(o => o.created_at.slice(0, 10) === day);
    const d = new Date(day);
    return {
      date:    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: dayRows.reduce((s, o) => s + (o.total ?? 0), 0),
      orders:  dayRows.length,
      // show label every 5 days to avoid crowding
      label:   idx % 5 === 0 ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
    };
  });
}

/** Top products by units sold, derived from order_items */
export async function fetchTopProductsSales() {
  const { data, error } = await supabase
    .from("order_items")
    .select("product_name, quantity, unit_price");
  if (error) throw error;

  const map = {};
  (data ?? []).forEach(i => {
    if (!map[i.product_name])
      map[i.product_name] = { name: i.product_name, qty: 0, revenue: 0 };
    map[i.product_name].qty     += i.quantity;
    map[i.product_name].revenue += i.quantity * (i.unit_price ?? 0);
  });

  return Object.values(map)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);
}

/** Order counts grouped by status */
export async function fetchOrdersByStatus() {
  const { data, error } = await supabase.from("orders").select("status");
  if (error) throw error;

  const map = { Pending: 0, Baking: 0, Ready: 0, Delivered: 0 };
  (data ?? []).forEach(o => { map[o.status] = (map[o.status] ?? 0) + 1; });
  return Object.entries(map).map(([status, count]) => ({ status, count }));
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
