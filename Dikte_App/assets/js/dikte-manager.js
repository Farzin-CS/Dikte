/**
 * Dikte Manager
 * Handles all dikte-related operations including creation, retrieval, and management
 */

class DikteManager {
    constructor() {
        this.storage = null;
        this.defaultDiktas = [
            {
                id: 1,
                title: 'سلام و احوالپرسی',
                text: 'سلام دوستان عزیز، امیدوارم که حالتان خوب باشد. امروز روز زیبایی است و من خوشحالم که با شما هستم.',
                difficulty: 'easy',
                category: 'general',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'فصل بهار',
                text: 'بهار فصل زیبایی است. درختان سبز می‌شوند و گل‌ها شکوفا می‌شوند. هوا معتدل و دلپذیر است.',
                difficulty: 'easy',
                category: 'literature',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'علم و دانش',
                text: 'علم و دانش کلید پیشرفت است. با مطالعه و یادگیری می‌توانیم به موفقیت برسیم و آینده بهتری بسازیم.',
                difficulty: 'medium',
                category: 'science',
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                title: 'تاریخ ایران',
                text: 'ایران کشوری با تاریخ کهن و فرهنگ غنی است. تمدن ایرانی از قدیمی‌ترین تمدن‌های جهان محسوب می‌شود.',
                difficulty: 'medium',
                category: 'history',
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                title: 'شعر و ادبیات',
                text: 'شعر فارسی یکی از غنی‌ترین ادبیات جهان است. شاعران بزرگی چون حافظ، سعدی و مولوی آثار جاودانی خلق کرده‌اند.',
                difficulty: 'hard',
                category: 'literature',
                createdAt: new Date().toISOString()
            }
        ];
    }

    /**
     * Initialize dikte manager
     */
    async init(storageManager) {
        this.storage = storageManager;
        await this.ensureDefaultDiktas();
    }

    /**
     * Ensure default diktas exist
     */
    async ensureDefaultDiktas() {
        try {
            const existingDiktas = await this.getAllDiktas();
            
            if (existingDiktas.length === 0) {
                // Add default diktas
                for (const dikte of this.defaultDiktas) {
                    await this.createDikte(dikte);
                }
                console.log('Default diktas created');
            }
        } catch (error) {
            console.error('Error ensuring default diktas:', error);
        }
    }

    /**
     * Create a new dikte
     */
    async createDikte(dikteData) {
        try {
            const dikte = {
                id: Date.now(),
                title: dikteData.title,
                text: dikteData.text,
                difficulty: dikteData.difficulty || 'medium',
                category: dikteData.category || 'general',
                createdAt: dikteData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                wordCount: this.countWords(dikteData.text),
                characterCount: dikteData.text.length
            };

            await this.storage.setDikte(dikte);
            return dikte;
        } catch (error) {
            console.error('Error creating dikte:', error);
            throw error;
        }
    }

    /**
     * Get dikte by ID
     */
    async getDikte(id) {
        try {
            return await this.storage.getDikte(id);
        } catch (error) {
            console.error('Error getting dikte:', error);
            throw error;
        }
    }

    /**
     * Get all diktas
     */
    async getAllDiktas() {
        try {
            return await this.storage.getAllDiktas();
        } catch (error) {
            console.error('Error getting all diktas:', error);
            return [];
        }
    }

