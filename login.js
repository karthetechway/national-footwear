// ============================================================
//  NATIONAL FOOTWEAR — Customer Authentication Logic
//  Firebase Authentication Integration
// ============================================================

let auth;
let mode = 'login'; // login or signup

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = firebase.initializeApp(FIREBASE_CONFIG);
        auth = firebase.auth();
        
        // Listen for auth state
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log("Customer logged in:", user.email);
                // Redirect to store if already logged in or after successful login
                if (window.location.pathname.includes('login.html')) {
                    setTimeout(() => window.location.href = 'index.html', 1500);
                }
            }
        });
    } catch (e) {
        console.error("Firebase Auth initialization failed:", e);
        showAuthError("Authentication service is currently unavailable. Please try again later.");
    }
});

// ===== UI HELPERS =====
function switchMode(newMode) {
    mode = newMode;
    const isLogin = mode === 'login';
    
    // Update tabs
    document.getElementById('tabLogin').classList.toggle('active', isLogin);
    document.getElementById('tabSign').classList.toggle('active', !isLogin);
    
    // Update Titles
    document.getElementById('loginTitle').style.display = isLogin ? 'block' : 'none';
    document.getElementById('signUpTitle').style.display = isLogin ? 'none' : 'block';
    
    // Update Fields
    document.getElementById('signUpFields').style.display = isLogin ? 'none' : 'block';
    
    // Update Button
    document.getElementById('authBtnText').textContent = isLogin ? 'Sign In' : 'Create Account';
    
    // Toggle Forgot Password Link
    const forgotLink = document.getElementById('forgotPassLink');
    if (forgotLink) forgotLink.style.display = isLogin ? 'inline-block' : 'none';
    
    // Clear errors
    clearError();
}

function showAuthError(msg) {
    const errEl = document.getElementById('authError');
    if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = 'block';
    }
}

function clearError() {
    const errEl = document.getElementById('authError');
    if (errEl) errEl.style.display = 'none';
}

// ===== AUTH ACTIONS =====
async function handleAuth() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPass').value;
    const name = document.getElementById('authName').value.trim();
    const btn = document.getElementById('authBtn');
    const spinner = document.getElementById('btnSpinner');
    const btnText = document.getElementById('authBtnText');

    if (!email || !password) return;
    if (mode === 'signup' && !name) { showAuthError("Please enter your full name."); return; }

    // Loading state
    btn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    clearError();

    try {
        if (mode === 'login') {
            await auth.signInWithEmailAndPassword(email, password);
            showToast("Login successful! Redirecting...");
        } else {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update profile with name
            await user.updateProfile({ displayName: name });
            showToast("Account created successfully! Welcome.");
        }
    } catch (error) {
        console.error("Auth error:", error);
        let msg = "Authentication failed. Please check your credentials.";
        
        switch (error.code) {
            case 'auth/email-already-in-use': msg = "This email is already registered."; break;
            case 'auth/invalid-email': msg = "Please enter a valid email address."; break;
            case 'auth/weak-password': msg = "Password should be at least 6 characters."; break;
            case 'auth/user-not-found': msg = "No account found with this email."; break;
            case 'auth/wrong-password': msg = "Incorrect password. Please try again."; break;
            case 'auth/too-many-requests': msg = "Too many failed attempts. Try again later."; break;
        }
        showAuthError(msg);
        btn.disabled = false;
        btnText.style.display = 'block';
        spinner.style.display = 'none';
    }
}

// ===== FORGOT PASSWORD =====
function openForgotPass() {
    document.getElementById('forgotModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeForgotPass() {
    document.getElementById('forgotModal').style.display = 'none';
    document.body.style.overflow = '';
}

async function handleReset() {
    const email = document.getElementById('resetEmail').value.trim();
    if (!email) { alert("Please enter your email"); return; }

    try {
        await auth.sendPasswordResetEmail(email);
        alert("Password reset link has been sent to your email! 📧");
        closeForgotPass();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// ===== GLOBAL HELPERS =====
function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}
