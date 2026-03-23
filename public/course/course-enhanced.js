/**
 * Short Circuit - Enhanced UI Utilities
 * Cognitive Design Implementation
 */

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================
const Toast = {
    container: null,
    queue: [],
    
    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.setAttribute('role', 'alert');
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
    },
    
    show(options) {
        this.init();
        
        const {
            type = 'info', // success, error, warning, info
            title = '',
            message = '',
            duration = 4000,
            action = null, // { label: 'Undo', onClick: () => {} }
        } = options;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-actions">
                ${action ? `<button class="toast-btn" data-action="custom">${action.label}</button>` : ''}
                <button class="toast-close" aria-label="Dismiss">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Event listeners
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.dismiss(toast));
        
        if (action) {
            const actionBtn = toast.querySelector('[data-action="custom"]');
            actionBtn.addEventListener('click', () => {
                action.onClick();
                this.dismiss(toast);
            });
        }
        
        this.container.appendChild(toast);
        
        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }
        
        return toast;
    },
    
    dismiss(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.add('exiting');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },
    
    success(message, options = {}) {
        return this.show({ type: 'success', message, ...options });
    },
    
    error(message, options = {}) {
        return this.show({ type: 'error', message, ...options });
    },
    
    warning(message, options = {}) {
        return this.show({ type: 'warning', message, ...options });
    },
    
    info(message, options = {}) {
        return this.show({ type: 'info', message, ...options });
    }
};

// ============================================
// SKELETON LOADING UTILITIES
// ============================================
const Skeleton = {
    create(type, count = 1) {
        const templates = {
            comment: `
                <div class="comment-enhanced" style="opacity: 0.7;">
                    <div class="comment-main">
                        <div class="skeleton skeleton-avatar"></div>
                        <div class="comment-body" style="flex: 1;">
                            <div class="skeleton skeleton-text" style="width: 120px;"></div>
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-text short"></div>
                        </div>
                    </div>
                </div>
            `,
            lesson: `
                <div style="padding: 16px; opacity: 0.7;">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>
            `,
            card: `
                <div class="skeleton-card" style="opacity: 0.7;">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>
            `
        };
        
        const template = templates[type] || templates.card;
        return Array(count).fill(template).join('');
    }
};

// ============================================
// PROGRESS RING COMPONENT
// ============================================
const ProgressRingEnhanced = {
    create(percent, size = 36, strokeWidth = 3) {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percent / 100) * circumference;
        
        const color = percent === 100 ? 'var(--success)' : 'var(--electric-blue)';
        
        return `
            <div class="progress-ring-enhanced" style="width: ${size}px; height: ${size}px;">
                <svg width="${size}" height="${size}">
                    <circle 
                        class="progress-ring-bg"
                        stroke-width="${strokeWidth}"
                        r="${radius}"
                        cx="${size/2}"
                        cy="${size/2}"
                    />
                    <circle 
                        class="progress-ring-fill"
                        stroke="${color}"
                        stroke-width="${strokeWidth}"
                        r="${radius}"
                        cx="${size/2}"
                        cy="${size/2}"
                        style="
                            stroke-dasharray: ${circumference} ${circumference};
                            stroke-dashoffset: ${offset};
                        "
                    />
                </svg>
                ${percent === 100 
                    ? `<i class="fas fa-check" style="font-size: ${size * 0.35}px; color: var(--success); position: absolute;"></i>`
                    : `<span class="progress-ring-text">${percent}%</span>`
                }
            </div>
        `;
    }
};

// ============================================
// CELEBRATION EFFECTS
// ============================================
const Celebration = {
    confetti(duration = 3000) {
        const overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';
        document.body.appendChild(overlay);
        
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f43f5e'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 1 + 2) + 's';
            overlay.appendChild(confetti);
        }
        
        setTimeout(() => {
            overlay.remove();
        }, duration);
    },
    
    pulse(element) {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'celebratePulse 0.6s ease';
    }
};

