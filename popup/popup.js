/**
 * Popup Script for YouTube Speed Memory Extension
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const toggleEnabled = document.getElementById('toggle-enabled');
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const savedCountBadge = document.getElementById('saved-count-badge');

  // Current Video Tab Elements
  const activeChannelCard = document.getElementById('active-channel-card');
  const noVideoCard = document.getElementById('no-video-card');
  const activeChannelName = document.getElementById('active-channel-name');
  const activeChannelHandle = document.getElementById('active-channel-handle');
  const activeChannelAvatar = document.getElementById('active-channel-avatar');
  const currentSpeedValue = document.getElementById('current-speed-value');
  const speedSlider = document.getElementById('speed-slider');
  const btnSpeedMinus = document.getElementById('btn-speed-minus');
  const btnSpeedPlus = document.getElementById('btn-speed-plus');
  const resetChannelBtn = document.getElementById('reset-channel-btn');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Saved Channels Tab Elements
  const channelSearchInput = document.getElementById('channel-search-input');
  const savedChannelsList = document.getElementById('saved-channels-list');
  const noSavedChannels = document.getElementById('no-saved-channels');
  const clearAllBtn = document.getElementById('clear-all-btn');

  // Settings Tab Elements
  const settingDefaultSpeed = document.getElementById('setting-default-speed');
  const settingShowToast = document.getElementById('setting-show-toast');
  const settingToastDuration = document.getElementById('setting-toast-duration');
  const btnExportData = document.getElementById('btn-export-data');
  const fileImportData = document.getElementById('file-import-data');

  // Local state
  let activeTabId = null;
  let activeChannel = null;
  let currentSpeed = 1.0;
  let allSavedChannels = {};

  // Initialize
  await initSettings();
  await checkActiveTab();
  await loadSavedChannels();
  setupEventListeners();

  /**
   * Initialize and display extension settings
   */
  async function initSettings() {
    if (!window.SpeedStorage) return;
    const settings = await window.SpeedStorage.getSettings();

    toggleEnabled.checked = settings.enabled !== false;
    setSelectedSpeedOption(settingDefaultSpeed, settings.defaultSpeed);
    settingShowToast.checked = settings.showToast !== false;
    setSelectedDropdownByValue(settingToastDuration, settings.toastDuration);
  }

  /**
   * Robustly select dropdown option by floating point speed value
   */
  function setSelectedSpeedOption(selectEl, speed) {
    if (!selectEl) return;
    const targetSpeed = parseFloat(speed);
    if (isNaN(targetSpeed)) return;

    let matched = false;
    for (let i = 0; i < selectEl.options.length; i++) {
      const optVal = parseFloat(selectEl.options[i].value);
      if (!isNaN(optVal) && Math.abs(optVal - targetSpeed) < 0.01) {
        selectEl.selectedIndex = i;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const opt = document.createElement('option');
      opt.value = targetSpeed.toFixed(2).replace(/\.00$/, '');
      opt.textContent = `${opt.value}x`;
      selectEl.appendChild(opt);
      selectEl.selectedIndex = selectEl.options.length - 1;
    }
  }

  /**
   * Select dropdown option by string value
   */
  function setSelectedDropdownByValue(selectEl, value) {
    if (!selectEl || value === undefined || value === null) return;
    const strVal = String(value);
    for (let i = 0; i < selectEl.options.length; i++) {
      if (selectEl.options[i].value === strVal) {
        selectEl.selectedIndex = i;
        return;
      }
    }
  }

  /**
   * Check active browser tab to inspect if YouTube video is playing
   */
  async function checkActiveTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        showNoVideoState();
        return;
      }

      const tab = tabs[0];
      activeTabId = tab.id;

      if (!tab.url || (!tab.url.includes('youtube.com/watch') && !tab.url.includes('youtube.com/shorts'))) {
        showNoVideoState();
        return;
      }

      // Query content script
      chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_STATUS' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          showNoVideoState();
          return;
        }

        if (response.isWatchPage && response.channel && response.channel.id) {
          activeChannel = response.channel;
          currentSpeed = response.currentSpeed || 1.0;
          renderActiveChannel(activeChannel, currentSpeed);
        } else {
          showNoVideoState();
        }
      });
    } catch (err) {
      showNoVideoState();
    }
  }

  function showNoVideoState() {
    activeChannelCard.style.display = 'none';
    noVideoCard.style.display = 'block';
  }

  /**
   * Render the active YouTube channel card
   */
  function renderActiveChannel(channel, speed) {
    activeChannelCard.style.display = 'block';
    noVideoCard.style.display = 'none';

    activeChannelName.textContent = channel.name || 'Unknown Channel';
    activeChannelHandle.textContent = channel.id || '';

    // First letter avatar
    const firstChar = (channel.name || 'Y').trim().charAt(0).toUpperCase();
    activeChannelAvatar.textContent = firstChar;

    updateSpeedDisplay(speed);
  }

  /**
   * Update speed UI controls (display text, slider, active preset)
   */
  function updateSpeedDisplay(speed) {
    currentSpeed = Math.round(speed * 100) / 100;
    currentSpeedValue.textContent = currentSpeed.toFixed(2).replace(/\.00$/, '');
    speedSlider.value = currentSpeed;

    // Highlight matching preset button
    presetButtons.forEach((btn) => {
      const btnSpeed = parseFloat(btn.dataset.speed);
      if (Math.abs(btnSpeed - currentSpeed) < 0.01) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Load and render saved channels from storage
   */
  async function loadSavedChannels() {
    if (!window.SpeedStorage) return;
    allSavedChannels = await window.SpeedStorage.getAllChannelSpeeds();
    renderSavedChannelsList();
  }

  function renderSavedChannelsList(filterText = '') {
    savedChannelsList.innerHTML = '';
    const keys = Object.keys(allSavedChannels);
    savedCountBadge.textContent = keys.length;

    const query = filterText.toLowerCase().trim();
    const filteredKeys = keys.filter((key) => {
      const item = allSavedChannels[key];
      return (
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    });

    if (filteredKeys.length === 0) {
      noSavedChannels.style.display = 'block';
      clearAllBtn.style.display = 'none';
      return;
    }

    noSavedChannels.style.display = 'none';
    clearAllBtn.style.display = 'block';

    // Sort by most recently updated
    filteredKeys.sort((a, b) => {
      return (allSavedChannels[b].updatedAt || 0) - (allSavedChannels[a].updatedAt || 0);
    });

    filteredKeys.forEach((key) => {
      const item = allSavedChannels[key];
      const div = document.createElement('div');
      div.className = 'channel-item';

      const metaDiv = document.createElement('div');
      metaDiv.className = 'channel-item-meta';

      const nameDiv = document.createElement('div');
      nameDiv.className = 'channel-item-name';
      nameDiv.textContent = item.name || item.id;

      const idDiv = document.createElement('div');
      idDiv.className = 'channel-item-id';
      idDiv.textContent = item.id;

      metaDiv.appendChild(nameDiv);
      metaDiv.appendChild(idDiv);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'channel-item-actions';

      const speedSpan = document.createElement('span');
      speedSpan.className = 'channel-speed-pill';
      speedSpan.textContent = `${item.speed.toFixed(2).replace(/\.00$/, '')}x`;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'item-delete-btn';
      deleteBtn.title = 'Delete saved speed';
      deleteBtn.dataset.key = item.id;
      deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';

      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.SpeedStorage.removeChannelSpeed(item.id);
        delete allSavedChannels[item.id];
        renderSavedChannelsList(channelSearchInput.value);

        // If currently on this channel, reset it
        if (activeChannel && activeChannel.id === item.id) {
          resetActiveChannel();
        }
      });

      actionsDiv.appendChild(speedSpan);
      actionsDiv.appendChild(deleteBtn);

      div.appendChild(metaDiv);
      div.appendChild(actionsDiv);

      savedChannelsList.appendChild(div);
    });
  }

  /**
   * Apply a new playback speed to the active channel
   */
  async function applySpeed(speed) {
    const rounded = Math.max(0.25, Math.min(3.0, Math.round(speed * 100) / 100));
    updateSpeedDisplay(rounded);

    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        action: 'APPLY_CHANNEL_SPEED',
        speed: rounded,
      });
    }

    if (activeChannel && activeChannel.id && window.SpeedStorage) {
      const primaryKey = activeChannel.handle || activeChannel.id;
      const aliases = [activeChannel.channelId, activeChannel.id].filter(
        (k) => Boolean(k) && k !== primaryKey
      );
      await window.SpeedStorage.saveChannelSpeed(
        primaryKey,
        activeChannel.name,
        rounded,
        aliases
      );
      await loadSavedChannels();
    }
  }

  /**
   * Reset active channel to default speed
   */
  async function resetActiveChannel() {
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'RESET_CHANNEL_SPEED' }, (res) => {
        const defaultSpeed = res?.defaultSpeed || 1.0;
        updateSpeedDisplay(defaultSpeed);
      });
    }
    if (activeChannel && activeChannel.id && window.SpeedStorage) {
      const keysToRemove = [activeChannel.id, activeChannel.handle, activeChannel.channelId].filter(Boolean);
      for (const k of keysToRemove) {
        await window.SpeedStorage.removeChannelSpeed(k);
      }
      await loadSavedChannels();
    }
  }

  /**
   * Setup UI Event Listeners
   */
  function setupEventListeners() {
    // Navigation Tabs
    navTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        navTabs.forEach((t) => t.classList.remove('active'));
        tabPanes.forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const paneId = tab.dataset.tab;
        document.getElementById(paneId)?.classList.add('active');
      });
    });

    // Master Enabled Toggle
    toggleEnabled.addEventListener('change', async () => {
      const isEnabled = toggleEnabled.checked;
      await window.SpeedStorage.updateSettings({ enabled: isEnabled });
      notifyActiveTabSettingsUpdated();
    });

    // Preset Speed Buttons
    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed);
        applySpeed(speed);
      });
    });

    // Slider
    speedSlider.addEventListener('input', () => {
      const speed = parseFloat(speedSlider.value);
      applySpeed(speed);
    });

    // Steppers
    btnSpeedMinus.addEventListener('click', () => {
      applySpeed(currentSpeed - 0.05);
    });

    btnSpeedPlus.addEventListener('click', () => {
      applySpeed(currentSpeed + 0.05);
    });

    // Reset button
    resetChannelBtn.addEventListener('click', () => {
      resetActiveChannel();
    });

    // Search input
    channelSearchInput.addEventListener('input', () => {
      renderSavedChannelsList(channelSearchInput.value);
    });

    // Clear All Channels
    clearAllBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear all remembered channel speeds?')) {
        await window.SpeedStorage.clearAllChannelSpeeds();
        allSavedChannels = {};
        renderSavedChannelsList();
      }
    });

    // Settings dropdowns
    const onDefaultSpeedChange = async () => {
      const val = parseFloat(settingDefaultSpeed.value);
      if (!isNaN(val) && Number.isFinite(val)) {
        await window.SpeedStorage.updateSettings({
          defaultSpeed: val,
        });
        notifyActiveTabSettingsUpdated();
      }
    };
    settingDefaultSpeed.addEventListener('change', onDefaultSpeedChange);
    settingDefaultSpeed.addEventListener('input', onDefaultSpeedChange);

    settingShowToast.addEventListener('change', async () => {
      await window.SpeedStorage.updateSettings({
        showToast: settingShowToast.checked,
      });
      notifyActiveTabSettingsUpdated();
    });

    const onToastDurationChange = async () => {
      const val = parseInt(settingToastDuration.value, 10);
      if (!isNaN(val) && Number.isFinite(val)) {
        await window.SpeedStorage.updateSettings({
          toastDuration: val,
        });
        notifyActiveTabSettingsUpdated();
      }
    };
    settingToastDuration.addEventListener('change', onToastDurationChange);
    settingToastDuration.addEventListener('input', onToastDurationChange);

    // Export Data
    btnExportData.addEventListener('click', async () => {
      const data = await window.SpeedStorage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yt-speed-memory-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Import Data
    fileImportData.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Limit file size to 2MB to prevent memory exhaustion
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Backup file must be under 2MB.');
        fileImportData.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          await window.SpeedStorage.importData(parsed);
          await initSettings();
          await loadSavedChannels();
          notifyActiveTabSettingsUpdated();
          alert('Settings and channels successfully imported!');
        } catch (err) {
          alert('Failed to parse backup JSON file: ' + (err.message || 'Invalid format'));
        } finally {
          fileImportData.value = '';
        }
      };
      reader.readAsText(file);
    });
  }

  function notifyActiveTabSettingsUpdated() {
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'SETTINGS_UPDATED' }, () => {
        if (chrome.runtime.lastError) {
          // Ignored
        }
      });
    }
  }
});
