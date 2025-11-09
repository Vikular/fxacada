document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    window.location.href = 'auth-modal.html';
    return;
  }

  // Display user info
  document.getElementById('userName').textContent = `${user.first_name} ${user.last_name}`;
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('userTier').textContent = user.tier?.toUpperCase() || 'LEAD';

  // Load user's courses based on tier
  loadCourses(user.tier);

  // Load payment submissions
  loadPaymentSubmissions(user.user_id);

  // Load FTMO submissions
  loadFTMOSubmissions(user.user_id);
});

async function loadCourses(tier) {
  const { data: materials, error } = await supabaseClient
    .from('course_materials')
    .select('*')
    .eq('is_published', true)
    .eq('tier', tier)
    .order('module', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error loading courses:', error);
    return;
  }

  // Group by module
  const grouped = {};
  materials.forEach(m => {
    if (!grouped[m.module]) grouped[m.module] = [];
    grouped[m.module].push(m);
  });

  const container = document.getElementById('courseMaterials');
  container.innerHTML = Object.entries(grouped).map(([module, items]) => `
    <div class="module-section">
      <h3>${module}</h3>
      <div class="material-list">
        ${items.map(item => `
          <div class="material-item">
            <span class="material-icon">${item.content_type === 'video' ? '🎥' : item.content_type === 'pdf' ? '📄' : '📝'}</span>
            <div class="material-info">
              <h4>${item.title}</h4>
              <p>${item.description || ''}</p>
            </div>
            <a href="${item.content_url}" target="_blank" class="btn btn-secondary btn-small">View</a>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

async function loadPaymentSubmissions(userId) {
  const { data, error } = await supabaseClient
    .from('payment_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error loading payments:', error);
    return;
  }

  const container = document.getElementById('paymentHistory');
  container.innerHTML = data.map(p => `
    <div class="submission-item">
      <div>
        <strong>${p.tier.toUpperCase()}</strong> - $${p.amount}
        <br><span class="small">${new Date(p.submitted_at).toLocaleDateString()}</span>
      </div>
      <span class="pill pill-${p.status}">${p.status.toUpperCase()}</span>
    </div>
  `).join('') || '<p>No payment submissions yet.</p>';
}

async function loadFTMOSubmissions(userId) {
  const { data, error } = await supabaseClient
    .from('ftmo_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error loading FTMO:', error);
    return;
  }

  const container = document.getElementById('ftmoHistory');
  container.innerHTML = data.map(f => `
    <div class="submission-item">
      <div>
        <strong>${f.challenge_type}</strong>
        <br><span class="small">${new Date(f.submitted_at).toLocaleDateString()}</span>
      </div>
      <span class="pill pill-${f.status}">${f.status.toUpperCase()}</span>
    </div>
  `).join('') || '<p>No FTMO submissions yet.</p>';
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}