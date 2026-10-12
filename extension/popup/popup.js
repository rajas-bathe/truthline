/**
 * TRUTHLINE AI — Chrome Extension Popup Logic
 * "DON'T JUST FORWARD. VERIFY."
 */

(function () {
  'use strict';

  let currentTab = 'text';
  let selectedFile = null;
  let serverUrl = 'http://localhost:3000';
  let sessionToken = null;
  let isProcessing = false;

  // DOM Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const backendStatusPill = document.getElementById('backend-status-pill');
  const openPanelBtn = document.getElementById('open-panel-btn');
  const verifySubmitBtn = document.getElementById('verify-submit-btn');
  const userConsentCheckbox = document.getElementById('user-consent-checkbox');
  const whatsappToggle = document.getElementById('whatsapp-toggle');
  const clearResultsBtn = document.getElementById('clear-results-btn');
  const historyBtn = document.getElementById('history-btn');
  const deleteHistoryBtn = document.getElementById('delete-history-btn');
  const useCurrentTabBtn = document.getElementById('use-current-tab-btn');
  const viewDeepDiveBtn = document.getElementById('view-deep-dive-btn');

  // Input Elements
  const claimTextInput = document.getElementById('claim-text-input');
  const claimUrlInput = document.getElementById('claim-url-input');
  const imageFileInput = document.getElementById('image-file-input');
  const imageDropzone = document.getElementById('image-dropzone');
  const imageFilePreview = document.getElementById('image-file-preview');
  const imageFileName = document.getElementById('image-file-name');
  const imageClearBtn = document.getElementById('image-clear-btn');

  const pdfFileInput = document.getElementById('pdf-file-input');
  const pdfDropzone = document.getElementById('pdf-dropzone');
  const pdfFilePreview = document.getElementById('pdf-file-preview');
  const pdfFileName = document.getElementById('pdf-file-name');
  const pdfClearBtn = document.getElementById('pdf-clear-btn');

  const audioFileInput = document.getElementById('audio-file-input');
  const audioDropzone = document.getElementById('audio-dropzone');
  const audioFilePreview = document.getElementById('audio-file-preview');
  const audioFileName = document.getElementById('audio-file-name');
  const audioClearBtn = document.getElementById('audio-clear-btn');

  // Progress & Result Elements
  const pipelineProgress = document.getElementById('pipeline-progress');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const stageStatusLabel = document.getElementById('stage-status-label');
  const stepDots = document.querySelectorAll('.step-dot');

  const resultContainer = document.getElementById('result-container');
  const verdictBanner = document.getElementById('verdict-banner');
  const verdictIcon = document.getElementById('verdict-icon');
  const verdictBadge = document.getElementById('verdict-badge');
  const verdictSubtitle = document.getElementById('verdict-subtitle');
  const explanationText = document.getElementById('explanation-text');
  const atomicClaimsList = document.getElementById('atomic-claims-list');
  const atomicClaimsCount = document.getElementById('atomic-claims-count');
  const sourcesList = document.getElementById('sources-list');
  const sourcesCount = document.getElementById('sources-count');
  const challengerSummary = document.getElementById('challenger-summary');
  const auditorSummary = document.getElementById('auditor-summary');

  const errorCard = document.getElementById('error-card');
  const errorMessage = document.getElementById('error-message');
  const errorRetryBtn = document.getElementById('error-retry-btn');

  // 1. Initialize settings & state
  async function init() {
    chrome.storage.local.get(['serverUrl', 'whatsAppScanningEnabled', 'userConsent', 'lastResult', 'pendingVerification'], async (data) => {
      serverUrl = data.serverUrl || 'http://localhost:3000';
      if (whatsappToggle) whatsappToggle.checked = Boolean(data.whatsAppScanningEnabled);
      if (userConsentCheckbox) userConsentCheckbox.checked = data.userConsent !== false;

      // Check backend health
      await checkHealth();

      // Check if there was pending text passed from context menu or WhatsApp
      if (data.pendingVerification) {
        handlePendingVerification(data.pendingVerification);
        chrome.storage.local.remove('pendingVerification');
      } else if (data.lastResult) {
        displayResults(data.lastResult);
      }
    });

    setupTabs();
    setupDropzones();
    setupEventListeners();
  }

  // 2. Health & Session Check
  async function checkHealth() {
    try {
      const res = await fetch(`${serverUrl}/api/health`, { method: 'GET' });
      if (!res.ok) throw new Error('Health check error');
      const data = await res.json();

      backendStatusPill.className = 'status-pill';
      if (data.isDemoMode) {
        backendStatusPill.classList.add('status-demo');
        backendStatusPill.querySelector('.status-label').textContent = 'Demo Mode';
        backendStatusPill.title = 'Running in Offline Demo Mode (No Gemini API Key set)';
      } else {
        backendStatusPill.classList.add('status-connected');
        backendStatusPill.querySelector('.status-label').textContent = 'Online';
        backendStatusPill.title = `Connected to TruthLine AI (${data.activeModel || 'Gemini'})`;
      }

      // Fetch or refresh session token
      await refreshSession();
    } catch {
      backendStatusPill.className = 'status-pill status-error';
      backendStatusPill.querySelector('.status-label').textContent = 'Offline';
      backendStatusPill.title = `Cannot connect to server at ${serverUrl}. Ensure 'npm run dev' is running.`;
    }
  }

  async function refreshSession() {
    try {
      const res = await fetch(`${serverUrl}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: 'extension-popup', timestamp: Date.now() })
      });
      if (res.ok) {
        const body = await res.json();
        sessionToken = body.token;
      }
    } catch (e) {
      console.warn('Session init failed:', e.message);
    }
  }

  // 3. Setup Tab Navigation
  function setupTabs() {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        currentTab = targetTab;

        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = document.getElementById(`tab-pane-${targetTab}`);
        if (activePane) activePane.classList.add('active');
      });
    });
  }

  // 4. File Dropzones Setup
  function setupDropzones() {
    setupSingleDropzone('image', imageDropzone, imageFileInput, imageFilePreview, imageFileName, imageClearBtn);
    setupSingleDropzone('pdf', pdfDropzone, pdfFileInput, pdfFilePreview, pdfFileName, pdfClearBtn);
    setupSingleDropzone('audio', audioDropzone, audioFileInput, audioFilePreview, audioFileName, audioClearBtn);
  }

  function setupSingleDropzone(type, dropzone, input, preview, nameLabel, clearBtn) {
    if (!dropzone || !input) return;

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer?.files?.length) {
        handleFileSelection(e.dataTransfer.files[0], type, preview, nameLabel);
      }
    });

    input.addEventListener('change', () => {
      if (input.files?.length) {
        handleFileSelection(input.files[0], type, preview, nameLabel);
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        input.value = '';
        selectedFile = null;
        preview.classList.add('hidden');
      });
    }
  }

  function handleFileSelection(file, type, preview, nameLabel) {
    // Validate file size (15MB limit)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max allowed is 15MB.`);
      return;
    }

    selectedFile = { file, type };
    if (nameLabel) nameLabel.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    if (preview) preview.classList.remove('hidden');
    hideError();
  }

  // 5. Setup Action Listeners
  function setupEventListeners() {
    verifySubmitBtn.addEventListener('click', handleVerifyClick);
    openPanelBtn.addEventListener('click', openInvestigationPanel);
    if (viewDeepDiveBtn) viewDeepDiveBtn.addEventListener('click', openInvestigationPanel);

    if (useCurrentTabBtn) {
      useCurrentTabBtn.addEventListener('click', async () => {
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab?.url) claimUrlInput.value = tab.url;
        } catch {
          // ignore
        }
      });
    }

    if (whatsappToggle) {
      whatsappToggle.addEventListener('change', () => {
        chrome.storage.local.set({ whatsAppScanningEnabled: whatsappToggle.checked });
      });
    }

    if (userConsentCheckbox) {
      userConsentCheckbox.addEventListener('change', () => {
        chrome.storage.local.set({ userConsent: userConsentCheckbox.checked });
      });
    }

    if (clearResultsBtn) {
      clearResultsBtn.addEventListener('click', () => {
        resultContainer.classList.add('hidden');
        chrome.storage.local.remove('lastResult');
      });
    }

    if (historyBtn) {
      historyBtn.addEventListener('click', openInvestigationPanel);
    }

    if (deleteHistoryBtn) {
      deleteHistoryBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete all verification history from SQLite?')) return;
        try {
          await fetch(`${serverUrl}/api/history/clear`, {
            method: 'POST',
            headers: { 'X-Truthline-Session': sessionToken || '' }
          });
          alert('Verification history cleared.');
          resultContainer.classList.add('hidden');
        } catch (e) {
          alert('Failed to clear history: ' + e.message);
        }
      });
    }

    if (errorRetryBtn) {
      errorRetryBtn.addEventListener('click', handleVerifyClick);
    }
  }

  function handlePendingVerification(data) {
    if (data.text) {
      claimTextInput.value = data.text;
      // Switch to text tab
      const textBtn = document.querySelector('[data-tab="text"]');
      if (textBtn) textBtn.click();
    }
  }

  function openInvestigationPanel() {
    chrome.runtime.sendMessage({ action: 'OPEN_PANEL' });
  }

  // 6. Verification Pipeline Execution
  async function handleVerifyClick() {
    if (isProcessing) return;

    // Check user consent
    if (userConsentCheckbox && !userConsentCheckbox.checked) {
      showError('Explicit consent is required to verify claims. Please check the consent box.');
      return;
    }

    // Prepare payload depending on active tab
    const formData = new FormData();
    formData.append('inputType', currentTab);
    formData.append('consent', 'true');

    if (currentTab === 'text') {
      const text = claimTextInput.value.trim();
      if (!text) {
        showError('Please enter a claim or message text to verify.');
        return;
      }
      formData.append('content', text);
    } else if (currentTab === 'url') {
      const url = claimUrlInput.value.trim();
      if (!url || !/^https?:\/\//i.test(url)) {
        showError('Please enter a valid HTTP/HTTPS URL.');
        return;
      }
      formData.append('url', url);
    } else if (['image', 'pdf', 'audio'].includes(currentTab)) {
      if (!selectedFile || selectedFile.type !== currentTab) {
        showError(`Please select a valid ${currentTab} file to upload.`);
        return;
      }
      formData.append('file', selectedFile.file);
    }

    // Start UI Pipeline Animation
    isProcessing = true;
    verifySubmitBtn.disabled = true;
    hideError();
    resultContainer.classList.add('hidden');
    pipelineProgress.classList.remove('hidden');

    startStageProgressAnimation();

    try {
      if (!sessionToken) {
        await refreshSession();
      }

      const headers = {};
      if (sessionToken) headers['X-Truthline-Session'] = sessionToken;

      const response = await fetch(`${serverUrl}/api/verify`, {
        method: 'POST',
        headers: headers,
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const result = await response.json();
      finishStageProgressAnimation();

      setTimeout(() => {
        pipelineProgress.classList.add('hidden');
        displayResults(result);
        chrome.storage.local.set({ lastResult: result });
      }, 500);

    } catch (err) {
      console.error('[TruthLine] Verification error:', err);
      pipelineProgress.classList.add('hidden');
      showError(err.message || 'Verification could not be completed. Check server connection.');
    } finally {
      isProcessing = false;
      verifySubmitBtn.disabled = false;
    }
  }

  // Stage animation
  let stageTimer = null;
  const STAGES = [
    { num: 1, name: 'Stage 1/8: Input Extraction & Sanitization...' },
    { num: 2, name: 'Stage 2/8: Atomic Claim Decomposition...' },
    { num: 3, name: 'Stage 3/8: Searching Grounded Evidence...' },
    { num: 4, name: 'Stage 4/8: Source Authority & Freshness Analysis...' },
    { num: 5, name: 'Stage 5/8: Claim-to-Evidence Matrix Comparison...' },
    { num: 6, name: 'Stage 6/8: Challenger Agent Counter-Check...' },
    { num: 7, name: 'Stage 7/8: Evidence Auditor Citation Audit...' },
    { num: 8, name: 'Stage 8/8: Final Verdict Synthesis...' }
  ];

  function startStageProgressAnimation() {
    let currentStageIndex = 0;
    updateStageUI(0);

    if (stageTimer) clearInterval(stageTimer);
    stageTimer = setInterval(() => {
      if (currentStageIndex < 6) {
        currentStageIndex++;
        updateStageUI(currentStageIndex);
      }
    }, 700);
  }

  function finishStageProgressAnimation() {
    if (stageTimer) clearInterval(stageTimer);
    updateStageUI(7);
  }

  function updateStageUI(idx) {
    const stage = STAGES[idx];
    if (!stage) return;

    stageStatusLabel.textContent = stage.name;
    const pct = Math.min(100, Math.round(((idx + 1) / 8) * 100));
    progressBarFill.style.width = `${pct}%`;

    stepDots.forEach((dot, dIdx) => {
      dot.classList.remove('active', 'completed');
      if (dIdx < idx) dot.classList.add('completed');
      else if (dIdx === idx) dot.classList.add('active');
    });
  }

  // 7. Display Result
  function displayResults(data) {
    resultContainer.classList.remove('hidden');

    const verdict = data.verdict || 'CANNOT_CONFIRM';
    const verdictConfig = {
      VERIFIED: { label: 'VERIFIED', icon: '✅', color: '#00f5a0', subtitle: 'Strong corroborating evidence confirmed by primary/news sources.' },
      FALSE: { label: 'FALSE', icon: '❌', color: '#f43f5e', subtitle: 'Refuted by verified fact-checkers and primary records.' },
      OUTDATED: { label: 'OUTDATED', icon: '⏳', color: '#f59e0b', subtitle: 'Previously true or old information misleadingly shared as current.' },
      PARTIALLY_SUPPORTED: { label: 'PARTIALLY SUPPORTED', icon: '⚖️', color: '#a78bfa', subtitle: 'Mix of accurate elements and unsupported or misleading claims.' },
      CANNOT_CONFIRM: { label: 'CANNOT CONFIRM', icon: '❔', color: '#94a3b8', subtitle: 'Insufficient authoritative evidence available to verify or refute.' }
    }[verdict] || { label: verdict, icon: '🛡️', color: '#94a3b8', subtitle: 'Analysis complete.' };

    verdictBanner.className = `verdict-banner verdict-${verdict.toLowerCase()}`;
    verdictIcon.textContent = verdictConfig.icon;
    verdictBadge.textContent = verdictConfig.label;
    verdictBadge.style.color = verdictConfig.color;
    verdictSubtitle.textContent = verdictConfig.subtitle;

    explanationText.textContent = data.explanation || 'No summary available.';

    // Atomic Claims
    const atomicClaims = data.atomicClaims || [];
    atomicClaimsCount.textContent = atomicClaims.length;
    atomicClaimsList.innerHTML = '';

    if (atomicClaims.length === 0) {
      atomicClaimsList.innerHTML = '<div class="text-muted">No separable claims identified.</div>';
    } else {
      atomicClaims.forEach((c) => {
        const item = document.createElement('div');
        item.className = 'atomic-claim-item';
        item.innerHTML = `
          <div class="atomic-claim-text">${escapeHtml(c.claimText || c.text)}</div>
          <span class="claim-verdict-pill verdict-${(c.verdict || 'cannot_confirm').toLowerCase()}">${c.verdict || 'UNVERIFIED'}</span>
        `;
        atomicClaimsList.appendChild(item);
      });
    }

    // Sources
    const sources = data.sources || [];
    sourcesCount.textContent = sources.length;
    sourcesList.innerHTML = '';

    if (sources.length === 0) {
      sourcesList.innerHTML = '<div class="text-muted" style="padding: 4px;">No external citations recorded.</div>';
    } else {
      sources.forEach((s) => {
        const item = document.createElement('div');
        item.className = 'source-item';
        const hostname = s.publisher || getHostname(s.url);
        item.innerHTML = `
          <div class="source-info">
            <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="source-title" title="${escapeHtml(s.title || s.url)}">
              ${escapeHtml(s.title || s.url)}
            </a>
            <div class="source-meta">${escapeHtml(hostname)} &bull; ${s.publishedDate ? escapeHtml(s.publishedDate) : 'Recent'}</div>
          </div>
          <span class="source-type-pill">${s.sourceType || 'Web'}</span>
        `;
        sourcesList.appendChild(item);
      });
    }

    // Challenger & Auditor
    challengerSummary.textContent = data.challengerNotes || 'No contradicting context or omissions detected.';
    auditorSummary.textContent = data.auditorNotes || 'Citations verified and consistent with claims.';
  }

  function showError(msg) {
    errorCard.classList.remove('hidden');
    errorMessage.textContent = msg;
  }

  function hideError() {
    errorCard.classList.add('hidden');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getHostname(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Web';
    }
  }

  // Run init
  document.addEventListener('DOMContentLoaded', init);
})();
