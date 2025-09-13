-- Initialize orders_db with a demo table and seed data

-- Drop and recreate for idempotency in dev
DROP TABLE IF EXISTS public.orders;
CREATE TABLE public.orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  status VARCHAR(16) NOT NULL CHECK (status IN ('pending','shipped','delivered')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.orders (customer_name, product_name, status, updated_at)
VALUES
  ('Alice', 'Widget', 'pending', NOW()),
  ('Bob', 'Gadget', 'shipped', NOW()),
  ('Carol', 'Thingamajig', 'delivered', NOW());
