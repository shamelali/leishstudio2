import { supabaseClient, getDaysAhead, openWhatsApp, PRICING_MAP } from './utils.js';

export function initBooking({ whatsappNumber, onKPIUpdate }) {
  const dateSelect = document.getElementById('bookDate');
  const timeSelect = document.getElementById('bookTime');
  const statusEl = document.getElementById('status');
  const checkBtn = document.getElementById('checkBtn');

  // Populate date select
  function initDates() {
    dateSelect.innerHTML = "";
    const days = getDaysAhead(7);
    for (const d of days) {
      dateSelect.add(new Option(d.label, d.value));
    }
  }

  // Populate times 9:00–21:00, skip past times for today
  function updateTimes() {
    const now = new Date();
    const selected = new Date(`${dateSelect.value}T00:00:00`);
    const isToday = now.toISOString().split('T')[0] === dateSelect.value;

    timeSelect.innerHTML = "";
    for (let h = 9; h <= 21; h++) {
      if (isToday && h <= now.getHours()) continue;
      const label = h >= 12 ? `${h === 12 ? 12 : h-12}:00 PM` : `${h}:00 AM`;
      const value = `${String(h).padStart(2, '0')}:00`;
      timeSelect.add(new Option(label, value));
    }
  }

  async function refreshKPIs() {
    const { data, error } = await supabaseClient().from('bookings').select('*');
    if (error) return;

    const totalBookings = data.length;
    const last7DaysStart = new Date();
    last7DaysStart.setDate(last7DaysStart.getDate() - 7);

    const last7 = data.filter(b => new Date(b.start_time) >= last7DaysStart);
    const totalHoursBooked7d = last7.reduce((sum, b) => {
      const durHrs = (new Date(b.end_time) - new Date(b.start_time)) / 3600000;
      return sum + durHrs;
    }, 0);

    const utilization = Math.round((totalHoursBooked7d / (7 * 12)) * 100); // 9–21 => 12h/day
    const revenue7d = last7.reduce((sum, b) => {
      const durHrs = (new Date(b.end_time) - new Date(b.start_time)) / 3600000;
      const price = PRICING_MAP[durHrs] ?? Math.round(durHrs * 50);
      return sum + price;
    }, 0);

    const satisfaction = 98; // placeholder until feedback table exists

    if (typeof onKPIUpdate === 'function') {
      onKPIUpdate({ totalBookings, utilization, satisfaction });
    }

    // Optionally display revenue in client-facing ticker later
    console.debug('KPI last7d:', { totalBookings, utilization, revenue7d, satisfaction });
  }

  async function handleBooking() {
    const name = document.getElementById('muaName').value.trim();
    const space = document.getElementById('spaceSelect').value;
    const date = dateSelect.value;
    const time = timeSelect.value;
    const dur = parseInt(document.getElementById('duration').value, 10);

    // Inline validation
    if (!name) { statusEl.textContent = "Please enter MUA name."; return; }
    if (!space || !date || !time || !dur) { statusEl.textContent = "Please complete all fields."; return; }

    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + (dur * 3600000) + (15 * 60000)); // add 15 mins buffer

    // Conflict check: booking overlaps if (existing.start < end) AND (existing.end > start)
    const { data: conflicts, error: conflictErr } = await supabaseClient()
      .from('bookings')
      .select('*')
      .or(`space_name.eq.${space},space_name.eq.Full House`)
      .lt('start_time', end.toISOString())
      .gt('end_time', start.toISOString());

    if (conflictErr) {
      statusEl.textContent = "Error checking availability.";
      return;
    }

    if (conflicts && conflicts.length > 0) {
      statusEl.textContent = "❌ Slot Occupied.";
      return;
    }

    // Insert booking
    const { error: insertErr } = await supabaseClient().from('bookings').insert([{
      client_name: name,
      space_name: space,
      start_time: start.toISOString(),
      end_time: end.toISOString()
    }]);

    if (insertErr) {
      statusEl.textContent = "Error creating booking.";
      return;
    }

    statusEl.textContent = "✅ Available — opening WhatsApp...";
    const msg = [
      '✨ Leish Studio Booking ✨',
      `Name: ${name}`,
      `Space: ${space}`,
      `Date: ${date}`,
      `Time: ${time}`,
      `Duration: ${dur} hrs`
    ].join('\n');

    openWhatsApp(whatsappNumber, msg);
    refreshKPIs();
  }

  initDates();
  updateTimes();
  refreshKPIs();

  dateSelect.addEventListener('change', updateTimes);
  checkBtn.addEventListener('click', handleBooking);
}
