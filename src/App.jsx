import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import Shop from "./pages/Shop";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin shell */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders"    element={<Orders />} />
          <Route path="products"  element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        {/* Storefront — own layout, no sidebar */}
        <Route path="/shop" element={<Shop />} />
      </Routes>
    </BrowserRouter>
  );
}
