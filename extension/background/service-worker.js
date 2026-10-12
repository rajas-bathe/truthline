/**
 * TRUTHLINE AI — Chrome Extension Service Worker (Manifest V3)
 * "DON'T JUST FORWARD. VERIFY."
 */

const DEFAULT_SERVER_URL = 'http://localhost:3000';

// Global state in service worker
let cachedSessionToken = null;
let sessionExpiresAt = 0;

/**
 * Acquire or refresh short-lived server-validated session token.
 * No permanent shared secrets are embedded in the extension.
 */
async function getSessionToken(serverUrl = DEFAULT_SERVER_URL) {
  const now = Date.now();
  if (cachedSessionToken && now < sessionExpiresAt - 30000) {
    return cachedSessionToken;
  }

  try {
    const response = await fetch(`${serverUrl}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: 'truthline-extension-mv3', timestamp: now })
    });

    if (!response.ok) {
      throw new Error(`Session request failed: ${response.status}`);
    }

    const data = await response.json();
    cachedSessionToken = data.token;
    sessionExpiresAt = data.expiresAt || (now + 3600 * 1000);
    return cachedSessionToken;
  } catch (err) {
    console.warn('[TruthLine] Could not establish live server session:', err.message);
    return null;
  }
}

// Extension Lifecycle & Context Menus
chrome.runtime.onInstalled.addListener(() => {
  console.log('[TruthLine] Extension installed. Initializing defaults...');
  
  // Set default settings: WhatsApp scanning is explicitly OFF by default
  chrome.storage.local.get(['serverUrl', 'whatsAppScanningEnabled', 'userConsent'], (res) => {
    chrome.storage.local.set({
      serverUrl: res.serverUrl || DEFAULT_SERVER_URL,
      whatsAppScanningEnabled: res.whatsAppScanningEnabled ?? false,
      userConsent: res.userConsent ?? false,
      extensionEnabled: true
    });
  });

  // Create Context Menu for selected text
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'truthline-verify-selection',
      title: 'Verify with TruthLine AI ("%s")',
      contexts: ['selection']
    });
    chrome.contextMenus.create({
      id: 'truthline-open-panel',
      title: 'Open TruthLine Investigation Panel',
      contexts: ['action']
    });
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'truthline-verify-selection' && info.selectionText) {
    const textToVerify = info.selectionText.trim();
    if (!textToVerify) return;

    // Save pending claim to storage and open panel
    await chrome.storage.local.set({
      pendingVerification: {
        text: textToVerify,
        inputType: 'selected_text',
        sourceUrl: tab?.url || 'web_selection',
        timestamp: Date.now()
      }
    });

    openInvestigationPanel();
  } else if (info.menuItemId === 'truthline-open-panel') {
    openInvestigationPanel();
  }
});

/**
 * Open Investigation Panel (Side panel if supported, or dedicated full tab)
 */
async function openInvestigationPanel() {
  const panelUrl = chrome.runtime.getURL('panel/panel.html');

  // If chrome.sidePanel API exists in Chrome 114+
  if (chrome.sidePanel && typeof chrome.sidePanel.open === 'function') {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab?.windowId) {
        await chrome.sidePanel.open({ windowId: activeTab.windowId });
        return;
      }
    } catch {
      // Fallback to opening tab
    }
  }

  // Check if panel is already open in a tab
  const tabs = await chrome.tabs.query({ url: panelUrl });
  if (tabs.length > 0 && tabs[0].id) {
    await chrome.tabs.update(tabs[0].id, { active: true });
  } else {
    await chrome.tabs.create({ url: panelUrl });
  }
}

// Runtime message dispatcher
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_SESSION') {
    chrome.storage.local.get(['serverUrl'], async (data) => {
      const url = data.serverUrl || DEFAULT_SERVER_URL;
      const token = await getSessionToken(url);
      sendResponse({ token, serverUrl: url });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'OPEN_PANEL') {
    openInvestigationPanel().then(() => sendResponse({ success: true }));
    return true;
  }

  if (request.action === 'CHECK_HEALTH') {
    chrome.storage.local.get(['serverUrl'], async (data) => {
      const url = data.serverUrl || DEFAULT_SERVER_URL;
      try {
        const resp = await fetch(`${url}/api/health`, { method: 'GET' });
        const health = await resp.json();
        sendResponse({ connected: true, data: health });
      } catch (err) {
        sendResponse({ connected: false, error: err.message });
      }
    });
    return true;
  }

  if (request.action === 'STORE_VERIFICATION_RESULT') {
    chrome.storage.local.set({ lastResult: request.result }, () => {
      sendResponse({ saved: true });
    });
    return true;
  }
});
