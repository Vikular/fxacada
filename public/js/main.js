// ============================================
// SUPABASE CONFIGURATION
// ============================================
// ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES FROM SUPABASE DASHBOARD
const SUPABASE_URL = 'https://dgbfqtmffgkamfgskkks.supabase.co'; // Get from Settings → API
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ'; // Get from Settings → API → anon/public key

// Initialize Supabase client (loaded from CDN in index.html)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// API Base URL for Edge Functions
const API_BASE = `${SUPABASE_URL}/functions/v1/make-server-0991178c`;

// ============================================
// APP INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ App initialized');
    
    // Test API connection
    testAPIHealth();
    
    // Check if user is already logged in
    checkAuthStatus();
    
    // Setup form handlers
    setupFormHandlers();
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
    
    // Auth functions
    handleStudentLogin,
    handleAdminLogin,
    handleSignup,
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