// ============================================
// SUPABASE CONFIGURATION
// ============================================
// ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES FROM SUPABASE DASHBOARD
const SUPABASE_URL = 'https://dgbfqtmffgkamfgskkks.supabase.co'; // Get from Settings → API
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ'; // Get from Settings → API → anon/public key

// Initialize Supabase client (loaded from CDN in index.html)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// API Base URL for Edge Functions
const API_BASE = "http://localhost:4000/auth";

// ============================================
// APP INITIALIZATION
// ============================================
// Config and default placeholder payment settings (fallback if DB not available)
const APP_CONFIG = {
    hideCryptoUntilReal: true,
};

// Default placeholder payment settings (fallback if DB not available)
const DEFAULT_PAYMENT_SETTINGS = {
    bank: {
        label: 'Bank Transfer Details',
        address: 'TO_BE_SET - Bank Name\nAccount Name: TO_BE_SET\nAccount Number: TO_BE_SET\nSWIFT/BIC: TO_BE_SET'
    },
    paypal: {
        label: 'PayPal Email',
        address: 'TO_BE_SET@example.com'
    },
    crypto: [
        { chain: 'BTC', label: 'Bitcoin (BTC)', address: 'TO_BE_SET_BTC_ADDRESS' },
        { chain: 'ETH', label: 'Ethereum (ETH)', address: 'TO_BE_SET_ETH_ADDRESS' },
        { chain: 'USDT-ERC20', label: 'USDT (ERC20)', address: 'TO_BE_SET_USDT_ERC20' },
        { chain: 'USDT-TRC20', label: 'USDT (TRC20)', address: 'TO_BE_SET_USDT_TRC20' }
    ]
};

let paymentSettingsCache = null;

async function loadPaymentSettings() {
    // Try to fetch from Supabase payment_settings table; otherwise fallback to defaults
    try {
        const client = (window.app && window.app.supabase) ? window.app.supabase : (typeof supabase !== 'undefined' ? supabase : null);
        if (!client) throw new Error('Supabase not initialized');
        const { data, error } = await client
            .from('payment_settings')
            .select('method, chain, label, address, is_active')
            .eq('is_active', true);
        if (error) throw error;

        const grouped = { bank: null, paypal: null, crypto: [] };
        (data || []).forEach(row => {
            if (row.method === 'bank') grouped.bank = { label: row.label || 'Bank Transfer', address: row.address };
            else if (row.method === 'paypal') grouped.paypal = { label: row.label || 'PayPal', address: row.address };
            else if (row.method === 'crypto') grouped.crypto.push({ chain: row.chain || 'CRYPTO', label: row.label || row.chain, address: row.address });
        });

        // Fallbacks if missing any
        paymentSettingsCache = {
            bank: grouped.bank || DEFAULT_PAYMENT_SETTINGS.bank,
            paypal: grouped.paypal || DEFAULT_PAYMENT_SETTINGS.paypal,
            crypto: (grouped.crypto && grouped.crypto.length > 0) ? grouped.crypto : DEFAULT_PAYMENT_SETTINGS.crypto
        };
    } catch (e) {
        console.warn('Using default payment settings:', e.message);
        paymentSettingsCache = { ...DEFAULT_PAYMENT_SETTINGS };
    }
    return paymentSettingsCache;
}

function formatAddressMultiline(text) {
    const div = document.createElement('div');
    (text || '').split('\n').forEach(line => {
        const p = document.createElement('div');
        p.textContent = line;
        div.appendChild(p);
    });
    return div.innerHTML;
}

