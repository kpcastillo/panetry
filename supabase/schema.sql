-- Run this once in your Supabase SQL editor to set up the schema.

create table products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       numeric(10,2) not null,
  category    text,
  image_url   text,
  available   boolean default true,
  stock       int     default 0,
  created_at  timestamptz default now()
);

create table orders (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  customer_email text,
  status         text default 'Pending'
                   check (status in ('Pending','Baking','Ready','Delivered')),
  total          numeric(10,2),
  notes          text,
  created_at     timestamptz default now()
);

create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references orders(id) on delete cascade,
  product_id   uuid references products(id),
  product_name text           not null,
  quantity     int            not null,
  unit_price   numeric(10,2)  not null
);

-- Sample products
insert into products (name, description, price, category, available, stock) values
  ('Sourdough Loaf',   'Slow-fermented with a crispy crust',      14.00, 'Bread',    true, 12),
  ('Croissant',        'Buttery, flaky, baked fresh each morning', 4.50, 'Pastry',   true, 24),
  ('Cinnamon Roll',    'Soft dough with brown sugar & cinnamon',   4.50, 'Pastry',   true, 18),
  ('Baguette',         'Classic French baguette, crackling crust', 5.00, 'Bread',    true, 20),
  ('Focaccia',         'Olive oil, rosemary, sea salt',            8.00, 'Bread',    true,  8),
  ('Brioche Loaf',     'Enriched dough, golden and pillowy',      15.00, 'Bread',    true,  6),
  ('Pain au Chocolat', 'Dark chocolate inside buttery pastry',     5.00, 'Pastry',   true, 16),
  ('Rye Loaf',         'Dense, earthy, with caraway seeds',       12.00, 'Bread',    true, 10);

-- Sample orders
insert into orders (customer_name, customer_email, status, total) values
  ('Emily Hartwell', 'emily@example.com', 'Pending',   34.50),
  ('Marcus Tran',    'marcus@example.com','Baking',    27.00),
  ('Sofia Reyes',    'sofia@example.com', 'Ready',     22.75),
  ('James Okafor',   'james@example.com', 'Delivered', 31.00),
  ('Nadia Petrov',   'nadia@example.com', 'Delivered', 18.00),
  ('Leo Huang',      'leo@example.com',   'Pending',   20.00),
  ('Amara Diallo',   'amara@example.com', 'Delivered', 19.50),
  ('Ben Fischer',    'ben@example.com',   'Baking',    29.00);
