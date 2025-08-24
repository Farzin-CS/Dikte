/**
 * UI Manager
 * Handles all user interface interactions, modals, toasts, and theme management
 */

class UIManager {
    constructor() {
        this.currentTheme = 'light';
        this.toastQueue = [];
        this.isProcessingToasts = false;
        
        this.init();
    }

    /**
     * Initialize UI manager
     */
    init() {
        this.loadTheme();
        this.bindEvents();
    }

    /**
     * Bind UI event listeners
     */
    bindEvents() {
        console.log('Binding UI events...');
        // We'll bind form events when the new-dikte tab is loaded
        this.bindFormEvents();
        
        // History filter
        const historyFilter = document.getElementById('history-filter');
        if (historyFilter) {
            historyFilter.addEventListener('change', (e) => {
                this.handleHistoryFilterChange(e.target.value);
            });
        }

        // Settings form
        this.loadSettingsForm();
    }

    /**
     * Bind form events (called when new-dikte tab is loaded)
     */
    bindFormEvents() {
        // Form submissions
        const newDikteForm = document.getElementById('new-dikte-form');
        if (newDikteForm) {
            // Remove existing listeners to prevent duplicates
            newDikteForm.replaceWith(newDikteForm.cloneNode(true));
            const newForm = document.getElementById('new-dikte-form');
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Form submitted');
                this.handleNewDikteSubmit();
            });
        }

        // Cancel buttons
        const cancelDikteBtn = document.getElementById('cancel-dikte');
        if (cancelDikteBtn) {
            cancelDikteBtn.replaceWith(cancelDikteBtn.cloneNode(true));
            const newCancelBtn = document.getElementById('cancel-dikte');
            newCancelBtn.addEventListener('click', () => {
                console.log('Cancel clicked');
                this.resetNewDikteForm();
            });
        }
    }

    /**
     * Load and apply current theme
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        this.currentTheme = savedTheme || systemTheme;
        this.setTheme(this.currentTheme);
    }

    /**
     * Set theme (light/dark)
     */
    setTheme(theme) {
        this.currentTheme = theme;
        
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Update theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('svg');
            if (icon) {
                if (theme === 'dark') {
                    icon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    `;
                } else {
                    icon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    `;
                }
            }
        }

        // Update settings form
        this.updateSettingsForm();
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Update tab navigation
     */
    updateTabNavigation(activeTab) {
        // Update desktop navigation
        const desktopTabs = document.querySelectorAll('.nav-tab');
        desktopTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === activeTab) {
                tab.classList.add('active');
            }
        });

        // Update mobile navigation
        const mobileTabs = document.querySelectorAll('.mobile-nav-tab');
        mobileTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === activeTab) {
                tab.classList.add('active');
            }
        });

        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${activeTab}-content`) {
                content.classList.add('active');
            }
        });
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Focus first focusable element
            const firstFocusable = modal.querySelector('button, input, select, textarea');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = {
            id: Date.now(),
            message,
            type,
            duration
        };

        this.toastQueue.push(toast);
        this.processToastQueue();
    }

    /**
     * Process toast queue
     */
    async processToastQueue() {
        if (this.isProcessingToasts || this.toastQueue.length === 0) {
            return;
        }

        this.isProcessingToasts = true;

        while (this.toastQueue.length > 0) {
            const toast = this.toastQueue.shift();
            await this.displayToast(toast);
        }

        this.isProcessingToasts = false;
    }

    /**
     * Display individual toast
     */
    async displayToast(toast) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toastElement = document.createElement('div');
        toastElement.className = `toast ${toast.type}`;
        toastElement.innerHTML = `
            <div class="flex items-center">
                ${this.getToastIcon(toast.type)}
                <span class="font-vazir">${toast.message}</span>
            </div>
        `;

        container.appendChild(toastElement);

        // Animate in
        await this.animateToast(toastElement, 'in');

        // Auto remove after duration
        setTimeout(async () => {
            await this.animateToast(toastElement, 'out');
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, toast.duration);
    }

    /**
     * Animate toast
     */
    async animateToast(element, direction) {
        return new Promise(resolve => {
            if (direction === 'in') {
                element.style.transform = 'translateX(-100%)';
                element.style.opacity = '0';
                
                requestAnimationFrame(() => {
                    element.style.transition = 'all 0.3s ease-out';
                    element.style.transform = 'translateX(0)';
                    element.style.opacity = '1';
                    
                    setTimeout(resolve, 300);
                });
            } else {
                element.style.transition = 'all 0.3s ease-in';
                element.style.transform = 'translateX(-100%)';
                element.style.opacity = '0';
                
                setTimeout(resolve, 300);
            }
        });
    }

    /**
     * Get toast icon based on type
     */
    getToastIcon(type) {
        const icons = {
            success: `<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>`,
            error: `<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>`,
            warning: `<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>`,
            info: `<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>`
        };

        return icons[type] || icons.info;
    }

    /**
     * Handle new dikte form submission
     */
    async handleNewDikteSubmit() {
        const form = document.getElementById('new-dikte-form');
        const formData = new FormData(form);
        
        const dikteData = {
            title: formData.get('dikte-title') || document.getElementById('dikte-title')?.value,
            text: formData.get('dikte-text') || document.getElementById('dikte-text')?.value,
            difficulty: formData.get('difficulty-level') || document.getElementById('difficulty-level')?.value,
            category: formData.get('category') || document.getElementById('category')?.value,
            createdAt: new Date().toISOString()
        };

        if (!dikteData.title || !dikteData.text) {
            this.showToast('لطفاً تمام فیلدها را پر کنید', 'error');
            return;
        }

        try {
            // Get dikte manager from global app
            const dikteManager = window.dikteApp?.getModule('dikte');
            if (dikteManager) {
                await dikteManager.createDikte(dikteData);
                this.showToast('دیکته با موفقیت ایجاد شد', 'success');
                this.resetNewDikteForm();
                
                // Refresh dashboard
                if (window.dikteApp) {
                    window.dikteApp.loadDashboardData();
                }
            } else {
                this.showToast('خطا در دسترسی به مدیر دیکته', 'error');
            }
        } catch (error) {
            console.error('Error creating dikte:', error);
            this.showToast('خطا در ایجاد دیکته', 'error');
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
     * Handle history filter change
     */
    handleHistoryFilterChange(filter) {
        // This will be implemented when history functionality is added
        console.log('History filter changed:', filter);
    }

    /**
     * Update history list
     */
    updateHistoryList(history) {
        const container = document.getElementById('history-list');
        if (!container) return;

        if (history.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="font-vazir">هنوز تمرینی انجام نشده است</p>
                </div>
            `;
            return;
        }

        const historyHTML = history.map(item => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 dark:text-white font-vazir">${item.dikteTitle || 'دیکته بدون عنوان'}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 font-vazir">${this.formatDate(item.date)}</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.correct ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }">
                            ${item.correct ? 'صحیح' : 'نادرست'}
                        </span>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${item.duration || 0} ثانیه</p>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = historyHTML;
    }

    /**
     * Load settings form with current values
     */
    loadSettingsForm() {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const notificationsToggle = document.getElementById('notifications-toggle');
        const soundToggle = document.getElementById('sound-toggle');
        const audioSpeed = document.getElementById('audio-speed');
        const repeatCount = document.getElementById('repeat-count');

        if (darkModeToggle) darkModeToggle.checked = settings.darkMode || false;
        if (notificationsToggle) notificationsToggle.checked = settings.notifications || false;
        if (soundToggle) soundToggle.checked = settings.sound || false;
        if (audioSpeed) audioSpeed.value = settings.audioSpeed || '1';
        if (repeatCount) repeatCount.value = settings.repeatCount || '2';
    }

    /**
     * Update settings form
     */
    updateSettingsForm() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = this.currentTheme === 'dark';
        }
    }

    /**
     * Show loading state
     */
    showLoading(element) {
        if (element) {
            element.classList.add('loading');
            element.disabled = true;
        }
    }

    /**
     * Hide loading state
     */
    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
            element.disabled = false;
        }
    }

    /**
     * Show confirmation dialog
     */
    async showConfirmation(message, title = 'تأیید') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title font-vazir">${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p class="font-vazir">${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" id="confirm-cancel">انصراف</button>
                        <button class="btn-primary" id="confirm-ok">تأیید</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const cancelBtn = modal.querySelector('#confirm-cancel');
            const okBtn = modal.querySelector('#confirm-ok');

            const cleanup = () => {
                document.body.removeChild(modal);
            };

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            okBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            // Close on overlay click
            modal.querySelector('.modal-overlay').addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
        });
    }

    /**
     * Show file picker
     */
    showFilePicker(accept = '*', multiple = false) {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = multiple;
            input.style.display = 'none';

            input.addEventListener('change', (e) => {
                resolve(multiple ? Array.from(e.target.files) : e.target.files[0]);
                document.body.removeChild(input);
            });

            document.body.appendChild(input);
            input.click();
        });
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
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('متن کپی شد', 'success');
            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            this.showToast('خطا در کپی کردن متن', 'error');
            return false;
        }
    }

    /**
     * Share content
     */
    async shareContent(title, text, url) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url
                });
                return true;
            } catch (error) {
                console.error('Share failed:', error);
                return false;
            }
        } else {
            // Fallback to copying URL
            return this.copyToClipboard(url);
        }
    }

    /**
     * Show keyboard shortcuts help
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: '1-4', description: 'تغییر تب' },
            { key: 'Escape', description: 'بستن مودال' },
            { key: 'Ctrl/Cmd + K', description: 'جستجو' }
        ];

        const shortcutsHTML = shortcuts.map(shortcut => `
            <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <kbd class="px-2 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 rounded">${shortcut.key}</kbd>
                <span class="font-vazir">${shortcut.description}</span>
            </div>
        `).join('');

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title font-vazir">کلیدهای میانبر</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${shortcutsHTML}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        const cleanup = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener('click', cleanup);
        overlay.addEventListener('click', cleanup);
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
