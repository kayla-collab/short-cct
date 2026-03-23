-- Initial Schema for Short Circuit
-- Users, Sessions, Orders, Inventory

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
  email_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  guest_email TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total_cents INTEGER NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  discount_cents INTEGER DEFAULT 0,
  shipping_cents INTEGER DEFAULT 0,
  promo_code TEXT,
  shipping_name TEXT,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'US',
  tracking_number TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  product_id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Insert initial inventory
INSERT OR REPLACE INTO inventory (product_id, product_name, quantity, low_stock_threshold) VALUES
  ('smartwatch', 'Smartwatch Project Kit', 12, 5),
  ('ballbeam', 'Ball and Beam Project Kit', 0, 5);
