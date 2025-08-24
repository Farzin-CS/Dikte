/**
 * Dikte App - Main Application File
 * Handles app initialization, routing, and global state management
 */

class DikteApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.isInitialized = false;
        this.modules = {};
        
        // Initialize the app
        this.init();
    }

    /**
     * Initialize all app modules
     */
    async initModules() {
        console.log('Initializing modules...');
        this.modules = {
            storage: new StorageManager(),
            ui: new UIManager(),
            dikte: new DikteManager(),
            practice: new PracticeManager(),
            audio: new AudioManager()
        };
        
        console.log('Modules created, initializing dependencies...');
        // Initialize managers with dependencies
        await this.modules.dikte.init(this.modules.storage);
        this.modules.practice.init(this.modules.storage, this.modules.audio, this.modules.ui);
        console.log('All modules initialized successfully');
    }

    /**
     * Bind global event listeners
     */
    bindEvents() {
        console.log('Binding global events...');
        // Tab navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-tab, .mobile-nav-tab')) {
                e.preventDefault();
                const tab = e.target.dataset.tab;
                console.log('Tab clicked:', tab);
                this.switchTab(tab);
            }
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Settings modal
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettings = document.getElementById('close-settings');
        const cancelSettings = document.getElementById('cancel-settings');
        const saveSettings = document.getElementById('save-settings');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.modules.ui.showModal('settings-modal');
            });
        }

        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                this.modules.ui.hideModal('settings-modal');
            });
        }

        if (cancelSettings) {
            cancelSettings.addEventListener('click', () => {
                this.modules.ui.hideModal('settings-modal');
            });
        }

        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Modal overlay click to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.modules.ui.hideModal(modal.id);
                }
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveAppState();
        });

        window.addEventListener('online', () => {
            this.modules.ui.showToast('اتصال به اینترنت برقرار شد', 'success');
        });

        window.addEventListener('offline', () => {
            this.modules.ui.showToast('اتصال به اینترنت قطع شد', 'warning');
        });
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading screen
            this.showLoading();

            // Initialize modules
            await this.initModules();
            
            // Bind event listeners
            this.bindEvents();

            // Load app state
            await this.loadAppState();

            // Initialize theme
            this.initTheme();

            // Load initial data
            await this.loadInitialData();

            // Hide loading screen
            this.hideLoading();

            // Mark as initialized
            this.isInitialized = true;

            // Show welcome message
            this.showWelcomeMessage();

        } catch (error) {
            console.error('App initialization failed:', error);
            if (this.modules.ui) {
                this.modules.ui.showToast('خطا در راه‌اندازی برنامه', 'error');
            }
            this.hideLoading();
        }
    }

    /**
     * Show loading screen
     */
    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    /**
     * Load application state from storage
     */
    async loadAppState() {
        try {
            const state = await this.modules.storage.get('appState');
            if (state) {
                this.currentTab = state.currentTab || 'dashboard';
                this.modules.ui.setTheme(state.theme || 'light');
            }
        } catch (error) {
            console.error('Failed to load app state:', error);
        }
    }

    /**
     * Save application state to storage
     */
    async saveAppState() {
        try {
            const state = {
                currentTab: this.currentTab,
                theme: this.modules.ui.getCurrentTheme(),
                lastVisit: new Date().toISOString()
            };
            await this.modules.storage.set('appState', state);
        } catch (error) {
            console.error('Failed to save app state:', error);
        }
    }

    /**
     * Initialize theme based on user preference
     */
    initTheme() {
        const savedTheme = this.modules.storage.getSync('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemTheme;
        
        this.modules.ui.setTheme(theme);
    }

    /**
     * Load initial data for the app
     */
    async loadInitialData() {
        try {
            // Load dashboard data
            await this.loadDashboardData();

            // Load practice diktes
            await this.modules.practice.loadPracticeDiktas();

            // Load history
            await this.loadHistoryData();

        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    /**
     * Load dashboard statistics and recent activities
     */
    async loadDashboardData() {
        try {
            const diktas = await this.modules.dikte.getAllDiktas();
            const history = await this.modules.storage.get('practiceHistory') || [];
            
            // Calculate statistics
            const totalDiktas = diktas.length;
            const completedPractices = history.length;
            const successRate = completedPractices > 0 
                ? Math.round((history.filter(h => h.correct).length / completedPractices) * 100)
                : 0;
            const totalStudyTime = history.reduce((total, h) => total + (h.duration || 0), 0);

            // Update dashboard UI
            this.updateDashboardStats(totalDiktas, successRate, totalStudyTime);
            this.updateRecentActivities(history.slice(0, 5));

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats(totalDiktas, successRate, studyTime) {
        const totalElement = document.getElementById('total-diktas');
        const successElement = document.getElementById('success-rate');
        const timeElement = document.getElementById('study-time');

        if (totalElement) totalElement.textContent = totalDiktas;
        if (successElement) successElement.textContent = `${successRate}%`;
        if (timeElement) timeElement.textContent = `${Math.round(studyTime / 60)} دقیقه`;
    }

    /**
     * Update recent activities list
     */
    updateRecentActivities(activities) {
        const container = document.getElementById('recent-activities');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-gray-500 dark:text-gray-400">
                    <p>هنوز فعالیتی ثبت نشده است</p>
                </div>
            `;
            return;
        }

        const activitiesHTML = activities.map(activity => `
            <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3 space-x-reverse">
                        <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">${activity.dikteTitle}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">${this.formatDate(activity.date)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium ${activity.correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                            ${activity.correct ? 'صحیح' : 'نادرست'}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${activity.duration || 0} ثانیه</p>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHTML;
    }

    /**
     * Load history data
     */
    async loadHistoryData() {
        try {
            const history = await this.modules.storage.get('practiceHistory') || [];
            this.modules.ui.updateHistoryList(history);
        } catch (error) {
            console.error('Failed to load history data:', error);
        }
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        if (this.currentTab === tabName) return;

        // Update current tab
        this.currentTab = tabName;

        // Update navigation
        this.modules.ui.updateTabNavigation(tabName);

        // Load tab-specific data
        this.loadTabData(tabName);

        // Save state
        this.saveAppState();
    }

    /**
     * Load data specific to each tab
     */
    async loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'history':
                await this.loadHistoryData();
                break;
            case 'practice':
                await this.modules.practice.loadPracticeDiktas();
                // Bind practice events when practice tab is loaded
                this.modules.practice.bindPracticeSetupEvents();
                break;
            case 'new-dikte':
                // Reset form and bind events
                this.resetNewDikteForm();
                this.modules.ui.bindFormEvents();
                break;
        }
    }

    /**
     * Reset new dikte form
     */
    resetNewDikteForm() {
        const form = document.getElementById('new-dikte-form');
        if (form) {
            form.reset();
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentTheme = this.modules.ui.getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.modules.ui.setTheme(newTheme);
        this.modules.storage.setSync('theme', newTheme);
    }

    /**
     * Save settings from modal
     */
    async saveSettings() {
        try {
            const settings = {
                darkMode: document.getElementById('dark-mode-toggle')?.checked || false,
                notifications: document.getElementById('notifications-toggle')?.checked || false,
                sound: document.getElementById('sound-toggle')?.checked || false,
                audioSpeed: document.getElementById('audio-speed')?.value || '1',
                repeatCount: document.getElementById('repeat-count')?.value || '2'
            };

            await this.modules.storage.set('settings', settings);
            
            // Apply settings
            this.modules.ui.setTheme(settings.darkMode ? 'dark' : 'light');
            this.modules.audio.updateSettings(settings);

            this.modules.ui.hideModal('settings-modal');
            this.modules.ui.showToast('تنظیمات ذخیره شد', 'success');

        } catch (error) {
            console.error('Failed to save settings:', error);
            this.modules.ui.showToast('خطا در ذخیره تنظیمات', 'error');
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            // Focus search if available
        }

        // Escape: Close modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal:not(.hidden)');
            if (openModal) {
                this.modules.ui.hideModal(openModal.id);
            }
        }

        // Number keys: Switch tabs
        if (e.key >= '1' && e.key <= '4') {
            const tabs = ['dashboard', 'new-dikte', 'history', 'practice'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabs[tabIndex]) {
                this.switchTab(tabs[tabIndex]);
            }
        }
    }

    /**
     * Show welcome message for new users
     */
    showWelcomeMessage() {
        const isFirstVisit = !this.modules.storage.getSync('hasVisited');
        if (isFirstVisit) {
            this.modules.ui.showToast('به اپلیکیشن دیکته خوش آمدید!', 'info');
            this.modules.storage.setSync('hasVisited', true);
        }
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'امروز';
        } else if (diffDays === 2) {
            return 'دیروز';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} روز پیش`;
        } else {
            return date.toLocaleDateString('fa-IR');
        }
    }

    /**
     * Get module by name
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Check if app is ready
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Reload app data
     */
    async reload() {
        await this.loadInitialData();
        this.modules.ui.showToast('داده‌ها به‌روزرسانی شد', 'success');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing DikteApp...');
    window.dikteApp = new DikteApp();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DikteApp;
}
