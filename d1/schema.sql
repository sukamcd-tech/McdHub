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
  user_id TEXT,
  parent_id INTEGER,
  original_name TEXT NOT NULL,
  is_folder INTEGER NOT NULL DEFAULT 0,
  encrypted_path TEXT,
  mime_type TEXT,
  size INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
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

-- 13. MCDWALLET DOWNLOAD STATS
CREATE TABLE IF NOT EXISTS mcdwallet_download_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  downloaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  app_name TEXT DEFAULT 'McdWallet',
  ip_address TEXT,
  user_agent TEXT
);

-- 14. CLIENT CONTACTS
CREATE TABLE IF NOT EXISTS client_contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active', -- 'active' | 'lead' | 'completed'
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 15. CLIENT TASKS (KANBAN & 50-50 FREELANCE PIPELINE)
CREATE TABLE IF NOT EXISTS client_tasks (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES client_contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo', -- 'todo' | 'in_progress' | 'review' | 'done'
  priority TEXT DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'urgent'
  budget REAL DEFAULT 0,
  paid INTEGER DEFAULT 0, -- 0: Belum, 1: Lunas
  deadline TEXT,
  domain_name TEXT, -- e.g. 'klienstore.com'
  domain_price REAL DEFAULT 0, -- 100% dibebankan di Invoice 1
  staging_url TEXT, -- e.g. 'https://project-preview.pages.dev'
  stage_step INTEGER DEFAULT 1, -- 1: Menunggu DP 50% & Domain, 2: Pengerjaan Staging, 3: Web ACC (Pelunasan 50%), 4: Handover & Garansi Aktif
  warranty_ends_at TEXT, -- Tanggal berakhir masa garansi 3 bulan
  cloudflare_connected INTEGER DEFAULT 0, -- 1 jika domain sudah disambungkan ke Cloudflare
  credentials_handed_over INTEGER DEFAULT 0, -- 1 jika akun/email kredensial sudah diserahkan
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 16. CLIENT INVOICES (50-50 MILESTONES)
CREATE TABLE IF NOT EXISTS client_invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  client_id TEXT REFERENCES client_contacts(id) ON DELETE SET NULL,
  task_id TEXT REFERENCES client_tasks(id) ON DELETE SET NULL,
  invoice_type TEXT DEFAULT 'general', -- 'dp_50' | 'final_50' | 'general'
  project_title TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending', -- 'draft' | 'pending' | 'paid' | 'overdue'
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  items_json TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);


