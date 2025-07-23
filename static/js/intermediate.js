document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer');
    const progressBar = document.getElementById('progressBar');
    const continueBtn = document.getElementById('continueBtn');

    if (!timerDisplay || !progressBar || !continueBtn) {
        console.error('Required elements not found');
        return;
    }

    let timeLeft = 15;
    let clickCount = 0;

    // Function to update timer and progress bar
    const updateTimer = () => {
        timerDisplay.textContent = timeLeft;
        const progress = ((15 - timeLeft) / 15) * 100;
        progressBar.style.width = `${progress}%`;

        if (timeLeft > 0) {
            timeLeft--;
        } else {
            clearInterval(timerInterval);
            enableContinueButton();
        }
    };

    // Enable the continue button and show scroll prompt
    const enableContinueButton = () => {
        continueBtn.disabled = false;
        continueBtn.innerHTML = '<i class="fas fa-check"></i> Continue';

        // Show scroll prompt notification
        const scrollPrompt = document.getElementById('scroll-prompt');
        if (scrollPrompt) {
            scrollPrompt.style.display = 'block';

            // Auto-hide after 10 seconds
            setTimeout(() => {
                scrollPrompt.style.display = 'none';
            }, 10000);
        }

        // Replace timer with scroll message
        timerDisplay.innerHTML = '<i class="fas fa-arrow-down"></i><br><small>Scroll to bottom</small>';
        timerDisplay.style.fontSize = '1.5rem';
    };

    // Start the timer
    const timerInterval = setInterval(updateTimer, 1000);

    // Handle continue button click
    continueBtn.addEventListener('click', async () => {
        clickCount++;

        // Attempt to open the direct link in a new tab
        if (window.pageData.directLink) {
            window.open(window.pageData.directLink, '_blank');
        }

        if (clickCount < window.pageData.requiredClicks) {
            // Just keep the continue button as is, no message change
            // Briefly disable to prevent spamming
            continueBtn.disabled = true;
            setTimeout(() => {
                continueBtn.disabled = false;
            }, 500);
            return;
        }

        continueBtn.disabled = true;
        continueBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            const formData = new FormData();
            formData.append('current_page', window.pageData.page);

            const response = await fetch(`/${window.pageData.shortCode}/advance`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.redirect) {
                // Final redirect
                window.location.href = data.redirect;
            } else if (data.next_page) {
                // Go to the next intermediate page
                window.location.href = `/${window.pageData.shortCode}/page/${data.next_page}`;
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error advancing to next page:', error);
            continueBtn.disabled = false;
            continueBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Try Again';
        }
    });

    // Hide scroll prompt when user scrolls
    let scrollPromptVisible = false;
    window.addEventListener('scroll', () => {
        const scrollPrompt = document.getElementById('scroll-prompt');
        if (scrollPromptVisible && scrollPrompt && window.scrollY > 100) {
            scrollPrompt.style.display = 'none';
            scrollPromptVisible = false;
        }
    });

    // Track when scroll prompt is shown
    const originalEnableContinueButton = enableContinueButton;
    enableContinueButton = () => {
        originalEnableContinueButton();
        scrollPromptVisible = true;
    };

    // Initial call to set timer
    updateTimer();
});
