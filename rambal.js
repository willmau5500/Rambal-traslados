// ============================================================
// RAMBAL - Configuración y utilidades compartidas
// ============================================================

const SUPA_URL = 'https://glprwcufdhrdvxgwpage.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscHJ3Y3VmZGhyZHZ4Z3dwYWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODc3NjEsImV4cCI6MjA4OTQ2Mzc2MX0.Nhk7wMznJumjGaATD3qYDkH8MTGuylPQjdLcDZDNA_M';

// ── Auth ─────────────────────────────────────────────────────
function getUser() {
  const u = sessionStorage.getItem('rambal_user');
  return u ? JSON.parse(u) : null;
}

function requireAuth() {
  const u = getUser();
  if (!u) { window.location.href = 'login.html'; return null; }
  return u;
}

function logout() {
  sessionStorage.removeItem('rambal_user');
  window.location.href = 'login.html';
}

// ── Supabase fetch ────────────────────────────────────────────
async function supaFetch(path, opts = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || 'return=representation',
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const e = await res.text();
    throw new Error(e);
  }
  return res.json().catch(() => null);
}

async function supaGet(table, query = '') {
  return supaFetch(`${table}?${query}`);
}

async function supaPost(table, body) {
  return supaFetch(table, { method: 'POST', body: JSON.stringify(body) });
}

async function supaPatch(table, query, body) {
  return supaFetch(`${table}?${query}`, { method: 'PATCH', body: JSON.stringify(body) });
}

async function supaDelete(table, query) {
  return supaFetch(`${table}?${query}`, { method: 'DELETE' });
}

// ── SHA256 ───────────────────────────────────────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Utilidades ───────────────────────────────────────────────
function fmtFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' })
    + ' ' + d.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' });
}

function fmtNum(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('es-CO');
}

function nextCodigo(lista) {
  if (!lista || lista.length === 0) return 'TRL-0001';
  const nums = lista.map(t => parseInt((t.codigo||'TRL-0000').split('-')[1]||0));
  return `TRL-${String(Math.max(...nums) + 1).padStart(4, '0')}`;
}

const ESTADOS = {
  borrador:                  { label: 'Borrador',              color: '#6B7280', bg: '#F3F4F6', icon: '📝' },
  en_transito:               { label: 'En Tránsito',           color: '#D97706', bg: '#FEF3C7', icon: '🚚' },
  recibido:                  { label: 'Recibido',              color: '#059669', bg: '#D1FAE5', icon: '✅' },
  recibido_con_diferencias:  { label: 'Con Diferencias',       color: '#DC2626', bg: '#FEE2E2', icon: '⚠️' },
  anulado:                   { label: 'Anulado',               color: '#9CA3AF', bg: '#F9FAFB', icon: '🚫' },
};

const ROLES = {
  admin:                  'Administrador',
  operario_planta:        'Supernumerario',
  bodeguero:              'Oficial de Logística',
  asistente_operaciones:  'Asistente Operaciones',
};

function badgeEstado(estado) {
  const e = ESTADOS[estado] || { label: estado, color: '#6B7280', bg: '#F3F4F6' };
  return `<span class="badge" style="background:${e.bg};color:${e.color}">${e.icon} ${e.label}</span>`;
}

// ── Sidebar renderer ─────────────────────────────────────────
function renderSidebar(activePage) {
  const user = getUser();
  if (!user) return;

  const navItems = [
    { key: 'dashboard',   href: 'dashboard.html',   icon: '▦',  label: 'Dashboard' },
    { key: 'traslados',   href: 'traslados.html',   icon: '🚚', label: 'Traslados' },
    { key: 'productos',   href: 'productos.html',   icon: '📦', label: 'Productos' },
    { key: 'reportes',    href: 'reportes.html',    icon: '📊', label: 'Reportes' },
    { key: 'trazabilidad',href: 'trazabilidad.html',icon: '🔍', label: 'Trazabilidad' },
    ...(user.rol === 'admin' ? [{ key: 'usuarios', href: 'usuarios.html', icon: '👥', label: 'Usuarios' }] : [])
  ];

  const nav = navItems.map(item => `
    <a href="${item.href}" class="nav-link ${activePage === item.key ? 'active' : ''}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
    </a>
  `).join('');

  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-logo" style="padding:20px 20px 16px;">
      <img src="logo-rambal.png" alt="Rambal"
        style="height:32px;object-fit:contain;max-width:150px;display:block;"
        onerror="this.style.display='none';document.getElementById('sb-logo-fallback').style.display='flex'">
      <div id="sb-logo-fallback" style="display:none;align-items:center;gap:10px;">
        <div class="logo-icon-sb">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div>
          <div class="sb-name">Rambal</div>
          <div class="sb-sub">Traslados</div>
        </div>
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:5px;letter-spacing:.5px;">SISTEMA DE TRASLADOS</div>
    </div>
    <nav class="sidebar-nav">${nav}</nav>
    <div class="sidebar-footer">
      <div class="sf-route">
        <span class="sf-dot yellow"></span>
        <span>Planta</span>
        <span class="sf-arrow">→</span>
        <span class="sf-dot green"></span>
        <span>Bodega</span>
      </div>
      <div class="sf-user">
        <div class="sf-avatar">${user.nombre[0].toUpperCase()}</div>
        <div>
          <div class="sf-uname">${user.nombre}</div>
          <div class="sf-urol">${ROLES[user.rol] || user.rol}</div>
        </div>
      </div>
      <button class="sf-logout" onclick="logout()">Cerrar sesión</button>
    </div>
  `;
}

// ── Toast ─────────────────────────────────────────────────────
function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${type === 'ok' ? '✓' : '✕'}</span> ${msg}`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3000);
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
