// Object to store tracking data across different identifiers
let trackingData = {
    fbIdDomains: new Map(),    // Map of "domain -> last request containing fbID"
    gtmDomains: new Map()      // Map of "domain -> last request containing gtmId"
};
let fbIdTail = null;      // Stores last two segments of Facebook _fbp cookie
let gtmIdTail = null;     // Stores last two segments of Google Analytics _ga cookie

// Check if hostname is not a subdomain of current tab's domain
async function isNotSubdomainOfCurrent(hostname) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTabHostname = tabs[0] ? getHostname(tabs[0].url) : '';
    
    if (!hostname || !currentTabHostname) return false;
    
    const hostnameParts = hostname.split('.').reverse();
    const currentParts = currentTabHostname.split('.').reverse();
    
    if (hostnameParts.length < 2 || currentParts.length < 2) return hostname !== currentTabHostname;
    
    const isSameDomain = hostnameParts[0] === currentParts[0] && hostnameParts[1] === currentParts[1];
    return !isSameDomain;
}

// Update all tracking IDs based on current tab's cookies
async function updateTrackingIds() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0] || !tabs[0].url) return; // Skip if no valid tab or URL
    
    const url = tabs[0].url;
    
    // Update Facebook ID
    const fbCookie = await browser.cookies.get({ url, name: '_fbp' });
    fbIdTail = fbCookie?.value.split('.').slice(-2).join('.') || null;
    
    // Update Google Analytics ID
    const gaCookie = await browser.cookies.get({ url, name: '_ga' });
    gtmIdTail = gaCookie?.value.split('.').slice(-2).join('.') || null;
}

// Initial tracking IDs update
updateTrackingIds();

// Extract hostname from URL with error handling
function getHostname(urlString, fallback = '') {
    try {
        return new URL(urlString).hostname;
    } catch (e) {
        return fallback;
    }
}

// Monitor outgoing request headers
browser.webRequest.onBeforeSendHeaders.addListener(
    async (details) => {
        const hostname = getHostname(details.url);
        const headers = details.requestHeaders;
        const headerString = headers.map(h => `${h.name}: ${h.value}`).join('\n');
        
        if (fbIdTail && headerString.includes(fbIdTail) &&
            !(['facebook.com', 'www.facebook.com'].includes(hostname)) &&
            await isNotSubdomainOfCurrent(hostname)) {
            trackingData.fbIdDomains.set(hostname, headerString);
        }
        
        if (gtmIdTail && headerString.includes(gtmIdTail) &&
            !(['google-analytics.com', 'www.google-analytics.com', 'analytics.google.com', 'stats.g.doubleclick.net'].includes(hostname)) &&
            await isNotSubdomainOfCurrent(hostname)) {
            trackingData.gtmDomains.set(hostname, headerString);
        }
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
);

// Monitor request body and query strings
browser.webRequest.onBeforeRequest.addListener(
    async (details) => {
        const hostname = getHostname(details.url);
        const queryString = getHostname(details.url) ? new URL(details.url).search : '';
        let bodyString = '';
        
        if (details.requestBody) {
            if (details.requestBody.formData) {
                bodyString = Object.entries(details.requestBody.formData)
                                   .map(([key, values]) => `${key}=${values.join(',')}`)
                                   .join('&');
            } else if (details.requestBody.raw) {
                bodyString = new TextDecoder().decode(
                    details.requestBody.raw[0]?.bytes || new Uint8Array()
                );
            }
        }
        
        const combinedString = `${queryString}${bodyString}`;
        
        if (fbIdTail && combinedString.includes(fbIdTail) &&
            !(['facebook.com', 'www.facebook.com'].includes(hostname)) &&
            await isNotSubdomainOfCurrent(hostname)) {
            trackingData.fbIdDomains.set(hostname, combinedString);
        }
        
        if (gtmIdTail && combinedString.includes(gtmIdTail) &&
            !(['google-analytics.com', 'www.google-analytics.com', 'analytics.google.com', 'stats.g.doubleclick.net'].includes(hostname)) &&
            await isNotSubdomainOfCurrent(hostname)) {
            trackingData.gtmDomains.set(hostname, combinedString);
        }
    },
    { urls: ["<all_urls>"] },
    ["requestBody"]
);

// Update dashboard with current tracking data
async function updateDashboard() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0] || !tabs[0].url) return; // Skip if no valid tab or URL
    
    const tabId = tabs[0].id;
    const url = tabs[0].url;
    
    const fbCookie = await browser.cookies.get({ url, name: '_fbp' });
    const gaCookie = await browser.cookies.get({ url, name: '_ga' });
    
    const newFbIdTail = fbCookie?.value.split('.').slice(-2).join('.') || null;
    const newGtmIdTail = gaCookie?.value.split('.').slice(-2).join('.') || null;
    
    if (newFbIdTail !== fbIdTail || newGtmIdTail !== gtmIdTail) {
        fbIdTail = newFbIdTail;
        gtmIdTail = newGtmIdTail;
        trackingData = {
            fbIdDomains: new Map(),
            gtmDomains: new Map()
        };
    }
    
    try {
        await browser.tabs.sendMessage(tabId, {
            type: 'updateDashboard',
            fbId: fbCookie?.value || 'Not found',
            gtmId: gaCookie?.value || 'Not found',
            fbDomains: Array.from(trackingData.fbIdDomains.entries()),
            gtmDomains: Array.from(trackingData.gtmDomains.entries())
        });
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

setInterval(updateDashboard, 1000);

// Respond to content script requests for tracking data
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getTrackingData') {
        sendResponse({ trackingData });
    }
});