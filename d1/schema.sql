-- =====================================================
-- SukaMCD v2 - Cloudflare D1 Database Schema (SQLite)
-- Database Name: mcdhub
-- Database ID: 8b1a0242-30c0-43e9-87c2-2932f25a1bcb
-- =====================================================

-- 1. USERS (Pengganti auth.users Supabase)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  raw_user_meta_data TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROFILES (Profil pengguna McdHub)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  username TEXT UNIQUE,
  phone_number TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  bio TEXT,
  profile_picture TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. MCDCRYPT FILES (File Enkripsi)
CREATE TABLE IF NOT EXISTS mcdcrypt_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER,
  original_name TEXT NOT NULL,
  is_folder INTEGER NOT NULL DEFAULT 0,
  encrypted_path TEXT,
  mime_type TEXT,
  size INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES mcdcrypt_files(id) ON DELETE CASCADE
);

-- 4. MCDAI CONVERSATIONS (AI Chat Conversations)
CREATE TABLE IF NOT EXISTS mcdai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  title TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. MCDAI MESSAGES (AI Chat Messages)
CREATE TABLE IF NOT EXISTS mcdai_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES mcdai_conversations(id) ON DELETE CASCADE
);

-- 6. MCDBACKUP (Catatan Backup)
CREATE TABLE IF NOT EXISTS mcdbackup_backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL UNIQUE,
  size TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 7. MCD LOGS (Aktivitas Sistem)
CREATE TABLE IF NOT EXISTS mcdlogs_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  context TEXT,
  ip_address TEXT,
  user_agent TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7b. MCD SYSTEM LOGS (Log sistem detail)
CREATE TABLE IF NOT EXISTS mcd_system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'SYSTEM',
  description TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. FEEDBACKS (Bug & Suggestions Reports)
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_email TEXT,
  type TEXT NOT NULL, -- 'bug' | 'saran'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'rendah' | 'normal' | 'tinggi'
  description TEXT NOT NULL,
  device_info TEXT,
  app_version TEXT,
  error_log TEXT,
  status TEXT NOT NULL DEFAULT 'open' -- 'open' | 'resolved'
);

-- 9. ORDERS (Pemesanan Layanan / Paket)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT NOT NULL,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  price TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  specs TEXT NOT NULL,
  addons TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'cancelled'
  promo_code TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. PROMO CODES (Kode Promo & Diskon)
CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  benefit TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  start_date TEXT,
  end_date TEXT,
  discount_type TEXT NOT NULL DEFAULT 'none',
  discount_value REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. MCD PROJECTS (Katalog Proyek & Portofolio)
CREATE TABLE IF NOT EXISTS mcd_projects (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Web Development',
  status TEXT DEFAULT 'active',
  url TEXT,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 12. APP RELEASES (Rilis APK McdWallet & Mobile)
CREATE TABLE IF NOT EXISTS app_releases (
  id TEXT PRIMARY KEY,
  app_name TEXT NOT NULL,
  version TEXT NOT NULL,
  release_date TEXT,
  size_label TEXT,
  apk_path TEXT,
  apk_size_bytes INTEGER,
  changelog TEXT,
  is_latest INTEGER NOT NULL DEFAULT 1,
  force_update INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
