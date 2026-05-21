const products = [
  { name: "Croissant",      sold: 32, color: "#EDAFB8" },  // Cherry Blossom — #1
  { name: "Sourdough Loaf", sold: 24, color: "#B0C4B1" },  // Ash Grey       — #2
  { name: "Cinnamon Roll",  sold: 18, color: "#F7E1D7" },  // Powder Petal   — #3
  { name: "Baguette",       sold: 15, color: "#DEDBD2" },  // Dust Grey      — #4
];

export default function TopProducts() {
  const max = products[0].sold;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm h-full">
      <h3 className="font-display text-lg mb-4">Top Products</h3>
      <div className="space-y-4">
        {products.map(p => (
          <div key={p.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{p.name}</span>
              <span className="text-smoke">{p.sold} sold</span>
            </div>
            <div className="h-2 rounded-full bg-dough overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(p.sold / max) * 100}%`, backgroundColor: p.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