function initPaymentInstructions() {
    const methodSelect = document.getElementById('paymentMethod');
    const container = document.getElementById('paymentInstructions');
    if (!methodSelect || !container) return;

    const url = new URL(window.location.href);
    const forceShowCrypto = url.searchParams.get('showCrypto') === '1';

    const updateCryptoOptionVisibility = (settings) => {
        const cryptoOpt = methodSelect.querySelector('option[value="crypto"]');
        if (!cryptoOpt) return;
        if (forceShowCrypto) {
            cryptoOpt.hidden = false;
            return;
        }
        const hasReal = (settings.crypto || []).some(c => c.address && !String(c.address).includes('TO_BE_SET'));
        const shouldHide = APP_CONFIG.hideCryptoUntilReal && !hasReal;
        cryptoOpt.hidden = shouldHide;
        if (shouldHide && methodSelect.value === 'crypto') {
            methodSelect.value = '';
            container.innerHTML = '';
        }
    };

    const render = (settings, method) => {
        if (!settings) return;
        if (method === 'bank') {
            container.innerHTML = `
                <div class="note">
                    <strong>${settings.bank.label}</strong>
                    <div class="small" style="margin-top:6px; white-space:pre-line;">${settings.bank.address}</div>
                </div>`;
        } else if (method === 'paypal') {
            container.innerHTML = `
                <div class="note">
                    <strong>${settings.paypal.label}</strong>
                    <div class="small" style="margin-top:6px;">${settings.paypal.address}</div>
                </div>`;
        } else if (method === 'crypto') {
            const rows = settings.crypto.map((c, idx) => `
                <div class="card" style="padding:12px; margin-top:8px;">
                    <div style="font-weight:600;">${c.label}</div>
                    <div class="small" style="word-break:break-all;">${c.address}</div>
                    <div class="row" style="display:flex; gap:8px; margin-top:8px;">
                        <button type="button" class="btn btn-secondary" data-copy="${c.address}">Copy</button>
                        <button type="button" class="btn" data-qr="qr-${idx}">Show QR</button>
                    </div>
                    <div id="qr-${idx}" class="qr" style="display:none; margin-top:10px;"></div>
                </div>`).join('');
            container.innerHTML = `
                <div class="note">
                    <strong>Crypto Wallet Addresses</strong>
                    <div class="small" style="margin-top:6px;">Use the correct network. After payment, enter the Transaction ID and upload your receipt.</div>
                </div>
                ${rows}`;
            // Attach copy handlers
            container.querySelectorAll('[data-copy]').forEach(btn => {
                btn.addEventListener('click', () => {
                    navigator.clipboard.writeText(btn.getAttribute('data-copy'));
                    btn.textContent = 'Copied!';
                    setTimeout(() => btn.textContent = 'Copy', 1200);
                });
            });
            // Attach QR handlers (lazy-generate)
            container.querySelectorAll('[data-qr]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.getAttribute('data-qr');
                    const box = document.getElementById(targetId);
                    if (!box) return;
                    const addressEl = btn.closest('.card').querySelector('[data-copy]');
                    const address = addressEl ? addressEl.getAttribute('data-copy') : '';
                    if (box.childElementCount === 0 && window.QRCode) {
                        // Prefer schema for BTC addresses
                        const label = btn.closest('.card').querySelector('div[style*="font-weight:600;"]').textContent || '';
                        let payload = address;
                        if (/bitcoin|btc/i.test(label)) payload = `bitcoin:${address}`;
                        new QRCode(box, { text: payload, width: 160, height: 160 });
                    }
                    box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
                    btn.textContent = box.style.display === 'block' ? 'Hide QR' : 'Show QR';
                });
            });
        } else {
            container.innerHTML = '';
        }
    };

    // Initial load
    loadPaymentSettings().then(settings => {
        updateCryptoOptionVisibility(settings);
        render(settings, methodSelect.value);
    });
    // On change
    methodSelect.addEventListener('change', async () => {
        const settings = paymentSettingsCache || await loadPaymentSettings();
        render(settings, methodSelect.value);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ App initialized');
    
    // Test API connection
    testAPIHealth();
    
    // Check if user is already logged in
    checkAuthStatus();
    
    // Setup form handlers
    setupFormHandlers();

    // Initialize payment instructions if on submit-payment page
    initPaymentInstructions();
});

// ============================================
// API HEALTH CHECK
// ============================================
async function testAPIHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Connected:', data);
        } else {
            console.warn('⚠️ API not responding yet. Deploy Edge Function first.');
        }
    } catch (error) {
        console.warn('⚠️ API Error:', error.message);
        console.log('💡 Deploy Edge Function to fix this.');
    }
}

// ============================================
// AUTHENTICATION STATUS
// ============================================
function checkAuthStatus() {
    const userToken = localStorage.getItem('userToken');
    const adminToken = localStorage.getItem('adminToken');
    
    if (userToken) {
        console.log('✅ User logged in');
        // Optionally redirect to dashboard if on login page
        if (window.location.pathname.includes('auth-modal.html')) {
            window.location.href = 'student.html';
        }
    }
    
    if (adminToken) {
        console.log('✅ Admin logged in');
        // Optionally redirect to admin dashboard
        if (window.location.pathname.includes('admin-login.html')) {
            window.location.href = 'admin.html';
        }
    }
}

