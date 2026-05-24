import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const sqlite = new Database(dbPath);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS platform_users (
      id TEXT PRIMARY KEY,
      fullname TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      country TEXT,
      role TEXT DEFAULT 'customer',
      account_status TEXT DEFAULT 'pending',
      profile_image TEXT,
      deposit_balance REAL DEFAULT 0.00,
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      verification_status TEXT DEFAULT 'unverified'
  );

  CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      vin TEXT,
      lot_number TEXT UNIQUE,
      title TEXT NOT NULL,
      make TEXT,
      model TEXT,
      year INTEGER,
      mileage INTEGER,
      condition TEXT,
      damage TEXT,
      location TEXT,
      auction_date DATETIME,
      current_bid REAL DEFAULT 0.00,
      buy_now_price REAL,
      seller_id TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vehicle_images (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT,
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bids (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT,
      user_id TEXT,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS watchlist (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      vehicle_id TEXT,
      FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admin_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT,
      action TEXT NOT NULL,
      target_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES platform_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS escrow_wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE,
      available_balance REAL DEFAULT 0.00,
      pending_balance REAL DEFAULT 0.00,
      locked_balance REAL DEFAULT 0.00,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS deposit_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      amount REAL NOT NULL,
      payment_method TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE,
      user_id TEXT,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      due_date DATETIME,
      payment_reference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      wallet_id TEXT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (wallet_id) REFERENCES escrow_wallets(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS invoice_accounts (
      id TEXT PRIMARY KEY,
      account_type TEXT,
      bank_name TEXT,
      account_holder TEXT,
      account_number TEXT,
      routing_number TEXT,
      swift_code TEXT,
      crypto_address TEXT,
      crypto_network TEXT,
      active_status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS customer_invoices (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      amount REAL NOT NULL,
      payment_method TEXT,
      assigned_account_id TEXT,
      status TEXT DEFAULT 'pending',
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_account_id) REFERENCES invoice_accounts(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS notification_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT,
      message TEXT,
      delivered INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE
  );
`);

// Seamless migration, add columns if they don't exist
try { sqlite.exec("ALTER TABLE platform_users ADD COLUMN country TEXT;"); } catch (err: any) {}
try { sqlite.exec("ALTER TABLE platform_users ADD COLUMN account_status TEXT DEFAULT 'pending';"); } catch (err: any) {}
try { sqlite.exec("ALTER TABLE platform_users ADD COLUMN role TEXT DEFAULT 'customer';"); } catch (err: any) {}
try { sqlite.exec("ALTER TABLE platform_users ADD COLUMN profile_image TEXT;"); } catch (err: any) {}
try { sqlite.exec("ALTER TABLE platform_users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;"); } catch (err: any) {}
try { sqlite.exec("ALTER TABLE platform_users ADD COLUMN last_login DATETIME;"); } catch (err: any) {}
try { sqlite.exec("ALTER TABLE platform_users ADD COLUMN verification_status TEXT DEFAULT 'unverified';"); } catch (err: any) {}
try { sqlite.exec("ALTER TABLE escrow_wallets ADD COLUMN is_frozen INTEGER DEFAULT 0;"); } catch (err: any) {}

// Migrate old data safely
try {
  sqlite.exec("UPDATE platform_users SET account_status = 'active' WHERE is_approved = 1 AND account_status = 'pending';");
  sqlite.exec("UPDATE platform_users SET account_status = 'pending' WHERE is_approved = 0 AND account_status = 'active';");
} catch (err: any) {}

export default sqlite;

