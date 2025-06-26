
// Optimized Revenue Strategy - Single popup per page with enhanced engagement
(function() {
    'use strict';
    
    let popupTriggered = false;
    let popunderTriggered = false;
    let userInteracted = false;
    let pagePopupUsed = false; // Track if popup was used on this page
    
    // Track user interaction for popup allowance
    function trackUserInteraction() {
        if (!userInteracted) {
            userInteracted = true;
        }
    }
    
    // Add interaction listeners
    ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, trackUserInteraction, { once: true, passive: true });
    });
    
    // High-value popup for continue button only
    function triggerContinuePopup() {
        if (!userInteracted || pagePopupUsed) {
            return false;
        }
        
        try {
            // Single, high-value popup on continue click
            const popup = window.open(
                'https://violationtones.com/wk3jtk9r7?key=f1a89e3aaa7086cc2113978186f98dcd', 
                '_blank', 
                'width=900,height=700,scrollbars=yes,resizable=yes,toolbar=no,location=no,menubar=no'
            );
            
            if (popup && !popup.closed) {
                pagePopupUsed = true;
                popupTriggered = true;
                
                // Focus popup for better engagement
                popup.focus();
                
                // Close after engagement time
                setTimeout(() => {
                    try {
                        if (popup && !popup.closed) {
                            popup.close();
                        }
                    } catch (e) {
                        // Silent error handling
                    }
                }, 5000); // Longer engagement time for higher revenue
                
                return true;
            }
        } catch (e) {
            return false;
        }
        
        return false;
    }
    
    // Background popunder for passive revenue
    function triggerPopunder() {
        if (!userInteracted || popunderTriggered) {
            return false;
        }
        
        try {
            const popunder = window.open(
                'https://violationtones.com/wk3jtk9r7?key=f1a89e3aaa7086cc2113978186f98dcd', 
                '_blank',
                'width=1,height=1,left=-2000,top=-2000'
            );
            
            if (popunder) {
                popunderTriggered = true;
                
                // Send to background immediately
                setTimeout(() => {
                    try {
                        popunder.blur();
                        window.focus();
                    } catch (e) {
                        // Silent error handling
                    }
                }, 50);
                
                return true;
            }
        } catch (e) {
            // Silent error handling
        }
        
        return false;
    }
    
    // DirectLink redirect for premium traffic - only on last page
    function triggerDirectLink() {
        // Only use DirectLink on the last page
        const isLastPage = window.pageData && (window.pageData.page >= window.pageData.totalPages);
        
        if (!isLastPage) {
            return false; // Don't use DirectLink on intermediate pages
        }
        
        try {
            // Open DirectLink in current tab for maximum revenue on last page only
            window.location.href = 'https://violationtones.com/wk3jtk9r7?key=f1a89e3aaa7086cc2113978186f98dcd&redirect=' + 
                                   encodeURIComponent(window.location.href);
            return true;
        } catch (e) {
            // Fallback to popup on last page
            return triggerContinuePopup();
        }
    }
    
    // Strategic timing for mobile-first approach
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Background popunder on first interaction (passive revenue)
    document.addEventListener('click', function firstClick() {
        setTimeout(() => {
            if (!popunderTriggered) {
                triggerPopunder();
            }
        }, 1500); // Delayed for better UX
    }, { once: true, passive: true });
    
    // Export functions for external use
    window.forceContinuePopup = function() {
        return triggerContinuePopup();
    };
    
    window.forceDirectLink = function() {
        return triggerDirectLink();
    };
    
    window.forcePopunder = function() {
        return triggerPopunder();
    };
    
    // Legacy support
    window.forceContinueAds = function() {
        return triggerContinuePopup();
    };
    
    window.forcePopup = function() {
        return triggerContinuePopup();
    };
    
    // Revenue analytics
    window.getRevenueStats = function() {
        return {
            userInteracted,
            popupTriggered,
            popunderTriggered,
            pagePopupUsed,
            isMobile,
            revenue_potential: pagePopupUsed ? 'HIGH' : 'MEDIUM'
        };
    };
})();