// ============================================
// FORM HANDLERS
// ============================================
function setupFormHandlers() {
    // Student Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleStudentLogin);
    }
    
    // Admin Login Form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Enrollment Form
    const enrollmentForm = document.getElementById('enrollmentForm');
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', handleEnrollment);
    }
    
    // Payment Submission Form
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmission);
    }
    
    // FTMO Submission Form
    const ftmoForm = document.getElementById('ftmoForm');
    if (ftmoForm) {
        ftmoForm.addEventListener('submit', handleFTMOSubmission);
    }
    
    // Logout buttons
    const logoutButtons = document.querySelectorAll('[data-logout]');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', logout);
    });
}

// ============================================
// STUDENT LOGIN
// ============================================
async function handleStudentLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    
    // Clear previous messages
    if (errorMsg) errorMsg.style.display = 'none';
    if (successMsg) successMsg.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store credentials
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userName', data.firstName);
            localStorage.setItem('userTier', data.tier);
            
            console.log('✅ Login successful:', data.email);
            
            if (successMsg) {
                successMsg.textContent = 'Login successful! Redirecting...';
                successMsg.style.display = 'block';
            }
            
            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = 'student.html';
            }, 1000);
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        if (errorMsg) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        } else {
            alert('Login failed: ' + error.message);
        }
    }
}

// ============================================
// ADMIN LOGIN
// ============================================
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const adminLevel = document.getElementById('adminLevel').value;
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    
    if (errorMsg) errorMsg.style.display = 'none';
    if (successMsg) successMsg.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE}/auth/admin-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email, 
                password, 
                requestedRole: adminLevel 
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store admin credentials
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminRole', data.role);
            localStorage.setItem('adminEmail', data.email);
            localStorage.setItem('adminName', data.firstName);
            
            console.log('✅ Admin login successful:', data.email);
            
            if (successMsg) {
                successMsg.textContent = 'Login successful! Redirecting...';
                successMsg.style.display = 'block';
            }
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            throw new Error(data.error || 'Admin login failed');
        }
    } catch (error) {
        console.error('❌ Admin login error:', error);
        if (errorMsg) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        } else {
            alert('Admin login failed: ' + error.message);
        }
    }
}

// ============================================
// ENROLLMENT
// ============================================
async function handleEnrollment(event) {
    event.preventDefault();
    
    const successMsg = document.getElementById('successMsg');
    const errorMsg = document.getElementById('errorMsg');
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    // Clear previous messages
    if (errorMsg) errorMsg.style.display = 'none';
    if (successMsg) successMsg.style.display = 'none';
    
    // Show loading state
    if (window.interactions && window.interactions.showButtonLoading) {
        window.interactions.showButtonLoading(submitBtn);
    }
    
    // Get selected tier
    const tierRadio = document.querySelector('input[name="tier"]:checked');
    const tier = tierRadio ? tierRadio.value : 'starter';
    
    // Get form data
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const country = document.getElementById('country').value;
    const password = document.getElementById('password').value;
    const experience = document.getElementById('experience').value;
    const goals = document.getElementById('goals').value.trim();
    
    // Split full name
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];
    
    try {
        // Check if email already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();
        
        if (existingUser) {
            throw new Error('An account with this email already exists. Please login instead.');
        }
        
        // Insert new enrollment
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    email: email,
                    password_hash: password, // TODO: Hash in production
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    country: country,
                    tier: tier,
                    experience_level: experience,
                    goals: goals,
                    role: 'student',
                    payment_status: 'pending',
                    is_active: true,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Enrollment successful:', data);
        
        if (successMsg) {
            successMsg.textContent = '🎉 Enrollment successful! You can now login with your credentials.';
            successMsg.style.display = 'block';
        }
        
        // Reset form
        event.target.reset();
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'auth-modal.html?enrolled=true';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Enrollment error:', error);
        if (errorMsg) {
            errorMsg.textContent = '❌ ' + error.message;
            errorMsg.style.display = 'block';
        } else {
            alert('Enrollment failed: ' + error.message);
        }
    } finally {
        // Hide loading state
        if (window.interactions && window.interactions.hideButtonLoading) {
            window.interactions.hideButtonLoading(submitBtn);
        }
    }
}

