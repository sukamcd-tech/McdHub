import { Hono } from 'hono';
import { query, queryOne, execute } from '../db';
import { requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const clientsRoute = new Hono<{ Bindings: Bindings }>();

// Helper to ensure tables exist
async function ensureTables(db: D1Database) {
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS client_contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS client_tasks (
      id TEXT PRIMARY KEY,
      client_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      budget REAL DEFAULT 0,
      paid INTEGER DEFAULT 0,
      deadline TEXT,
      domain_name TEXT,
      domain_price REAL DEFAULT 0,
      staging_url TEXT,
      stage_step INTEGER DEFAULT 1,
      warranty_ends_at TEXT,
      cloudflare_connected INTEGER DEFAULT 0,
      credentials_handed_over INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS client_invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      client_id TEXT,
      task_id TEXT,
      invoice_type TEXT DEFAULT 'general',
      project_title TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      items_json TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS client_basts (
      id TEXT PRIMARY KEY,
      bast_number TEXT UNIQUE NOT NULL,
      client_id TEXT,
      task_id TEXT,
      client_name TEXT NOT NULL,
      client_company TEXT,
      client_phone TEXT,
      client_email TEXT,
      project_title TEXT NOT NULL,
      domain_primary TEXT,
      domain_secondary TEXT,
      domain_provider TEXT DEFAULT 'IDwebhost',
      hosting_provider TEXT DEFAULT 'Cloudflare',
      domain_expiry TEXT,
      domain_cost_yearly TEXT,
      invoice_ref TEXT,
      email_project TEXT,
      password_default TEXT,
      server_infra TEXT DEFAULT 'Cloudflare Pages & D1 Engine',
      cms_sheets TEXT,
      search_console TEXT,
      sitemap TEXT,
      modules_json TEXT,
      terms_json TEXT,
      handover_date TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Safe migrations for existing SQLite tables
  const safeAlter = async (sql: string) => {
    try {
      await execute(db, sql);
    } catch (_) {}
  };
  await safeAlter('ALTER TABLE client_tasks ADD COLUMN domain_name TEXT');
  await safeAlter('ALTER TABLE client_tasks ADD COLUMN domain_price REAL DEFAULT 0');
  await safeAlter('ALTER TABLE client_tasks ADD COLUMN staging_url TEXT');
  await safeAlter('ALTER TABLE client_tasks ADD COLUMN stage_step INTEGER DEFAULT 1');
  await safeAlter('ALTER TABLE client_tasks ADD COLUMN warranty_ends_at TEXT');
  await safeAlter('ALTER TABLE client_tasks ADD COLUMN cloudflare_connected INTEGER DEFAULT 0');
  await safeAlter('ALTER TABLE client_tasks ADD COLUMN credentials_handed_over INTEGER DEFAULT 0');
  await safeAlter("ALTER TABLE client_invoices ADD COLUMN invoice_type TEXT DEFAULT 'general'");
}

// ──────────────────────────────────────────────
// CLIENT CONTACTS
// ──────────────────────────────────────────────

// GET /api/clients
clientsRoute.get('/', requireAuth('admin'), async (c) => {
  try {
    await ensureTables(c.env.DB);
    const clients = await query(
      c.env.DB,
      `SELECT c.*, 
        (SELECT COUNT(*) FROM client_tasks t WHERE t.client_id = c.id) as total_tasks,
        (SELECT COALESCE(SUM(i.amount), 0) FROM client_invoices i WHERE i.client_id = c.id AND i.status = 'paid') as total_revenue
       FROM client_contacts c
       ORDER BY c.created_at DESC`
    );
    return c.json({ success: true, clients: clients || [] });
  } catch (error: any) {
    console.error('Fetch clients error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/clients
clientsRoute.post('/', requireAuth('admin'), async (c) => {
  try {
    await ensureTables(c.env.DB);
    const data = await c.req.json();
    const { name, company = '', email = '', phone = '', status = 'active', notes = '' } = data;

    if (!name?.trim()) {
      return c.json({ success: false, error: 'Nama klien wajib diisi' }, 400);
    }

    const id = crypto.randomUUID();
    await execute(
      c.env.DB,
      `INSERT INTO client_contacts (id, name, company, email, phone, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name.trim(), company.trim(), email.trim(), phone.trim(), status, notes.trim()]
    );

    const client = await queryOne(c.env.DB, 'SELECT * FROM client_contacts WHERE id = ?', [id]);
    return c.json({ success: true, client });
  } catch (error: any) {
    console.error('Create client error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/clients/:id
clientsRoute.put('/:id', requireAuth('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    const { name, company, email, phone, status, notes } = data;

    await execute(
      c.env.DB,
      `UPDATE client_contacts
       SET name = COALESCE(?, name),
           company = COALESCE(?, company),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           status = COALESCE(?, status),
           notes = COALESCE(?, notes)
       WHERE id = ?`,
      [name, company, email, phone, status, notes, id]
    );

    const updated = await queryOne(c.env.DB, 'SELECT * FROM client_contacts WHERE id = ?', [id]);
    return c.json({ success: true, client: updated });
  } catch (error: any) {
    console.error('Update client error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/clients/:id
clientsRoute.delete('/:id', requireAuth('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    await execute(c.env.DB, 'DELETE FROM client_contacts WHERE id = ?', [id]);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete client error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ──────────────────────────────────────────────
// CLIENT TASKS / PROJECTS (KANBAN)
// ──────────────────────────────────────────────

// GET /api/clients/tasks
clientsRoute.get('/tasks', requireAuth('admin'), async (c) => {
  try {
    await ensureTables(c.env.DB);
    const tasks = await query(
      c.env.DB,
      `SELECT t.*, c.name as client_name, c.company as client_company
       FROM client_tasks t
       LEFT JOIN client_contacts c ON t.client_id = c.id
       ORDER BY t.created_at DESC`
    );
    return c.json({ success: true, tasks: tasks || [] });
  } catch (error: any) {
    console.error('Fetch tasks error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/clients/tasks
clientsRoute.post('/tasks', requireAuth('admin'), async (c) => {
  try {
    await ensureTables(c.env.DB);
    const data = await c.req.json();
    const {
      client_id = null,
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      budget = 0,
      paid = 0,
      deadline = '',
      domain_name = '',
      domain_price = 0,
      staging_url = '',
      stage_step = 1,
      warranty_ends_at = null,
      cloudflare_connected = 0,
      credentials_handed_over = 0,
    } = data;

    if (!title?.trim()) {
      return c.json({ success: false, error: 'Judul tugas/proyek wajib diisi' }, 400);
    }

    const id = crypto.randomUUID();
    await execute(
      c.env.DB,
      `INSERT INTO client_tasks (
        id, client_id, title, description, status, priority, budget, paid, deadline,
        domain_name, domain_price, staging_url, stage_step, warranty_ends_at, cloudflare_connected, credentials_handed_over
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        client_id,
        title.trim(),
        description.trim(),
        status,
        priority,
        Number(budget) || 0,
        paid ? 1 : 0,
        deadline,
        domain_name.trim(),
        Number(domain_price) || 0,
        staging_url.trim(),
        Number(stage_step) || 1,
        warranty_ends_at,
        cloudflare_connected ? 1 : 0,
        credentials_handed_over ? 1 : 0,
      ]
    );

    const task = await queryOne(
      c.env.DB,
      `SELECT t.*, c.name as client_name, c.company as client_company
       FROM client_tasks t
       LEFT JOIN client_contacts c ON t.client_id = c.id
       WHERE t.id = ?`,
      [id]
    );

    return c.json({ success: true, task });
  } catch (error: any) {
    console.error('Create task error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/clients/tasks/:id
clientsRoute.put('/tasks/:id', requireAuth('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    const {
      client_id,
      title,
      description,
      status,
      priority,
      budget,
      paid,
      deadline,
      domain_name,
      domain_price,
      staging_url,
      stage_step,
      warranty_ends_at,
      cloudflare_connected,
      credentials_handed_over,
    } = data;

    await execute(
      c.env.DB,
      `UPDATE client_tasks
       SET client_id = COALESCE(?, client_id),
           title = COALESCE(?, title),
           description = COALESCE(?, description),
           status = COALESCE(?, status),
           priority = COALESCE(?, priority),
           budget = COALESCE(?, budget),
           paid = COALESCE(?, paid),
           deadline = COALESCE(?, deadline),
           domain_name = COALESCE(?, domain_name),
           domain_price = COALESCE(?, domain_price),
           staging_url = COALESCE(?, staging_url),
           stage_step = COALESCE(?, stage_step),
           warranty_ends_at = COALESCE(?, warranty_ends_at),
           cloudflare_connected = COALESCE(?, cloudflare_connected),
           credentials_handed_over = COALESCE(?, credentials_handed_over)
       WHERE id = ?`,
      [
        client_id !== undefined ? client_id : null,
        title !== undefined ? title : null,
        description !== undefined ? description : null,
        status !== undefined ? status : null,
        priority !== undefined ? priority : null,
        budget !== undefined ? Number(budget) : null,
        paid !== undefined ? (paid ? 1 : 0) : null,
        deadline !== undefined ? deadline : null,
        domain_name !== undefined ? domain_name : null,
        domain_price !== undefined ? Number(domain_price) : null,
        staging_url !== undefined ? staging_url : null,
        stage_step !== undefined ? Number(stage_step) : null,
        warranty_ends_at !== undefined ? warranty_ends_at : null,
        cloudflare_connected !== undefined ? (cloudflare_connected ? 1 : 0) : null,
        credentials_handed_over !== undefined ? (credentials_handed_over ? 1 : 0) : null,
        id,
      ]
    );

    const updated = await queryOne(
      c.env.DB,
      `SELECT t.*, c.name as client_name, c.company as client_company
       FROM client_tasks t
       LEFT JOIN client_contacts c ON t.client_id = c.id
       WHERE t.id = ?`,
      [id]
    );

    return c.json({ success: true, task: updated });
  } catch (error: any) {
    console.error('Update task error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/clients/tasks/:id/handover
// Eksekusi Serah Terima: Aktifkan domain Cloudflare, serahkan kredensial, dan hitung mundur garansi 3 bulan
clientsRoute.post('/tasks/:id/handover', requireAuth('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const warrantyDate = new Date();
    warrantyDate.setDate(warrantyDate.getDate() + 90);
    const warrantyEndsAt = warrantyDate.toISOString().split('T')[0];

    await execute(
      c.env.DB,
      `UPDATE client_tasks
       SET stage_step = 4,
           status = 'done',
           cloudflare_connected = 1,
           credentials_handed_over = 1,
           warranty_ends_at = ?
       WHERE id = ?`,
      [warrantyEndsAt, id]
    );

    const updated = await queryOne(
      c.env.DB,
      `SELECT t.*, c.name as client_name, c.company as client_company
       FROM client_tasks t
       LEFT JOIN client_contacts c ON t.client_id = c.id
       WHERE t.id = ?`,
      [id]
    );

    return c.json({ success: true, task: updated, warranty_ends_at: warrantyEndsAt });
  } catch (error: any) {
    console.error('Handover error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/clients/tasks/:id
clientsRoute.delete('/tasks/:id', requireAuth('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    await execute(c.env.DB, 'DELETE FROM client_tasks WHERE id = ?', [id]);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ──────────────────────────────────────────────
// CLIENT INVOICES & BILLING
// ──────────────────────────────────────────────

// GET /api/clients/invoices
clientsRoute.get('/invoices', requireAuth('admin'), async (c) => {
  try {
    await ensureTables(c.env.DB);
    const invoices = await query(
      c.env.DB,
      `SELECT i.*, c.name as client_name, c.company as client_company, c.email as client_email, c.phone as client_phone
       FROM client_invoices i
       LEFT JOIN client_contacts c ON i.client_id = c.id
       ORDER BY i.created_at DESC`
    );
    return c.json({ success: true, invoices: invoices || [] });
  } catch (error: any) {
    console.error('Fetch invoices error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/clients/invoices
clientsRoute.post('/invoices', requireAuth('admin'), async (c) => {
  try {
    await ensureTables(c.env.DB);
    const data = await c.req.json();
    const {
      invoice_number,
      client_id = null,
      task_id = null,
      invoice_type = 'general',
      project_title,
      amount,
      status = 'pending',
      issue_date,
      due_date,
      items_json = '[]',
      notes = '',
    } = data;

    if (!project_title?.trim()) {
      return c.json({ success: false, error: 'Judul proyek/invoice wajib diisi' }, 400);
    }

    const id = crypto.randomUUID();
    const invNum = invoice_number?.trim() || `INV-${Date.now().toString().slice(-6)}`;
    const issueDateStr = issue_date || new Date().toISOString().split('T')[0];
    const dueDateStr = due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    await execute(
      c.env.DB,
      `INSERT INTO client_invoices (id, invoice_number, client_id, task_id, invoice_type, project_title, amount, status, issue_date, due_date, items_json, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        invNum,
        client_id,
        task_id,
        invoice_type,
        project_title.trim(),
        Number(amount) || 0,
        status,
        issueDateStr,
        dueDateStr,
        typeof items_json === 'string' ? items_json : JSON.stringify(items_json),
        notes.trim(),
      ]
    );

    const invoice = await queryOne(
      c.env.DB,
      `SELECT i.*, c.name as client_name, c.company as client_company, c.email as client_email, c.phone as client_phone
       FROM client_invoices i
       LEFT JOIN client_contacts c ON i.client_id = c.id
       WHERE i.id = ?`,
      [id]
    );

    return c.json({ success: true, invoice });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/clients/invoices/:id/status
clientsRoute.put('/invoices/:id/status', requireAuth('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();

    await execute(
      c.env.DB,
      `UPDATE client_invoices SET status = ? WHERE id = ?`,
      [status, id]
    );

    // Otomatis update task milestone jika invoice ditandai PAID (Lunas)
    const invoice = await queryOne(c.env.DB, 'SELECT * FROM client_invoices WHERE id = ?', [id]);
    if (invoice && invoice.task_id && status === 'paid') {
      if (invoice.invoice_type === 'dp_50') {
        // Invoice 1 (DP 50% + Domain) Lunas: Buka izin pengerjaan kode & staging
        await execute(
          c.env.DB,
          `UPDATE client_tasks
           SET stage_step = CASE WHEN stage_step < 2 THEN 2 ELSE stage_step END,
               status = CASE WHEN status = 'todo' THEN 'in_progress' ELSE status END
           WHERE id = ?`,
          [invoice.task_id]
        );
      } else if (invoice.invoice_type === 'final_50') {
        // Invoice 2 (Pelunasan 50%) Lunas: Siap handover domain & kredensial
        await execute(
          c.env.DB,
          `UPDATE client_tasks
           SET stage_step = CASE WHEN stage_step < 3 THEN 3 ELSE stage_step END,
               paid = 1
           WHERE id = ?`,
          [invoice.task_id]
        );
      }
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Update invoice status error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/clients/invoices/:id
clientsRoute.delete('/invoices/:id', requireAuth('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    await execute(c.env.DB, 'DELETE FROM client_invoices WHERE id = ?', [id]);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ──────────────────────────────────────────────
// CLIENT BAST (BERITA ACARA SERAH TERIMA)
// ──────────────────────────────────────────────

// GET /api/clients/basts
clientsRoute.get('/basts', requireAuth('admin'), async (c) => {
  try {
    await ensureTables(c.env.DB);
    const basts = await query(
      c.env.DB,
      `SELECT * FROM client_basts ORDER BY created_at DESC`
    );
    return c.json({ success: true, basts: basts || [] });
  } catch (error: any) {
    console.error('Fetch BAST error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/clients/basts
clientsRoute.post('/basts', requireAuth('admin'), async (c) => {
  try {
    await ensureTables(c.env.DB);
    const body = await c.req.json();
    const {
      bast_number,
      client_id,
      task_id,
      client_name,
      client_company = '',
      client_phone = '',
      client_email = '',
      project_title,
      domain_primary = '',
      domain_secondary = '',
      domain_provider = 'IDwebhost',
      hosting_provider = 'Cloudflare',
      domain_expiry = '',
      domain_cost_yearly = '',
      invoice_ref = '',
      email_project = '',
      password_default = '',
      server_infra = 'Cloudflare Pages & D1 Engine',
      cms_sheets = '',
      search_console = '',
      sitemap = '',
      modules = [],
      terms = [],
      handover_date = new Date().toISOString().split('T')[0],
      status = 'completed',
    } = body;

    if (!client_name?.trim() || !project_title?.trim()) {
      return c.json({ success: false, error: 'Nama klien dan nama sistem wajib diisi' }, 400);
    }

    const id = crypto.randomUUID();
    const bastNum = bast_number?.trim() || `BAST-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    await execute(
      c.env.DB,
      `INSERT INTO client_basts (
        id, bast_number, client_id, task_id, client_name, client_company,
        client_phone, client_email, project_title, domain_primary, domain_secondary,
        domain_provider, hosting_provider, domain_expiry, domain_cost_yearly,
        invoice_ref, email_project, password_default, server_infra,
        cms_sheets, search_console, sitemap, modules_json, terms_json, handover_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        bastNum,
        client_id || null,
        task_id || null,
        client_name.trim(),
        client_company.trim(),
        client_phone.trim(),
        client_email.trim(),
        project_title.trim(),
        domain_primary.trim(),
        domain_secondary.trim(),
        domain_provider.trim(),
        hosting_provider.trim(),
        domain_expiry.trim(),
        domain_cost_yearly.trim(),
        invoice_ref.trim(),
        email_project.trim(),
        password_default.trim(),
        server_infra.trim(),
        cms_sheets.trim(),
        search_console.trim(),
        sitemap.trim(),
        JSON.stringify(modules || []),
        JSON.stringify(terms || []),
        handover_date,
        status,
      ]
    );

    const created = await queryOne(c.env.DB, 'SELECT * FROM client_basts WHERE id = ?', [id]);
    return c.json({ success: true, bast: created });
  } catch (error: any) {
    console.error('Create BAST error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /api/clients/basts/:id
clientsRoute.put('/basts/:id', requireAuth('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const {
      bast_number,
      client_name,
      client_company,
      client_phone,
      client_email,
      project_title,
      domain_primary,
      domain_secondary,
      domain_provider,
      hosting_provider,
      domain_expiry,
      domain_cost_yearly,
      invoice_ref,
      email_project,
      password_default,
      server_infra,
      cms_sheets,
      search_console,
      sitemap,
      modules,
      terms,
      handover_date,
      status,
    } = body;

    await execute(
      c.env.DB,
      `UPDATE client_basts
       SET bast_number = COALESCE(?, bast_number),
           client_name = COALESCE(?, client_name),
           client_company = COALESCE(?, client_company),
           client_phone = COALESCE(?, client_phone),
           client_email = COALESCE(?, client_email),
           project_title = COALESCE(?, project_title),
           domain_primary = COALESCE(?, domain_primary),
           domain_secondary = COALESCE(?, domain_secondary),
           domain_provider = COALESCE(?, domain_provider),
           hosting_provider = COALESCE(?, hosting_provider),
           domain_expiry = COALESCE(?, domain_expiry),
           domain_cost_yearly = COALESCE(?, domain_cost_yearly),
           invoice_ref = COALESCE(?, invoice_ref),
           email_project = COALESCE(?, email_project),
           password_default = COALESCE(?, password_default),
           server_infra = COALESCE(?, server_infra),
           cms_sheets = COALESCE(?, cms_sheets),
           search_console = COALESCE(?, search_console),
           sitemap = COALESCE(?, sitemap),
           modules_json = COALESCE(?, modules_json),
           terms_json = COALESCE(?, terms_json),
           handover_date = COALESCE(?, handover_date),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [
        bast_number !== undefined ? bast_number : null,
        client_name !== undefined ? client_name : null,
        client_company !== undefined ? client_company : null,
        client_phone !== undefined ? client_phone : null,
        client_email !== undefined ? client_email : null,
        project_title !== undefined ? project_title : null,
        domain_primary !== undefined ? domain_primary : null,
        domain_secondary !== undefined ? domain_secondary : null,
        domain_provider !== undefined ? domain_provider : null,
        hosting_provider !== undefined ? hosting_provider : null,
        domain_expiry !== undefined ? domain_expiry : null,
        domain_cost_yearly !== undefined ? domain_cost_yearly : null,
        invoice_ref !== undefined ? invoice_ref : null,
        email_project !== undefined ? email_project : null,
        password_default !== undefined ? password_default : null,
        server_infra !== undefined ? server_infra : null,
        cms_sheets !== undefined ? cms_sheets : null,
        search_console !== undefined ? search_console : null,
        sitemap !== undefined ? sitemap : null,
        modules !== undefined ? JSON.stringify(modules) : null,
        terms !== undefined ? JSON.stringify(terms) : null,
        handover_date !== undefined ? handover_date : null,
        status !== undefined ? status : null,
        id,
      ]
    );

    const updated = await queryOne(c.env.DB, 'SELECT * FROM client_basts WHERE id = ?', [id]);
    return c.json({ success: true, bast: updated });
  } catch (error: any) {
    console.error('Update BAST error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/clients/basts/:id
clientsRoute.delete('/basts/:id', requireAuth('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    await execute(c.env.DB, 'DELETE FROM client_basts WHERE id = ?', [id]);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete BAST error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /api/clients/overview (Business & Financial Metrics)
clientsRoute.get('/overview', requireAuth('admin'), async (c) => {
  try {
    await ensureTables(c.env.DB);

    // 1. Total Metrics
    const totalCashInResult = await queryOne<{ total: number }>(
      c.env.DB,
      "SELECT COALESCE(SUM(amount), 0) as total FROM client_invoices WHERE status = 'paid'"
    );
    const pendingInvoicesResult = await queryOne<{ total: number }>(
      c.env.DB,
      "SELECT COALESCE(SUM(amount), 0) as total FROM client_invoices WHERE status = 'pending'"
    );
    const activeClientsCount = await queryOne<{ count: number }>(
      c.env.DB,
      "SELECT COUNT(*) as count FROM client_contacts WHERE status = 'active'"
    );
    const totalClientsCount = await queryOne<{ count: number }>(
      c.env.DB,
      "SELECT COUNT(*) as count FROM client_contacts"
    );

    // 2. Freelance 50-50 Pipeline Distribution
    const pipelineCounts = await query<{ stage_step: number; count: number }>(
      c.env.DB,
      "SELECT stage_step, COUNT(*) as count FROM client_tasks GROUP BY stage_step"
    );

    // 3. Monthly Revenue (Last 6 Months)
    const monthlyRevenue = await query<{ month: string; total: number }>(
      c.env.DB,
      `SELECT strftime('%Y-%m', issue_date) as month, COALESCE(SUM(amount), 0) as total
       FROM client_invoices
       WHERE status = 'paid'
       GROUP BY month
       ORDER BY month DESC
       LIMIT 6`
    );

    // 4. Upcoming Due Invoices
    const upcomingInvoices = await query(
      c.env.DB,
      `SELECT i.*, c.name as client_name, c.company as client_company
       FROM client_invoices i
       LEFT JOIN client_contacts c ON i.client_id = c.id
       WHERE i.status = 'pending'
       ORDER BY i.due_date ASC
       LIMIT 5`
    );

    // 5. Active Projects Status
    const ongoingTasks = await query(
      c.env.DB,
      `SELECT t.*, c.name as client_name
       FROM client_tasks t
       LEFT JOIN client_contacts c ON t.client_id = c.id
       WHERE t.status != 'done'
       ORDER BY t.created_at DESC
       LIMIT 6`
    );

    return c.json({
      success: true,
      data: {
        total_cash_in: totalCashInResult?.total || 0,
        pending_receivable: pendingInvoicesResult?.total || 0,
        active_clients: activeClientsCount?.count || 0,
        total_clients: totalClientsCount?.count || 0,
        monthly_target: 10000000, // Rp 10.000.000 default target
        pipeline: pipelineCounts || [],
        monthly_revenue: (monthlyRevenue || []).reverse(),
        upcoming_invoices: upcomingInvoices || [],
        ongoing_tasks: ongoingTasks || [],
      },
    });
  } catch (error: any) {
    console.error('Business overview fetch error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

