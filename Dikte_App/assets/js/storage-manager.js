/**
 * Storage Manager
 * Handles data persistence using localStorage and IndexedDB
 */

class StorageManager {
    constructor() {
        this.dbName = 'DikteAppDB';
        this.dbVersion = 1;
        this.db = null;
        this.isIndexedDBSupported = 'indexedDB' in window;
        
        this.init();
    }

    /**
     * Initialize storage system
     */
    async init() {
        if (this.isIndexedDBSupported) {
            await this.initIndexedDB();
        }
    }

    /**
     * Initialize IndexedDB
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('diktas')) {
                    const dikteStore = db.createObjectStore('diktas', { keyPath: 'id', autoIncrement: true });
                    dikteStore.createIndex('category', 'category', { unique: false });
                    dikteStore.createIndex('difficulty', 'difficulty', { unique: false });
                    dikteStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('practiceHistory')) {
                    const historyStore = db.createObjectStore('practiceHistory', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('dikteId', 'dikteId', { unique: false });
                    historyStore.createIndex('date', 'date', { unique: false });
                    historyStore.createIndex('correct', 'correct', { unique: false });
                }

                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                if (!db.objectStoreNames.contains('appState')) {
                    db.createObjectStore('appState', { keyPath: 'key' });
                }
            };
        });
    }

    /**
     * Store data in IndexedDB
     */
    async setIndexedDB(storeName, key, value) {
        if (!this.db) {
            throw new Error('IndexedDB not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            let request;
            if (typeof key === 'object' && key !== null) {
                // Store object directly
                request = store.put(key);
            } else {
                // Store with key-value pair
                request = store.put({ key, value });
            }

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get data from IndexedDB
     */
    async getIndexedDB(storeName, key) {
        if (!this.db) {
            throw new Error('IndexedDB not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            
            let request;
            if (typeof key === 'object' && key !== null) {
                // Get by object key
                request = store.get(key);
            } else {
                // Get by key value
                request = store.get(key);
            }

            request.onsuccess = () => {
                const result = request.result;
                if (result && typeof key === 'string') {
                    resolve(result.value);
                } else {
                    resolve(result);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete data from IndexedDB
     */
    async deleteIndexedDB(storeName, key) {
        if (!this.db) {
            throw new Error('IndexedDB not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all data from IndexedDB store
     */
    async getAllIndexedDB(storeName) {
        if (!this.db) {
            throw new Error('IndexedDB not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Query data from IndexedDB using index
     */
    async queryIndexedDB(storeName, indexName, value) {
        if (!this.db) {
            throw new Error('IndexedDB not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Store data (uses IndexedDB if available, falls back to localStorage)
     */
    async set(key, value) {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.setIndexedDB('appState', key, value);
            } else {
                return this.setLocalStorage(key, value);
            }
        } catch (error) {
            console.error('Storage set error:', error);
            // Fallback to localStorage
            return this.setLocalStorage(key, value);
        }
    }

    /**
     * Get data (uses IndexedDB if available, falls back to localStorage)
     */
    async get(key) {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.getIndexedDB('appState', key);
            } else {
                return this.getLocalStorage(key);
            }
        } catch (error) {
            console.error('Storage get error:', error);
            // Fallback to localStorage
            return this.getLocalStorage(key);
        }
    }

    /**
     * Delete data (uses IndexedDB if available, falls back to localStorage)
     */
    async delete(key) {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.deleteIndexedDB('appState', key);
            } else {
                return this.deleteLocalStorage(key);
            }
        } catch (error) {
            console.error('Storage delete error:', error);
            // Fallback to localStorage
            return this.deleteLocalStorage(key);
        }
    }

    /**
     * Store dikte data
     */
    async setDikte(dikte) {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.setIndexedDB('diktas', dikte);
            } else {
                return this.setLocalStorage(`dikte_${dikte.id}`, dikte);
            }
        } catch (error) {
            console.error('Dikte storage error:', error);
            return this.setLocalStorage(`dikte_${dikte.id}`, dikte);
        }
    }

    /**
     * Get dikte by ID
     */
    async getDikte(id) {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.getIndexedDB('diktas', id);
            } else {
                return this.getLocalStorage(`dikte_${id}`);
            }
        } catch (error) {
            console.error('Dikte retrieval error:', error);
            return this.getLocalStorage(`dikte_${id}`);
        }
    }

    /**
     * Get all diktas
     */
    async getAllDiktas() {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.getAllIndexedDB('diktas');
            } else {
                return this.getAllLocalStorageDiktas();
            }
        } catch (error) {
            console.error('Diktas retrieval error:', error);
            return this.getAllLocalStorageDiktas();
        }
    }

    /**
     * Store practice history
     */
    async setPracticeHistory(history) {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.setIndexedDB('practiceHistory', history);
            } else {
                const existingHistory = this.getLocalStorage('practiceHistory') || [];
                existingHistory.push(history);
                return this.setLocalStorage('practiceHistory', existingHistory);
            }
        } catch (error) {
            console.error('Practice history storage error:', error);
            const existingHistory = this.getLocalStorage('practiceHistory') || [];
            existingHistory.push(history);
            return this.setLocalStorage('practiceHistory', existingHistory);
        }
    }

    /**
     * Get practice history
     */
    async getPracticeHistory() {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.getAllIndexedDB('practiceHistory');
            } else {
                return this.getLocalStorage('practiceHistory') || [];
            }
        } catch (error) {
            console.error('Practice history retrieval error:', error);
            return this.getLocalStorage('practiceHistory') || [];
        }
    }

    /**
     * Store settings
     */
    async setSettings(settings) {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.setIndexedDB('settings', { key: 'appSettings', ...settings });
            } else {
                return this.setLocalStorage('settings', settings);
            }
        } catch (error) {
            console.error('Settings storage error:', error);
            return this.setLocalStorage('settings', settings);
        }
    }

    /**
     * Get settings
     */
    async getSettings() {
        try {
            if (this.isIndexedDBSupported && this.db) {
                const result = await this.getIndexedDB('settings', 'appSettings');
                return result || {};
            } else {
                return this.getLocalStorage('settings') || {};
            }
        } catch (error) {
            console.error('Settings retrieval error:', error);
            return this.getLocalStorage('settings') || {};
        }
    }

    /**
     * Query diktas by category
     */
    async getDiktasByCategory(category) {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.queryIndexedDB('diktas', 'category', category);
            } else {
                const allDiktas = this.getAllLocalStorageDiktas();
                return allDiktas.filter(dikte => dikte.category === category);
            }
        } catch (error) {
            console.error('Category query error:', error);
            const allDiktas = this.getAllLocalStorageDiktas();
            return allDiktas.filter(dikte => dikte.category === category);
        }
    }

    /**
     * Query diktas by difficulty
     */
    async getDiktasByDifficulty(difficulty) {
        try {
            if (this.isIndexedDBSupported && this.db) {
                return await this.queryIndexedDB('diktas', 'difficulty', difficulty);
            } else {
                const allDiktas = this.getAllLocalStorageDiktas();
                return allDiktas.filter(dikte => dikte.difficulty === difficulty);
            }
        } catch (error) {
            console.error('Difficulty query error:', error);
            const allDiktas = this.getAllLocalStorageDiktas();
            return allDiktas.filter(dikte => dikte.difficulty === difficulty);
        }
    }

    /**
     * Clear all data
     */
    async clear() {
        try {
            if (this.isIndexedDBSupported && this.db) {
                const stores = ['diktas', 'practiceHistory', 'settings', 'appState'];
                for (const storeName of stores) {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    await new Promise((resolve, reject) => {
                        const request = store.clear();
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            } else {
                localStorage.clear();
            }
        } catch (error) {
            console.error('Clear storage error:', error);
            localStorage.clear();
        }
    }

    /**
     * Get storage usage statistics
     */
    async getStorageStats() {
        try {
            if (this.isIndexedDBSupported && this.db) {
                const diktas = await this.getAllIndexedDB('diktas');
                const history = await this.getAllIndexedDB('practiceHistory');
                const settings = await this.getAllIndexedDB('settings');
                
                return {
                    diktas: diktas.length,
                    history: history.length,
                    settings: settings.length,
                    totalItems: diktas.length + history.length + settings.length
                };
            } else {
                const diktas = this.getAllLocalStorageDiktas();
                const history = this.getLocalStorage('practiceHistory') || [];
                const settings = this.getLocalStorage('settings');
                
                return {
                    diktas: diktas.length,
                    history: history.length,
                    settings: settings ? 1 : 0,
                    totalItems: diktas.length + history.length + (settings ? 1 : 0)
                };
            }
        } catch (error) {
            console.error('Storage stats error:', error);
            return { diktas: 0, history: 0, settings: 0, totalItems: 0 };
        }
    }

    // LocalStorage fallback methods
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('LocalStorage set error:', error);
            return false;
        }
    }

    getLocalStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('LocalStorage get error:', error);
            return null;
        }
    }

    deleteLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('LocalStorage delete error:', error);
            return false;
        }
    }

    getAllLocalStorageDiktas() {
        const diktas = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('dikte_')) {
                const dikte = this.getLocalStorage(key);
                if (dikte) {
                    diktas.push(dikte);
                }
            }
        }
        return diktas;
    }

    // Synchronous methods for immediate access
    setSync(key, value) {
        return this.setLocalStorage(key, value);
    }

    getSync(key) {
        return this.getLocalStorage(key);
    }

    deleteSync(key) {
        return this.deleteLocalStorage(key);
    }

    /**
     * Export data for backup
     */
    async exportData() {
        try {
            const data = {
                diktas: await this.getAllDiktas(),
                practiceHistory: await this.getPracticeHistory(),
                settings: await this.getSettings(),
                appState: await this.get('appState'),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `dikte-app-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Export error:', error);
            return false;
        }
    }

    /**
     * Import data from backup
     */
    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (data.version && data.diktas) {
                // Clear existing data
                await this.clear();

                // Import diktas
                for (const dikte of data.diktas) {
                    await this.setDikte(dikte);
                }

                // Import practice history
                if (data.practiceHistory) {
                    for (const history of data.practiceHistory) {
                        await this.setPracticeHistory(history);
                    }
                }

                // Import settings
                if (data.settings) {
                    await this.setSettings(data.settings);
                }

                // Import app state
                if (data.appState) {
                    await this.set('appState', data.appState);
                }

                return true;
            } else {
                throw new Error('Invalid backup file format');
            }
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