    /**
     * Update dikte
     */
    async updateDikte(id, updates) {
        try {
            const dikte = await this.getDikte(id);
            if (!dikte) {
                throw new Error('Dikte not found');
            }

            const updatedDikte = {
                ...dikte,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            if (updates.text) {
                updatedDikte.wordCount = this.countWords(updates.text);
                updatedDikte.characterCount = updates.text.length;
            }

            await this.storage.setDikte(updatedDikte);
            return updatedDikte;
        } catch (error) {
            console.error('Error updating dikte:', error);
            throw error;
        }
    }

    /**
     * Delete dikte
     */
    async deleteDikte(id) {
        try {
            const dikte = await this.getDikte(id);
            if (!dikte) {
                throw new Error('Dikte not found');
            }

            await this.storage.deleteDikte(id);
            return true;
        } catch (error) {
            console.error('Error deleting dikte:', error);
            throw error;
        }
    }

    /**
     * Get diktas by category
     */
    async getDiktasByCategory(category) {
        try {
            return await this.storage.getDiktasByCategory(category);
        } catch (error) {
            console.error('Error getting diktas by category:', error);
            return [];
        }
    }

    /**
     * Get diktas by difficulty
     */
    async getDiktasByDifficulty(difficulty) {
        try {
            return await this.storage.getDiktasByDifficulty(difficulty);
        } catch (error) {
            console.error('Error getting diktas by difficulty:', error);
            return [];
        }
    }

    /**
     * Search diktas
     */
    async searchDiktas(query) {
        try {
            const allDiktas = await this.getAllDiktas();
            const searchTerm = query.toLowerCase().trim();

            if (!searchTerm) {
                return allDiktas;
            }

            return allDiktas.filter(dikte => 
                dikte.title.toLowerCase().includes(searchTerm) ||
                dikte.text.toLowerCase().includes(searchTerm) ||
                dikte.category.toLowerCase().includes(searchTerm)
            );
        } catch (error) {
            console.error('Error searching diktas:', error);
            return [];
        }
    }

    /**
     * Get dikte statistics
     */
    async getDikteStats() {
        try {
            const allDiktas = await this.getAllDiktas();
            
            const stats = {
                total: allDiktas.length,
                byDifficulty: {
                    easy: allDiktas.filter(d => d.difficulty === 'easy').length,
                    medium: allDiktas.filter(d => d.difficulty === 'medium').length,
                    hard: allDiktas.filter(d => d.difficulty === 'hard').length
                },
                byCategory: {
                    general: allDiktas.filter(d => d.category === 'general').length,
                    literature: allDiktas.filter(d => d.category === 'literature').length,
                    science: allDiktas.filter(d => d.category === 'science').length,
                    history: allDiktas.filter(d => d.category === 'history').length
                },
                totalWords: allDiktas.reduce((sum, d) => sum + (d.wordCount || 0), 0),
                totalCharacters: allDiktas.reduce((sum, d) => sum + (d.characterCount || 0), 0),
                averageWords: allDiktas.length > 0 ? Math.round(allDiktas.reduce((sum, d) => sum + (d.wordCount || 0), 0) / allDiktas.length) : 0
            };

            return stats;
        } catch (error) {
            console.error('Error getting dikte stats:', error);
            return {
                total: 0,
                byDifficulty: { easy: 0, medium: 0, hard: 0 },
                byCategory: { general: 0, literature: 0, science: 0, history: 0 },
                totalWords: 0,
                totalCharacters: 0,
                averageWords: 0
            };
        }
    }

    /**
     * Get random dikte
     */
    async getRandomDikte(difficulty = null, category = null) {
        try {
            let diktas = await this.getAllDiktas();
            
            if (difficulty) {
                diktas = diktas.filter(d => d.difficulty === difficulty);
            }
            
            if (category) {
                diktas = diktas.filter(d => d.category === category);
            }

            if (diktas.length === 0) {
                return null;
            }

            const randomIndex = Math.floor(Math.random() * diktas.length);
            return diktas[randomIndex];
        } catch (error) {
            console.error('Error getting random dikte:', error);
            return null;
        }
    }

    /**
     * Get recent diktas
     */
    async getRecentDiktas(limit = 5) {
        try {
            const allDiktas = await this.getAllDiktas();
            return allDiktas
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting recent diktas:', error);
            return [];
        }
    }

    /**
     * Validate dikte data
     */
    validateDikteData(dikteData) {
        const errors = [];

        if (!dikteData.title || dikteData.title.trim().length === 0) {
            errors.push('عنوان دیکته الزامی است');
        }

        if (!dikteData.text || dikteData.text.trim().length === 0) {
            errors.push('متن دیکته الزامی است');
        }

        if (dikteData.text && dikteData.text.trim().length < 10) {
            errors.push('متن دیکته باید حداقل ۱۰ کاراکتر باشد');
        }

        if (dikteData.title && dikteData.title.trim().length > 100) {
            errors.push('عنوان دیکته نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد');
        }

        if (dikteData.text && dikteData.text.trim().length > 2000) {
            errors.push('متن دیکته نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد');
        }

        const validDifficulties = ['easy', 'medium', 'hard'];
        if (dikteData.difficulty && !validDifficulties.includes(dikteData.difficulty)) {
            errors.push('سطح دشواری نامعتبر است');
        }

        const validCategories = ['general', 'literature', 'science', 'history'];
        if (dikteData.category && !validCategories.includes(dikteData.category)) {
            errors.push('دسته‌بندی نامعتبر است');
        }

        return errors;
    }

    /**
     * Count words in text
     */
    countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).length;
    }

    /**
     * Get difficulty label
     */
    getDifficultyLabel(difficulty) {
        const labels = {
            easy: 'آسان',
            medium: 'متوسط',
            hard: 'دشوار'
        };
        return labels[difficulty] || difficulty;
    }

    /**
     * Get category label
     */
    getCategoryLabel(category) {
        const labels = {
            general: 'عمومی',
            literature: 'ادبیات',
            science: 'علوم',
            history: 'تاریخ'
        };
        return labels[category] || category;
    }

    /**
     * Get difficulty color
     */
    getDifficultyColor(difficulty) {
        const colors = {
            easy: 'green',
            medium: 'yellow',
            hard: 'red'
        };
        return colors[difficulty] || 'gray';
    }

    /**
     * Get category color
     */
    getCategoryColor(category) {
        const colors = {
            general: 'blue',
            literature: 'purple',
            science: 'green',
            history: 'orange'
        };
        return colors[category] || 'gray';
    }

    /**
     * Export diktas to JSON
     */
    async exportDiktas() {
        try {
            const diktas = await this.getAllDiktas();
            const exportData = {
                diktas,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `diktas-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting diktas:', error);
            return false;
        }
    }

    /**
     * Import diktas from JSON
     */
    async importDiktas(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.diktas || !Array.isArray(data.diktas)) {
                throw new Error('Invalid file format');
            }

            let importedCount = 0;
            for (const dikte of data.diktas) {
                const errors = this.validateDikteData(dikte);
                if (errors.length === 0) {
                    await this.createDikte(dikte);
                    importedCount++;
                }
            }

            return { success: true, importedCount, totalCount: data.diktas.length };
        } catch (error) {
            console.error('Error importing diktas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Duplicate dikte
     */
    async duplicateDikte(id) {
        try {
            const originalDikte = await this.getDikte(id);
            if (!originalDikte) {
                throw new Error('Dikte not found');
            }

            const duplicatedDikte = {
                ...originalDikte,
                id: Date.now(),
                title: `${originalDikte.title} (کپی)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            delete duplicatedDikte.id; // Let storage assign new ID
            return await this.createDikte(duplicatedDikte);
        } catch (error) {
            console.error('Error duplicating dikte:', error);
            throw error;
        }
    }

    /**
     * Get dikte suggestions based on user history
     */
    async getDikteSuggestions(userHistory = []) {
        try {
            const allDiktas = await this.getAllDiktas();
            
            if (userHistory.length === 0) {
                // Return random diktas for new users
                return this.shuffleArray(allDiktas).slice(0, 3);
            }

            // Analyze user preferences
            const difficultyCounts = {};
            const categoryCounts = {};

            userHistory.forEach(history => {
                if (history.dikteId) {
                    const dikte = allDiktas.find(d => d.id === history.dikteId);
                    if (dikte) {
                        difficultyCounts[dikte.difficulty] = (difficultyCounts[dikte.difficulty] || 0) + 1;
                        categoryCounts[dikte.category] = (categoryCounts[dikte.category] || 0) + 1;
                    }
                }
            });

            // Find preferred difficulty and category
            const preferredDifficulty = Object.keys(difficultyCounts).reduce((a, b) => 
                difficultyCounts[a] > difficultyCounts[b] ? a : b
            );
            const preferredCategory = Object.keys(categoryCounts).reduce((a, b) => 
                categoryCounts[a] > categoryCounts[b] ? a : b
            );

            // Get suggestions based on preferences
            const suggestions = allDiktas.filter(dikte => 
                (dikte.difficulty === preferredDifficulty || dikte.category === preferredCategory) &&
                !userHistory.some(history => history.dikteId === dikte.id)
            );

            return this.shuffleArray(suggestions).slice(0, 3);
        } catch (error) {
            console.error('Error getting dikte suggestions:', error);
            return [];
        }
    }

    /**
     * Shuffle array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DikteManager;
}