// ============================================
// STICKY PROGRESS BAR
// ============================================
const StickyProgress = {
    element: null,
    fill: null,
    
    init() {
        if (this.element) return;
        
        this.element = document.createElement('div');
        this.element.className = 'sticky-progress';
        this.element.innerHTML = '<div class="sticky-progress-fill"></div>';
        document.body.appendChild(this.element);
        
        this.fill = this.element.querySelector('.sticky-progress-fill');
        
        // Show/hide based on scroll position
        let lastScrollY = 0;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY > 200) {
                this.element.classList.add('visible');
            } else {
                this.element.classList.remove('visible');
            }
            lastScrollY = scrollY;
        }, { passive: true });
    },
    
    update(percent) {
        if (!this.fill) this.init();
        this.fill.style.width = `${percent}%`;
    }
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
const KeyboardShortcuts = {
    shortcuts: {},
    hintElement: null,
    hintTimeout: null,
    
    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.createHint();
    },
    
    register(key, callback, description) {
        this.shortcuts[key.toLowerCase()] = { callback, description };
    },
    
    handleKeydown(e) {
        // Ignore if typing in input/textarea
        if (e.target.matches('input, textarea, [contenteditable]')) return;
        
        const key = this.getKeyCombo(e);
        const shortcut = this.shortcuts[key];
        
        if (shortcut) {
            e.preventDefault();
            shortcut.callback();
        }
        
        // Show hint on ? key
        if (e.key === '?') {
            this.showHint();
        }
    },
    
    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('cmd');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    },
    
    createHint() {
        this.hintElement = document.createElement('div');
        this.hintElement.className = 'shortcuts-hint';
        this.hintElement.innerHTML = `
            <span>Press <span class="shortcut-key">?</span> for shortcuts</span>
        `;
        document.body.appendChild(this.hintElement);
        
        // Show briefly on page load
        setTimeout(() => {
            this.hintElement.classList.add('visible');
            setTimeout(() => {
                this.hintElement.classList.remove('visible');
            }, 3000);
        }, 2000);
    },
    
    showHint() {
        // Could expand to show full shortcut list
        Toast.info('Keyboard Shortcuts: Arrow keys to navigate, Enter to select');
    }
};

// ============================================
// AUTO-RESIZE TEXTAREA
// ============================================
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

// ============================================
// CHARACTER COUNTER
// ============================================
function updateCharCount(textarea, counterElement, maxLength = 2000) {
    const length = textarea.value.length;
    const remaining = maxLength - length;
    
    counterElement.textContent = `${length}/${maxLength}`;
    counterElement.classList.remove('warning', 'error');
    
    if (remaining < 50) {
        counterElement.classList.add('error');
    } else if (remaining < 200) {
        counterElement.classList.add('warning');
    }
}

// ============================================
// SMOOTH SCROLL TO ELEMENT
// ============================================
function scrollToElement(element, offset = 100) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// ============================================
// RECENTLY VIEWED STORAGE
// ============================================
const RecentlyViewed = {
    key: 'shortcircuit_recently_viewed',
    maxItems: 5,
    
    get() {
        try {
            return JSON.parse(localStorage.getItem(this.key)) || [];
        } catch {
            return [];
        }
    },
    
    add(item) {
        const items = this.get().filter(i => i.id !== item.id);
        items.unshift(item);
        localStorage.setItem(this.key, JSON.stringify(items.slice(0, this.maxItems)));
    },
    
    render(container) {
        const items = this.get();
        if (items.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.innerHTML = `
            <div class="recently-viewed-title">Recently Viewed</div>
            ${items.map(item => `
                <div class="recently-viewed-item" data-lesson="${item.id}">
                    <i class="fas fa-history"></i>
                    <span>${item.title}</span>
                </div>
            `).join('')}
        `;
        container.style.display = 'block';
    }
};

// ============================================
// TIME AGO (ENHANCED)
// ============================================
function timeAgoEnhanced(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// ============================================
// DEBOUNCE UTILITY
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// INITIALIZE ENHANCED FEATURES
// ============================================
function initEnhancedUI() {
    Toast.init();
    StickyProgress.init();
    KeyboardShortcuts.init();
    
    // Register default shortcuts
    KeyboardShortcuts.register('arrowleft', () => {
        const prevBtn = document.querySelector('.nav-btn:not(.primary)');
        if (prevBtn) prevBtn.click();
    }, 'Previous lesson');
    
    KeyboardShortcuts.register('arrowright', () => {
        const nextBtn = document.querySelector('.nav-btn.primary');
        if (nextBtn) nextBtn.click();
    }, 'Next lesson');
    
    KeyboardShortcuts.register('cmd+k', () => {
        const searchInput = document.querySelector('.search-input, .sidebar-search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }, 'Focus search');
    
    // Auto-resize textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', () => autoResizeTextarea(textarea));
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancedUI);
} else {
    initEnhancedUI();
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.Toast = Toast;
    window.Skeleton = Skeleton;
    window.ProgressRingEnhanced = ProgressRingEnhanced;
    window.Celebration = Celebration;
    window.StickyProgress = StickyProgress;
    window.KeyboardShortcuts = KeyboardShortcuts;
    window.RecentlyViewed = RecentlyViewed;
    window.timeAgoEnhanced = timeAgoEnhanced;
    window.scrollToElement = scrollToElement;
    window.debounce = debounce;
}
