// Main JavaScript for URL Shortener

document.addEventListener('DOMContentLoaded', function() {
    // URL shortening form handler
    const shortenForm = document.getElementById('shortenForm');
    if (shortenForm) {
        shortenForm.addEventListener('submit', handleShortenUrl);
    }
    
    // Copy button handler
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }
});

async function handleShortenUrl(event) {
    event.preventDefault();
    
    const originalUrl = document.getElementById('originalUrl').value;
    const shortenBtn = document.getElementById('shortenBtn');
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    
    // Reset previous results
    resultDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    // Show loading state
    shortenBtn.disabled = true;
    shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Shortening...';
    
    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: originalUrl })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Show success result
        document.getElementById('shortenedUrl').value = data.short_url;
        resultDiv.style.display = 'block';
        
        // Clear the input
        document.getElementById('originalUrl').value = '';
        
    } catch (error) {
        // Silent error handling
        document.getElementById('errorMessage').textContent = 
            'Failed to shorten URL. Please check the URL and try again.';
        errorDiv.style.display = 'block';
    } finally {
        // Reset button state
        shortenBtn.disabled = false;
        shortenBtn.innerHTML = '<i class="fas fa-magic"></i> Shorten';
    }
}

function copyToClipboard() {
    const shortenedUrl = document.getElementById('shortenedUrl');
    const copyBtn = document.getElementById('copyBtn');
    
    shortenedUrl.select();
    shortenedUrl.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(shortenedUrl.value).then(function() {
        // Show success feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.remove('btn-outline-primary');
        copyBtn.classList.add('btn-success');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('btn-success');
            copyBtn.classList.add('btn-outline-primary');
        }, 2000);
        
        // Show toast notification
        showToast('Link copied to clipboard!', 'success');
    }).catch(function(err) {
        // Silent error handling
        showToast('Failed to copy link', 'error');
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    
    // Style based on type
    if (type === 'error') {
        toast.style.backgroundColor = '#dc3545';
    } else {
        toast.style.backgroundColor = '#28a745';
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 3000);
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Utility function to validate URLs
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Add loading overlay
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'spinner-overlay';
    overlay.innerHTML = `
        <div class="text-center">
            <div class="spinner-border spinner-border-lg text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-3">Processing...</div>
        </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

function hideLoading(overlay) {
    if (overlay && document.body.contains(overlay)) {
        document.body.removeChild(overlay);
    }
}
