const users = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  email: `user${i + 1}@mail.com`,
  name: `User ${i + 1}`,
  tier: ['starter', 'core', 'pro'][i % 3],
  status: i % 5 === 0 ? 'inactive' : 'active'
}));

function render(rows) {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = rows.map(u => `
    <tr>
      <td>${u.email}</td>
      <td>${u.name}</td>
      <td><span class="pill">${u.tier.toUpperCase()}</span></td>
      <td>${u.status}</td>
    </tr>
  `).join('');
}

function applyFilters() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const tier = document.getElementById('tier').value;
  const filtered = users.filter(u =>
    (!q || u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)) &&
    (!tier || u.tier === tier)
  );
  render(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  render(users);
  document.getElementById('search')?.addEventListener('input', applyFilters);
  document.getElementById('tier')?.addEventListener('change', applyFilters);
});