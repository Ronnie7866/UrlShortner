// Intermediate page JavaScript with anti-skip protection

class IntermediatePage {
    constructor() {
        this.timeLeft = 15;
        this.timerInterval = null;
        this.page = window.pageData.page;
        this.totalPages = window.pageData.totalPages;
        this.shortCode = window.pageData.shortCode;

        this.init();
    }

    init() {
        // Disable right-click context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                return false;
            }
        });

        // Disable text selection
        document.body.classList.add('no-select', 'no-context');

        // Prevent opening in new tab/window
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 't' || e.key === 'n')) {
                e.preventDefault();
                return false;
            }
        });

        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // User switched tabs - pause timer
                this.pauseTimer();
            } else {
                // User returned - resume timer
                this.resumeTimer();
            }
        });

        // Prevent back/forward navigation
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', () => {
            window.history.pushState(null, null, window.location.href);
        });

        // Start the countdown
        this.startTimer();

        // Set up continue button
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.handleContinue();
        });

        // Warn user before leaving
        window.addEventListener('beforeunload', (e) => {
            if (this.timeLeft > 0) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
                return e.returnValue;
            }
        });
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
        this.updateTimer();
    }

    pauseTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resumeTimer() {
        if (!this.timerInterval && this.timeLeft > 0) {
            this.startTimer();
        }
    }

    updateTimer() {
        const timerDisplay = document.getElementById('timer');
        const progressBar = document.getElementById('progressBar');
        const continueBtn = document.getElementById('continueBtn');
        const engagementProgress = document.getElementById('engagementProgress');

        // Update timer display
        timerDisplay.textContent = this.timeLeft;

        // Update progress bars
        const progress = ((15 - this.timeLeft) / 15) * 100;
        progressBar.style.width = progress + '%';

        // Update engagement progress bar if exists
        if (engagementProgress) {
            engagementProgress.style.width = progress + '%';
        }

        // Check if timer is done
        if (this.timeLeft <= 0) {
            clearInterval(this.timerInterval);

            // Enable continue button
            continueBtn.disabled = false;
            continueBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Continue';
            continueBtn.classList.add('btn-pulse');

            // Add pulse animation
            continueBtn.style.animation = 'pulse 1.5s infinite';

            // Show completion message
            timerDisplay.textContent = '✓';
            timerDisplay.style.color = '#28a745';

            // Show interstitial ad (non-popup) when button becomes available
            this.showInterstitialAd();

            return;
        }

        this.timeLeft--;
    }

    async handleContinue() {
        const continueBtn = document.getElementById('continueBtn');

        // Disable button and show loading first
        continueBtn.disabled = true;
        continueBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

        // MAXIMUM REVENUE: Trigger ads on continue button click (after user click)
        this.triggerContinueClickAds();

        // Wait for ads to trigger before navigation
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Send current page info with the request
            const formData = new FormData();
            formData.append('current_page', this.page.toString());

            const response = await fetch(`/${this.shortCode}/advance`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to advance');
            }

            const data = await response.json();

            // Handle response
            if (data.redirect) {
                // Final redirect
                window.location.href = data.redirect;
            } else if (data.next_page) {
                // Go to next intermediate page
                window.location.href = `/${this.shortCode}/page/${data.next_page}`;
            }

        } catch (error) {
            // Silent error handling

            // Show error and re-enable button
            continueBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error - Try Again';
            continueBtn.classList.remove('btn-primary');
            continueBtn.classList.add('btn-danger');

            setTimeout(() => {
                continueBtn.disabled = false;
                continueBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Continue';
                continueBtn.classList.remove('btn-danger');
                continueBtn.classList.add('btn-primary');
            }, 2000);
        }
    }

    triggerContinueButtonAds() {
        try {
            // Pre-load interstitial ad when button becomes available
            this.showInterstitialAd();

        } catch (e) {
            // Silent error handling
        }
    }

    triggerContinueClickAds() {
        try {
            const isLastPage = this.page >= this.totalPages;
            
            if (isLastPage) {
                // On last page: Try DirectLink first, then popup as fallback
                if (typeof window.forceDirectLink === 'function') {
                    const directLinkSuccess = window.forceDirectLink();
                    if (!directLinkSuccess && typeof window.forceContinuePopup === 'function') {
                        window.forceContinuePopup();
                    }
                }
            } else {
                // On intermediate pages: Use popup only
                if (typeof window.forceContinuePopup === 'function') {
                    window.forceContinuePopup();
                }
            }

            // Background popunder for passive revenue (if not already triggered)
            setTimeout(() => {
                if (typeof window.forcePopunder === 'function') {
                    window.forcePopunder();
                }
            }, 1000);

        } catch (e) {
            // Silent error handling
        }
    }

    showEngagementBanners() {
        // Add more banners during engagement/wait time for maximum revenue
        const timerContainer = document.querySelector('.progress-circle').parentNode;
        const existingEngagement = document.getElementById('engagement-banners');

        if (!existingEngagement && timerContainer) {
            const engagementContainer = document.createElement('div');
            engagementContainer.id = 'engagement-banners';
            engagementContainer.className = 'engagement-revenue-zone';
            engagementContainer.style.cssText = `
                background: linear-gradient(135deg, #667eea, #764ba2);
                padding: 20px;
                border-radius: 15px;
                margin: 20px 0;
                text-align: center;
                color: white;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            `;

            engagementContainer.innerHTML = `
                <div class="engagement-header mb-3">
                    <i class="fas fa-clock fa-2x mb-2"></i>
                    <h6>While You Wait - Exclusive Offers</h6>
                </div>

                <!-- High-value engagement banner 1 -->
                <div class="engagement-ad-1 mb-3" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
                    <script type="text/javascript">
                        atOptions = {
                            'key' : '672c2721ececa1fbcf12b371233cff5b',
                            'format' : 'iframe',
                            'height' : 100,
                            'width' : 320,
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" src="//violationtones.com/672c2721ececa1fbcf12b371233cff5b/invoke.js"></script>
                </div>

                <!-- Native content ad for higher engagement -->
                <div class="engagement-ad-2 mb-3" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
                    <small class="d-block mb-2"><i class="fas fa-star"></i> Featured Content</small>
                    <script async="async" data-cfasync="false" src="//violationtones.com/89138f2671a74d755698d6d16466866f/invoke.js"></script>
                    <div id="container-89138f2671a74d755698d6d16466866f-engagement${this.page}"></div>
                </div>

                <!-- Mobile-optimized banner -->
                <div class="engagement-ad-3 d-block d-md-none" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
                    <script type="text/javascript">
                        atOptions = {
                            'key' : '672c2721ececa1fbcf12b371233cff5b',
                            'format' : 'iframe',
                            'height' : 100,
                            'width' : 320,
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" src="//violationtones.com/672c2721ececa1fbcf12b371233cff5b/invoke.js"></script>
                </div>

                <!-- Desktop additional banner -->
                <div class="engagement-ad-4 d-none d-md-block" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
                    <script type="text/javascript">
                        atOptions = {
                            'key' : '672c2721ececa1fbcf12b371233cff5b',
                            'format' : 'iframe',
                            'height' : 250,
                            'width' : 300,
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" src="//violationtones.com/672c2721ececa1fbcf12b371233cff5b/invoke.js"></script>
                </div>

                <div class="engagement-footer mt-3">
                    <small><i class="fas fa-shield-check"></i> Secure verification in progress...</small>
                </div>
            `;

            // Insert after timer container
            timerContainer.parentNode.insertBefore(engagementContainer, timerContainer.nextSibling);
        }
    }

    showInterstitialAd() {
        // Create dynamic ad above continue button for extra revenue
        const continueBtn = document.getElementById('continueBtn');
        const existingAd = document.getElementById('continue-interstitial-ad');

        if (!existingAd && continueBtn) {
            const adContainer = document.createElement('div');
            adContainer.id = 'continue-interstitial-ad';
            adContainer.className = 'text-center mt-3 mb-3';
            adContainer.style.cssText = 'background: linear-gradient(45deg, #667eea, #764ba2); padding: 15px; border-radius: 10px; color: white;';

            adContainer.innerHTML = `
                <small><i class="fas fa-gift"></i> Unlock Your Link - Special Offer</small>
                <div class="mt-2">
                    <script type="text/javascript">
                        atOptions = {
                            'key' : '672c2721ececa1fbcf12b371233cff5b',
                            'format' : 'iframe',
                            'height' : 100,
                            'width' : 320,
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" src="//violationtones.com/672c2721ececa1fbcf12b371233cff5b/invoke.js"></script>
                </div>
            `;

            // Insert before continue button
            continueBtn.parentNode.insertBefore(adContainer, continueBtn);

            // Execute the ad script
            const script = document.createElement('script');
            script.src = '//violationtones.com/672c2721ececa1fbcf12b371233cff5b/invoke.js';
            document.head.appendChild(script);
        }
    }
}

// Add pulse animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    .btn-pulse {
        animation: pulse 1.5s infinite;
    }
`;
document.head.appendChild(style);

// Initialize the intermediate page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IntermediatePage();
});

// Additional security measures
(function() {
    // Disable drag and drop
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
    });

    // Disable print
    window.addEventListener('beforeprint', (e) => {
        e.preventDefault();
        return false;
    });

    // Disable save page
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
    });

    // Disable image saving
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // Monitor for developer tools
    let devtools = {
        open: false,
        orientation: null
    };

    const threshold = 160;

    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
            }
        } else {
            devtools.open = false;
        }
    }, 500);
})();