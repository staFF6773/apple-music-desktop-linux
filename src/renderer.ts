// DOM elements
const webview = document.getElementById('appleMusicWebview') as Electron.WebviewTag;
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const statusText = document.getElementById('statusText');
const appVersion = document.getElementById('appVersion');

// Control buttons
const reloadBtn = document.getElementById('reloadBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const homeBtn = document.getElementById('homeBtn');
const retryBtn = document.getElementById('retryBtn');

// State
let isLoading = true;
let hasError = false;

// Initialize the app
async function initApp(): Promise<void> {
    try {
        // Get app version
        const version = await window.electronAPI.getAppVersion();
        const appName = await window.electronAPI.getAppName();
        
        if (appVersion) {
            appVersion.textContent = `${appName} v${version}`;
        }
        
        // Setup webview event listeners
        setupWebviewListeners();
        
        // Setup control button listeners
        setupControlListeners();
        
        // Setup retry button listener
        if (retryBtn) {
            retryBtn.addEventListener('click', handleRetry);
        }
        
        updateStatus('Ready');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to initialize application');
    }
}

// Setup webview event listeners
function setupWebviewListeners(): void {
    if (!webview) return;

    // Load start
    webview.addEventListener('did-start-loading', () => {
        isLoading = true;
        hasError = false;
        showLoading();
        updateStatus('Loading...');
    });

    // Load stop
    webview.addEventListener('did-stop-loading', () => {
        isLoading = false;
        hideLoading();
        updateStatus('Ready');
    });

    // Load finish
    webview.addEventListener('did-finish-load', () => {
        isLoading = false;
        hideLoading();
        updateStatus('Ready');
    });

    // Load fail
    webview.addEventListener('did-fail-load', (event) => {
        isLoading = false;
        hasError = true;
        hideLoading();
        showError(`Failed to load: ${event.errorDescription}`);
        updateStatus('Error');
    });

    // Navigation events
    webview.addEventListener('will-navigate', (event) => {
        updateStatus('Navigating...');
    });

    webview.addEventListener('did-navigate', () => {
        updateStatus('Ready');
    });

    // Console messages from webview (for debugging)
    webview.addEventListener('console-message', (event) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Webview console:', event.message);
        }
    });

    // New window requests
    webview.addEventListener('new-window', (event) => {
        // This should be handled by the main process, but just in case
        event.preventDefault();
    });
}

// Setup control button listeners
function setupControlListeners(): void {
    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            if (webview) {
                webview.reload();
                updateStatus('Reloading...');
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (webview && webview.canGoBack()) {
                webview.goBack();
                updateStatus('Going back...');
            }
        });
    }

    if (forwardBtn) {
        forwardBtn.addEventListener('click', () => {
            if (webview && webview.canGoForward()) {
                webview.goForward();
                updateStatus('Going forward...');
            }
        });
    }

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            if (webview) {
                webview.loadURL('https://music.apple.com');
                updateStatus('Going home...');
            }
        });
    }
}

// Show loading indicator
function showLoading(): void {
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

// Hide loading indicator
function hideLoading(): void {
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
}

// Show error message
function showError(message: string): void {
    if (errorMessage) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = message;
        }
        errorMessage.classList.remove('hidden');
    }
}

// Handle retry button click
function handleRetry(): void {
    if (webview) {
        hasError = false;
        webview.reload();
        updateStatus('Retrying...');
    }
}

// Update status text
function updateStatus(status: string): void {
    if (statusText) {
        statusText.textContent = status;
    }
}

// Update navigation button states
function updateNavigationButtons(): void {
    if (!webview) return;

    if (backBtn) {
        const canGoBack = webview.canGoBack();
        backBtn.style.opacity = canGoBack ? '1' : '0.5';
        backBtn.style.cursor = canGoBack ? 'pointer' : 'not-allowed';
        (backBtn as HTMLButtonElement).disabled = !canGoBack;
    }

    if (forwardBtn) {
        const canGoForward = webview.canGoForward();
        forwardBtn.style.opacity = canGoForward ? '1' : '0.5';
        forwardBtn.style.cursor = canGoForward ? 'pointer' : 'not-allowed';
        (forwardBtn as HTMLButtonElement).disabled = !canGoForward;
    }
}

// Periodic navigation button state update
setInterval(updateNavigationButtons, 1000);

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + R to reload
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        if (webview) {
            webview.reload();
            updateStatus('Reloading...');
        }
    }

    // Ctrl/Cmd + Left Arrow to go back
    if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowLeft') {
        event.preventDefault();
        if (webview && webview.canGoBack()) {
            webview.goBack();
            updateStatus('Going back...');
        }
    }

    // Ctrl/Cmd + Right Arrow to go forward
    if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight') {
        event.preventDefault();
        if (webview && webview.canGoForward()) {
            webview.goForward();
            updateStatus('Going forward...');
        }
    }

    // Ctrl/Cmd + Home to go home
    if ((event.ctrlKey || event.metaKey) && event.key === 'Home') {
        event.preventDefault();
        if (webview) {
            webview.loadURL('https://music.apple.com');
            updateStatus('Going home...');
        }
    }
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Handle window focus/blur for better UX
window.addEventListener('focus', () => {
    if (webview) {
        webview.focus();
    }
});

// Export for potential external use
(window as any).appController = {
    reload: () => webview?.reload(),
    goBack: () => webview?.canGoBack() && webview.goBack(),
    goForward: () => webview?.canGoForward() && webview.goForward(),
    goHome: () => webview?.loadURL('https://music.apple.com'),
    getStatus: () => statusText?.textContent,
    isLoading: () => isLoading,
    hasError: () => hasError
};
