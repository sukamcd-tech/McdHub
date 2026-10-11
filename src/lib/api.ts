/**
 * SukaMCD / McdHub v2 - API Client
 * Berjalan otomatis pada host lokal maupun deployment Cloudflare.
 */

const API_BASE = '/api';

async function fetchJson<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || (data as any)?.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  // ── AUTH ──
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetchJson<{ success: boolean; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (payload: { name?: string; email: string; password: string }) =>
      fetchJson<{ success: boolean; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    session: () =>
      fetchJson<{ user: any; session: any }>('/auth/session'),
    logout: () =>
      fetchJson<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  },

  // ── PROJECTS ──
  projects: {
    getAll: () =>
      fetchJson<{ success: boolean; projects: any[] }>('/projects'),
    create: (data: any) =>
      fetchJson<{ success: boolean; project: any }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchJson<{ success: boolean; project: any }>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  },

  // ── ORDERS ──
  orders: {
    getAll: () =>
      fetchJson<{ success: boolean; orders: any[] }>('/orders'),
    create: (data: any) =>
      fetchJson<{ success: boolean; order: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      fetchJson<{ success: boolean; order: any }>(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`/orders/${id}`, { method: 'DELETE' }),
  },

  // ── PROMOS ──
  promos: {
    verify: (code: string) =>
      fetchJson<{ valid: boolean; promo?: any; message?: string }>(`/promos/verify/${encodeURIComponent(code)}`),
    getAll: () =>
      fetchJson<{ success: boolean; promos: any[] }>('/promos'),
    create: (data: any) =>
      fetchJson<{ success: boolean; promo: any }>('/promos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchJson<{ success: boolean; promo: any }>(`/promos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`/promos/${id}`, { method: 'DELETE' }),
  },

  // ── FEEDBACKS ──
  feedbacks: {
    getAll: () =>
      fetchJson<{ success: boolean; feedbacks: any[] }>('/feedbacks'),
    submit: (data: any) =>
      fetchJson<{ success: boolean; feedback: any }>('/feedbacks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { status?: string; priority?: string }) =>
      fetchJson<{ success: boolean; feedback: any }>(`/feedbacks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`/feedbacks/${id}`, { method: 'DELETE' }),
  },

  // ── APPS & MCDWALLET ──
  apps: {
    getReleases: (appName = 'McdWallet') =>
      fetchJson<{ success: boolean; releases: any[] }>(`/apps/releases?app=${encodeURIComponent(appName)}`),
    createRelease: (data: any) =>
      fetchJson<{ success: boolean; release: any }>('/apps/releases', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateRelease: (id: string, data: any) =>
      fetchJson<{ success: boolean; release: any }>(`/apps/releases/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteRelease: (id: string) =>
      fetchJson<{ success: boolean }>(`/apps/releases/${id}`, { method: 'DELETE' }),
    mcdwalletDownload: () =>
      fetchJson<{ success: boolean; url: string; version: string }>('/mcdwallet/download'),
    mcdwalletCount: () =>
      fetchJson<{ count: number }>('/mcdwallet/download-count'),
  },

  // ── DASHBOARD ──
  dashboard: {
    getStats: () =>
      fetchJson<{ success: boolean; data: any }>('/dashboard/stats'),
  },

  // ── LOGS ──
  logs: {
    getLogs: (limit = 50) =>
      fetchJson<{ success: boolean; logs: any[] }>(`/logs?limit=${limit}`),
    record: (data: { action: string; category?: string; description?: string; metadata?: any }) =>
      fetchJson<{ success: boolean }>('/logs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // ── PROFILE ──
  profile: {
    update: (data: any) =>
      fetchJson<{ success: boolean; profile: any }>('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updatePassword: (data: { password: string; password_confirmation: string }) =>
      fetchJson<{ success: boolean; message: string }>('/profile/password', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // ── SECURITY ──
  security: {
    getOverview: () =>
      fetchJson<{ success: boolean; data: any }>('/security/overview'),
    revokeSessions: () =>
      fetchJson<{ success: boolean }>('/security/revoke-sessions', { method: 'POST' }),
  },

  // ── MCDCrypt ──
  crypt: {
    getFiles: (parentId: string | number | null = null) =>
      fetchJson<{ success: boolean; files: any[] }>(`/mcdcrypt/files${parentId ? `?parent_id=${parentId}` : ''}`),
    createFolder: (name: string, parentId: string | number | null = null) =>
      fetchJson<{ success: boolean }>('/mcdcrypt/folders', {
        method: 'POST',
        body: JSON.stringify({ name, parent_id: parentId }),
      }),
    rename: (id: string | number, name: string) =>
      fetchJson<{ success: boolean }>(`/mcdcrypt/rename/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
      }),
    move: (id: string | number, parentId: string | number | null) =>
      fetchJson<{ success: boolean }>(`/mcdcrypt/move/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ parent_id: parentId }),
      }),
    deleteItem: (id: string | number) =>
      fetchJson<{ success: boolean }>(`/mcdcrypt/items/${id}`, { method: 'DELETE' }),
    getBreadcrumbs: (folderId: string | number | null) =>
      fetchJson<{ breadcrumbs: any[] }>(`/mcdcrypt/breadcrumbs${folderId ? `?folder_id=${folderId}` : ''}`),
  },

  // ── BACKUP ──
  backup: {
    getHistory: () =>
      fetchJson<{ success: boolean; history: any[] }>('/backup/history'),
    trigger: () =>
      fetchJson<{ success: boolean; filename: string; size: string; created_at: string }>('/backup/trigger', {
        method: 'POST',
      }),
  },

  // ── AI ──
  ai: {
    chat: (payload: { message: string; conversationId?: number; title?: string }) =>
      fetchJson<{ success: boolean; conversationId: number; message: string; actions?: any[] }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getConversations: () =>
      fetchJson<{ success: boolean; conversations: any[] }>('/ai/conversations'),
    getMessages: (conversationId: number) =>
      fetchJson<{ success: boolean; messages: any[] }>(`/ai/conversations/${conversationId}/messages`),
    deleteConversation: (conversationId: number) =>
      fetchJson<{ success: boolean }>(`/ai/conversations/${conversationId}`, { method: 'DELETE' }),
  },
};
