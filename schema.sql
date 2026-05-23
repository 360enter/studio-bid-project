-- schema.sql
-- SQLite Schema for Cloudflare D1 (Apex Strategic Holdings Auction Platform)

DROP TABLE IF EXISTS bidding_history;
DROP TABLE IF EXISTS vehicle_inventory;

-- Vehicle Inventory Table
CREATE TABLE vehicle_inventory (
    id TEXT PRIMARY KEY,
    vin TEXT NOT NULL UNIQUE,
    lot TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    make TEXT,
    model TEXT,
    year INTEGER,
    price REAL NOT NULL,
    condition TEXT,
    location TEXT,
    image_paths TEXT, -- Comma-separated or JSON list of raw image file/URL mappings
    source_url TEXT,
    is_active INTEGER DEFAULT 1, -- 1 = Active, 0 = Inactive/Sold
    status TEXT DEFAULT 'Active', -- 'Active', 'Closed', 'Sold'
    velocity TEXT DEFAULT 'Off', -- 'Off', 'Low', 'Medium', 'High'
    admin_invoice_status TEXT DEFAULT 'Pending' -- 'Pending', 'Sent'
);

-- Bidding History Table
CREATE TABLE bidding_history (
    id TEXT PRIMARY KEY,
    lot_id TEXT NOT NULL,
    user TEXT NOT NULL,
    amount REAL NOT NULL,
    timestamp TEXT NOT NULL,
    is_simulated INTEGER DEFAULT 0, -- 1 = Simulated by Organic Velocity Logic, 0 = Live User Input
    FOREIGN KEY(lot_id) REFERENCES vehicle_inventory(id) ON DELETE CASCADE
);

-- Indexing for rapid queries
CREATE INDEX idx_vehicle_lot ON vehicle_inventory(lot);
CREATE INDEX idx_vehicle_vin ON vehicle_inventory(vin);
CREATE INDEX idx_bidding_lot ON bidding_history(lot_id);
CREATE INDEX idx_bidding_timestamp ON bidding_history(timestamp DESC);
