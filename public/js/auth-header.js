/**
 * Shared Auth Header Management
 * Include this script on any page that needs auth state management
 */

let currentUser = null;

async function checkAuthState() {
    try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await response.json();
        
        if (data.user) {
            currentUser = data.user;
            showUserMenu();
        } else {
            showGuestActions();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showGuestActions();
    }
}

function showUserMenu() {
    const guestActions = document.getElementById('guestActions');
    const userMenu = document.getElementById('userMenu');
    
    if (guestActions) guestActions.style.display = 'none';
    if (userMenu) userMenu.classList.add('active');
    
    // Update user info
    const name = currentUser.name || currentUser.email.split('@')[0];
    const initial = name.charAt(0).toUpperCase();
    
    const userInitial = document.getElementById('userInitial');
    const userDisplayName = document.getElementById('userDisplayName');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    
    if (userInitial) userInitial.textContent = initial;
    if (userDisplayName) userDisplayName.textContent = name;
    if (dropdownUserName) dropdownUserName.textContent = name;
    if (dropdownUserEmail) dropdownUserEmail.textContent = currentUser.email;
    
    // Show admin badge and section if admin
    if (currentUser.role === 'admin') {
        const adminBadge = document.getElementById('adminBadge');
        const adminSection = document.getElementById('adminSection');
        const courseSection = document.getElementById('courseSection');
        
        if (adminBadge) adminBadge.style.display = 'inline-block';
        if (adminSection) adminSection.style.display = 'block';
        if (courseSection) courseSection.style.display = 'block';
    }
    
    // Check for course access
    checkCourseAccess();
}

function showGuestActions() {
    const guestActions = document.getElementById('guestActions');
    const userMenu = document.getElementById('userMenu');
    
    if (guestActions) guestActions.style.display = 'flex';
    if (userMenu) userMenu.classList.remove('active');
}

async function checkCourseAccess() {
    try {
        const response = await fetch('/api/my/courses', { credentials: 'include' });
        const data = await response.json();
        if (data.courses && data.courses.length > 0) {
            let hasAnyCourse = false;
            
            // Check for smartwatch course access
            const hasSmartwatch = data.courses.some(c => c.id === 'smartwatch-course');
            if (hasSmartwatch) {
                const smartwatchLink = document.getElementById('smartwatchCourseLink');
                if (smartwatchLink) smartwatchLink.style.display = 'flex';
                hasAnyCourse = true;
            }
            
            // Check for ballbeam course access
            const hasBallbeam = data.courses.some(c => c.id === 'ballbeam-course');
            if (hasBallbeam) {
                const ballbeamLink = document.getElementById('ballbeamCourseLink');
                if (ballbeamLink) ballbeamLink.style.display = 'flex';
                hasAnyCourse = true;
            }
            
            // Show course section if user has any course access
            if (hasAnyCourse) {
                const courseSection = document.getElementById('courseSection');
                if (courseSection) courseSection.style.display = 'block';
            }
        }
    } catch (error) {
        // Silently fail
    }
}

async function logoutUser() {
    try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        currentUser = null;
        showGuestActions();
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', checkAuthState);