// ============================================
// SIGNUP
// ============================================
async function handleSignup(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    try {
        // Insert new user directly into Supabase
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    email: email,
                    password_hash: password, // In production, hash this!
                    first_name: firstName,
                    last_name: lastName,
                    role: 'lead',
                    is_active: true
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Signup successful:', data);
        alert('Account created! Please login.');
        window.location.href = 'auth-modal.html';
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        alert('Signup failed: ' + error.message);
    }
}

// ============================================
// PAYMENT SUBMISSION
// ============================================
async function handlePaymentSubmission(event) {
    event.preventDefault();
    
    const userId = localStorage.getItem('userId');
    const tier = document.getElementById('tier').value;
    const amount = document.getElementById('amount').value;
    const proofUrl = document.getElementById('proofUrl').value;
    const notes = document.getElementById('notes').value;
    
    if (!userId) {
        alert('Please login first');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('payment_submissions')
            .insert([
                {
                    user_id: userId,
                    tier: tier,
                    amount: parseFloat(amount),
                    proof_url: proofUrl,
                    notes: notes,
                    status: 'pending'
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Payment submitted:', data);
        alert('Payment proof submitted successfully! We will review it shortly.');
        event.target.reset();
        
    } catch (error) {
        console.error('❌ Payment submission error:', error);
        alert('Submission failed: ' + error.message);
    }
}

// ============================================
// FTMO SUBMISSION
// ============================================
async function handleFTMOSubmission(event) {
    event.preventDefault();
    
    const userId = localStorage.getItem('userId');
    const challengeType = document.getElementById('challengeType').value;
    const proofUrl = document.getElementById('proofUrl').value;
    const notes = document.getElementById('notes').value;
    
    if (!userId) {
        alert('Please login first');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('ftmo_submissions')
            .insert([
                {
                    user_id: userId,
                    challenge_type: challengeType,
                    proof_url: proofUrl,
                    notes: notes,
                    status: 'pending'
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ FTMO submitted:', data);
        alert('FTMO proof submitted successfully! We will review it shortly.');
        event.target.reset();
        
    } catch (error) {
        console.error('❌ FTMO submission error:', error);
        alert('Submission failed: ' + error.message);
    }
}

// ============================================
// FETCH DATA FUNCTIONS (For Admin Dashboard)
// ============================================
async function fetchAllUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const data = await response.json();
        console.log('✅ Users loaded:', data.length);
        return data;
        
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        return [];
    }
}

async function fetchPendingFTMO() {
    try {
        const response = await fetch(`${API_BASE}/admin/ftmo/pending`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch FTMO submissions');
        
        const data = await response.json();
        console.log('✅ FTMO submissions loaded:', data.length);
        return data;
        
    } catch (error) {
        console.error('❌ Error fetching FTMO:', error);
        return [];
    }
}

async function fetchPendingPayments() {
    try {
        const response = await fetch(`${API_BASE}/admin/payments/pending`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch payments');
        
        const data = await response.json();
        console.log('✅ Payments loaded:', data.length);
        return data;
        
    } catch (error) {
        console.error('❌ Error fetching payments:', error);
        return [];
    }
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all stored data
        localStorage.removeItem('userToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('adminName');
        localStorage.removeItem('userTier');
        
        console.log('✅ Logged out');
        window.location.href = 'index.html';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function isAuthenticated() {
    return !!(localStorage.getItem('userToken') || localStorage.getItem('adminToken'));
}

function isAdmin() {
    const role = localStorage.getItem('adminRole');
    return role === 'super-admin' || role === 'limited-admin';
}

function getUserInfo() {
    return {
        userId: localStorage.getItem('userId'),
        email: localStorage.getItem('userEmail'),
        name: localStorage.getItem('userName'),
        role: localStorage.getItem('userRole'),
        tier: localStorage.getItem('userTier')
    };
}

// ============================================
// EXPORT FOR USE IN OTHER FILES
// ============================================
window.app = {
    supabase,
    API_BASE,
    SUPABASE_URL,
    config: APP_CONFIG,
    // Payment
    loadPaymentSettings,
    get paymentSettings() { return paymentSettingsCache; },
    
    // Auth functions
    handleStudentLogin,
    handleAdminLogin,
    handleSignup,
    handleEnrollment,
    logout,
    isAuthenticated,
    isAdmin,
    getUserInfo,
    
    // Data functions
    fetchAllUsers,
    fetchPendingFTMO,
    fetchPendingPayments,
    handlePaymentSubmission,
    handleFTMOSubmission,
    
    // Utility
    testAPIHealth
};

console.log('✅ Main.js loaded. App object available globally.');