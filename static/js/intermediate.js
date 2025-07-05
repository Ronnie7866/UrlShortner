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

            // Show mobile interstitial for maximum revenue (90% mobile users)
            this.showMobileInterstitial(() => {
                // Enable continue button after interstitial
                continueBtn.disabled = false;
                if (this.page === this.totalPages) {
                    continueBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Get Link';
                } else {
                    continueBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Continue';
                }
                continueBtn.classList.add('btn-pulse');

                // Add pulse animation
                continueBtn.style.animation = 'pulse 1.5s infinite';

                // Show completion message
                timerDisplay.textContent = '✓';
                timerDisplay.style.color = '#28a745';
            });

            return;
        }

        this.timeLeft--;
    }

    // Mobile-First Revenue: Show interstitial ad for 90% mobile users
    showMobileInterstitial(callback) {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            const interstitial = document.getElementById('mobileInterstitial');
            const progressBar = document.getElementById('interstitialProgress');

            if (interstitial && progressBar) {
                // Show interstitial
                interstitial.style.display = 'block';

                // 5-second interstitial for maximum revenue
                let interstitialTime = 5;
                const interstitialInterval = setInterval(() => {
                    const progress = ((5 - interstitialTime) / 5) * 100;
                    progressBar.style.width = progress + '%';

                    if (interstitialTime <= 0) {
                        clearInterval(interstitialInterval);
                        interstitial.style.display = 'none';
                        callback();
                    }

                    interstitialTime--;
                }, 1000);

                return;
            }
        }

        // Desktop or no interstitial - immediate callback
        callback();
    }

    async handleContinue() {
        const continueBtn = document.getElementById('continueBtn');

        // Disable button and show loading first
        continueBtn.disabled = true;
        continueBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

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

            // Direct Link Ad Integration - Open in new tab for better UX
            if (data.redirect) {
                // Final redirect - Open direct link ad in new tab, then redirect
                const directLinkUrl = 'https://violationtones.com/vwh3k6pwkv?key=53274b8825d29e20912b29cf21df8bc9';
                const finalUrl = encodeURIComponent(data.redirect);

                // Show user feedback
                continueBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Opening Link...';

                // Open ad in new tab
                window.open(`${directLinkUrl}&url=${finalUrl}`, '_blank');

                // Update button text
                continueBtn.innerHTML = '<i class="fas fa-check"></i> Redirecting...';

                // Small delay then redirect to final URL
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1500);

            } else if (data.next_page) {
                // Go to next intermediate page - Use direct link for page 2 and 4
                if (this.page === 2 || this.page === 4) {
                    const directLinkUrl = 'https://violationtones.com/vwh3k6pwkv?key=53274b8825d29e20912b29cf21df8bc9';
                    const nextPageUrl = encodeURIComponent(`${window.location.origin}/${this.shortCode}/page/${data.next_page}`);

                    // Show user feedback
                    continueBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Opening...';

                    // Open ad in new tab
                    window.open(`${directLinkUrl}&url=${nextPageUrl}`, '_blank');

                    // Update button text
                    continueBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Proceeding...';

                    // Small delay then navigate to next page
                    setTimeout(() => {
                        window.location.href = `/${this.shortCode}/page/${data.next_page}`;
                    }, 1200);
                } else {
                    // Direct navigation for pages 1 and 3
                    window.location.href = `/${this.shortCode}/page/${data.next_page}`;
                }
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