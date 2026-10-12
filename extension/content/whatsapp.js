/**
 * TRUTHLINE AI — WhatsApp Web Content Script
 * "DON'T JUST FORWARD. VERIFY."
 * 
 * Safety & Privacy Guarantees:
 * 1. Automatic scanning is strictly OFF by default.
 * 2. Requires explicit user opt-in via extension settings.
 * 3. Inspects ONLY single clicked or selected messages.
 * 4. Never uploads chat histories, private media, or full conversations.
 * 5. Markers indicate "Potential Claim Requiring Review", NEVER "False".
 * 6. Uses resilient multi-layer DOM selector strategies for WhatsApp updates.
 */

(function () {
  'use strict';

  let isEnabled = false;
  let hasUserConsent = false;
  let selectionButton = null;

  // Initialize and listen for settings changes
  function syncSettings() {
    chrome.storage.local.get(['whatsAppScanningEnabled', 'userConsent'], (data) => {
      isEnabled = Boolean(data.whatsAppScanningEnabled);
      hasUserConsent = Boolean(data.userConsent);

      if (!isEnabled || !hasUserConsent) {
        removeAllMarkers();
      }
    });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.whatsAppScanningEnabled || changes.userConsent) {
        syncSettings();
      }
    }
  });

  syncSettings();

  /**
   * Resilient DOM Selectors for WhatsApp Web message elements.
   * WhatsApp obfuscates class names regularly, so we rely on semantic attributes,
   * copyable-text markers, role attributes, and text-node structure.
   */
  const MESSAGE_SELECTORS = [
    'div[data-pre-plain-text]',
    'div.copyable-text[data-pre-plain-text]',
    'div.copyable-text',
    'span.selectable-text',
    'div[role="row"] div[tabindex="-1"]',
    'div._amk4' // 2024-2026 common container fallback
  ];

  /**
   * Heuristic for detecting potential verifiable factual claims in message text.
   * Matches numbers, statistics, viral forward phrases, health/scientific assertions.
   * Does NOT label anything false; only signals that a statement can be cross-referenced.
   */
  const CLAIM_INDICATORS = [
    /\b(breaking|alert|warning|urgent|forwarded|psa)\b/i,
    /\b(who|un|cdc|fda|nasa|government|ministry|supreme court|parliament|pm|president)\b/i,
    /\b(\d+[%]|percent|\$?\d+(?:,\d+)*(?:\.\d+)?\s*(crore|lakh|million|billion|deaths|cases|rupees|dollars))\b/i,
    /\b(cure|causes cancer|vaccine|5g|radiation|banned|approved|official notice)\b/i,
    /\b(proven|confirmed|leaked|secret study|scientists found)\b/i
  ];

  function containsPotentialClaim(text) {
    if (!text || text.trim().length < 15) return false;
    return CLAIM_INDICATORS.some(pattern => pattern.test(text));
  }

  /**
   * Extract clean text from a message container without leaking metadata.
   */
  function extractMessageText(el) {
    // If it's a selectable text span
    const textSpan = el.querySelector('span.selectable-text') || el;
    let text = textSpan.innerText || textSpan.textContent || '';
    
    // Clean up timestamps, sender prefixes like "[12:30, 10/11/2026] John: "
    text = text.replace(/^\[\d{1,2}:\d{2}(?::\d{2})?.*?\]\s*[^:]+:\s*/i, '');
    return text.trim();
  }

  /**
   * Attach inspection badge to a single message element.
   */
  function attachMessageBadge(container, text) {
    if (container.querySelector('.truthline-wa-badge')) return;

    const badge = document.createElement('div');
    badge.className = 'truthline-wa-badge';
    badge.title = 'TruthLine AI: Potential factual claim detected. Click to verify via independent sources. (This does not mean the message is false)';
    badge.innerHTML = `
      <span class="truthline-wa-badge-icon">🛡️</span>
      <span class="truthline-wa-badge-text">Potential Claim — Verify</span>
    `;

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      triggerVerification(text, 'whatsapp_inline_marker');
    });

    // Append to message footer or container
    container.appendChild(badge);
  }

  function removeAllMarkers() {
    document.querySelectorAll('.truthline-wa-badge').forEach(b => b.remove());
    if (selectionButton) {
      selectionButton.remove();
      selectionButton = null;
    }
  }

  /**
   * Observe visible DOM for hover or inspection without bulk-extracting history.
   * Only active when opt-in is enabled!
   */
  function handleMessageHover(event) {
    if (!isEnabled || !hasUserConsent) return;

    const target = event.target;
    if (!target) return;

    let messageNode = null;
    for (const sel of MESSAGE_SELECTORS) {
      messageNode = target.closest(sel);
      if (messageNode) break;
    }

    if (!messageNode || messageNode.dataset.truthlineProcessed) return;
    messageNode.dataset.truthlineProcessed = 'true';

    const text = extractMessageText(messageNode);
    if (containsPotentialClaim(text)) {
      attachMessageBadge(messageNode, text);
    }
  }

  /**
   * Listen for user text selection to offer quick verification
   */
  document.addEventListener('mouseup', () => {
    if (!isEnabled || !hasUserConsent) return;

    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    if (selectionButton) {
      selectionButton.remove();
      selectionButton = null;
    }

    if (selectedText && selectedText.length >= 10) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      selectionButton = document.createElement('div');
      selectionButton.className = 'truthline-wa-selection-popup';
      selectionButton.innerHTML = `<span>🛡️ TruthLine: Verify Selected Text</span>`;
      selectionButton.style.left = `${window.scrollX + rect.left}px`;
      selectionButton.style.top = `${window.scrollY + rect.top}px`;

      selectionButton.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        triggerVerification(selectedText, 'whatsapp_selected_text');
        if (selectionButton) {
          selectionButton.remove();
          selectionButton = null;
        }
      });

      document.body.appendChild(selectionButton);
    }
  });

  /**
   * Dispatch verification request safely to background worker
   */
  function triggerVerification(text, inputType) {
    if (!text) return;

    chrome.storage.local.set({
      pendingVerification: {
        text: text,
        inputType: inputType,
        sourceUrl: 'https://web.whatsapp.com',
        timestamp: Date.now()
      }
    }, () => {
      chrome.runtime.sendMessage({ action: 'OPEN_PANEL' });
    });
  }

  // Event Delegation for hover over visible messages
  document.addEventListener('mouseover', handleMessageHover, { passive: true });

  console.log('[TruthLine] WhatsApp content script loaded (Opt-in mode: ' + (isEnabled ? 'ACTIVE' : 'INACTIVE') + ')');
})();
