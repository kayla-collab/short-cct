/**
 * Iframe Detection & Responsive Enhancements
 * Detects if page is embedded in iframe and applies appropriate styles
 */
(function() {
    'use strict';
    
    // Detect if running inside an iframe
    function isInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            // Access denied means we're in an iframe with different origin
            return true;
        }
    }
    
    // Apply iframe-specific class
    if (isInIframe()) {
        document.documentElement.classList.add('in-iframe');
        
        // Notify parent window that content is ready (if same origin)
        try {
            if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({ type: 'iframeReady', url: window.location.href }, '*');
            }
        } catch (e) {
            // Cross-origin, ignore
        }
    }
    
    // Handle viewport resize for responsive updates
    function handleResize() {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        
        // Add size-based classes for more granular control
        document.documentElement.classList.remove('vw-xs', 'vw-sm', 'vw-md', 'vw-lg', 'vw-xl');
        
        if (vw <= 360) {
            document.documentElement.classList.add('vw-xs');
        } else if (vw <= 480) {
            document.documentElement.classList.add('vw-sm');
        } else if (vw <= 768) {
            document.documentElement.classList.add('vw-md');
        } else if (vw <= 1024) {
            document.documentElement.classList.add('vw-lg');
        } else {
            document.documentElement.classList.add('vw-xl');
        }
    }
    
    // Initial call
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Handle orientation change on mobile
    window.addEventListener('orientationchange', function() {
        setTimeout(handleResize, 100);
    });
})();
