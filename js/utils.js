let _supabaseClient;

/**
 * Initialize Supabase client once, shared by modules.
 */
export function initSupabase(url, key) {
  if (!url || !key) {
    console.warn('Supabase URL/Key missing. Set window.LEISH.SUPABASE_URL/KEY.');
  }
  _supabaseClient = window.supabase.createClient(url, key);
}

/**
 * Get supabase client instance.
 */
export function supabaseClient() {
  if (!_supabaseClient) throw new Error('Supabase not initialized.');
  return _supabaseClient;
}

/**
 * Format date to ISO yyyy-mm-dd
 */
export function fmtDateISO(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Label like Mon, 29 Dec
 */
export function fmtDateLabel(date) {
  return date.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * Get an array of {label, value} for next N days
 */
export function getDaysAhead(n = 7) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({ label: fmtDateLabel(d), value: fmtDateISO(d) });
  }
  return days;
}

/**
 * Open WhatsApp with structured message
 */
export function openWhatsApp(number, text) {
  const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  window.open(url);
}

/**
 * Simple CSV export
 */
export function exportCSV(filename, rows) {
  const processRow = (row) =>
    row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
  const csv = rows.map(processRow).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Pricing map
 */
export const PRICING_MAP = {
  1: 50,
  2: 100,
  4: 160,
  8: 300
};