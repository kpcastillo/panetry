// Palette
const P = {
  cherry: "#EDAFB8",  // Cherry Blossom — lively, active
  powder: "#F7E1D7",  // Powder Petal   — peaceful, waiting
  dust:   "#DEDBD2",  // Dust Grey      — muted, completed
  ash:    "#B0C4B1",  // Ash Grey       — grounded, good
  iron:   "#4A5759",  // Iron Grey      — serious, text
};

// Order status → { bg, color } for inline styles
export const ORDER_STATUS_STYLE = {
  Pending:   { backgroundColor: P.powder, color: P.iron },
  Baking:    { backgroundColor: P.cherry, color: P.iron },
  Ready:     { backgroundColor: P.ash,    color: P.iron },
  Delivered: { backgroundColor: P.dust,   color: P.iron },
};

// Inventory stock status → { label, bg, color }
export const STOCK_STATUS_STYLE = {
  ok:  { label: "In stock",     backgroundColor: P.ash,    color: P.iron   },
  low: { label: "Low stock",    backgroundColor: P.cherry, color: P.iron   },
  out: { label: "Out of stock", backgroundColor: P.iron,   color: P.powder },
};
