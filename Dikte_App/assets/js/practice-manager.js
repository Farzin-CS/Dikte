/**
 * Practice Manager
 * Handles all practice-related functionality including session management, answer checking, and progress tracking
 */

class PracticeManager {
    constructor() {
        this.currentSession = null;
        this.storage = null;
        this.audio = null;
        this.ui = null;
        this.currentDikte = null;
        this.currentWordIndex = 0;
        this.sessionStartTime = null;
        this.isSessionActive = false;
    }

    /**
     * Initialize practice manager
     */
    async init(storageManager, audioManager, uiManager) {
        this.storage = storageManager;
        this.audio = audioManager;
        this.ui = uiManager;
        this.bindEvents();
    }

    /**
     * Bind practice-related event listeners
     */
    bindEvents() {
        console.log('Binding practice events...');
        // We'll bind events when the practice tab is loaded
        this.bindPracticeSetupEvents();
    }

    /**
     * Bind practice setup events (called when practice tab is loaded)
     */
    bindPracticeSetupEvents() {
        // Practice setup events
        const startPracticeBtn = document.getElementById('start-practice');
        if (startPracticeBtn) {
            // Remove existing listeners to prevent duplicates
            startPracticeBtn.replaceWith(startPracticeBtn.cloneNode(true));
            const newStartPracticeBtn = document.getElementById('start-practice');
            newStartPracticeBtn.addEventListener('click', () => {
                console.log('Start practice clicked');
                this.startPractice();
            });
        }

        // Practice session events
        const checkAnswerBtn = document.getElementById('check-answer');
        const nextWordBtn = document.getElementById('next-word');
        const playAudioBtn = document.getElementById('play-audio');

        if (checkAnswerBtn) {
            checkAnswerBtn.replaceWith(checkAnswerBtn.cloneNode(true));
            const newCheckAnswerBtn = document.getElementById('check-answer');
            newCheckAnswerBtn.addEventListener('click', () => {
                console.log('Check answer clicked');
                this.checkAnswer();
            });
        }

        if (nextWordBtn) {
            nextWordBtn.replaceWith(nextWordBtn.cloneNode(true));
            const newNextWordBtn = document.getElementById('next-word');
            newNextWordBtn.addEventListener('click', () => {
                console.log('Next word clicked');
                this.nextWord();
            });
        }

        if (playAudioBtn) {
            playAudioBtn.replaceWith(playAudioBtn.cloneNode(true));
            const newPlayAudioBtn = document.getElementById('play-audio');
            newPlayAudioBtn.addEventListener('click', () => {
                console.log('Play audio clicked');
                this.playCurrentWord();
            });
        }

        // Practice answer input
        const practiceAnswer = document.getElementById('practice-answer');
        if (practiceAnswer) {
            practiceAnswer.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.checkAnswer();
                }
            });
        }
    }

    /**
     * Load practice diktas for selection
     */
    async loadPracticeDiktas() {
        try {
            const diktas = await this.storage.getAllDiktas();
            const container = document.getElementById('practice-diktas');
            
            if (!container) return;

            if (diktas.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                        <svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p class="font-vazir">هیچ دیکته‌ای موجود نیست</p>
                        <p class="text-sm mt-2">ابتدا یک دیکته جدید ایجاد کنید</p>
                    </div>
                `;
                return;
            }

            const dikteCards = diktas.map(dikte => `
                <div class="dikte-card bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700" data-dikte-id="${dikte.id}">
                    <div class="flex items-start justify-between mb-3">
                        <h4 class="font-semibold text-gray-900 dark:text-white font-vazir">${dikte.title}</h4>
                        <div class="flex space-x-2 space-x-reverse">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${this.getDifficultyColor(dikte.difficulty)}-100 text-${this.getDifficultyColor(dikte.difficulty)}-800 dark:bg-${this.getDifficultyColor(dikte.difficulty)}-900 dark:text-${this.getDifficultyColor(dikte.difficulty)}-200">
                                ${this.getDifficultyLabel(dikte.difficulty)}
                            </span>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                ${this.getCategoryLabel(dikte.category)}
                            </span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-vazir line-clamp-2">${dikte.text.substring(0, 100)}${dikte.text.length > 100 ? '...' : ''}</p>
                    <div class="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>${dikte.wordCount || 0} کلمه</span>
                        <span>${this.formatDate(dikte.createdAt)}</span>
                    </div>
                </div>
            `).join('');

            container.innerHTML = dikteCards;

            // Add click events to dikte cards
            container.querySelectorAll('.dikte-card').forEach(card => {
                card.addEventListener('click', () => {
                    this.selectDikteForPractice(parseInt(card.dataset.dikteId));
                });
            });

        } catch (error) {
            console.error('Error loading practice diktas:', error);
        }
    }

    /**
     * Select dikte for practice
     */
    async selectDikteForPractice(dikteId) {
        try {
            // Remove previous selection
            document.querySelectorAll('.dikte-card').forEach(card => {
                card.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
            });

            // Add selection to clicked card
            const selectedCard = document.querySelector(`[data-dikte-id="${dikteId}"]`);
            if (selectedCard) {
                selectedCard.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
            }

            // Enable start practice button
            const startBtn = document.getElementById('start-practice');
            if (startBtn) {
                startBtn.disabled = false;
            }

            // Store selected dikte
            this.currentDikte = await this.storage.getDikte(dikteId);

        } catch (error) {
            console.error('Error selecting dikte for practice:', error);
            this.ui.showToast('خطا در انتخاب دیکته', 'error');
        }
    }

    /**
     * Start practice session
     */
    async startPractice() {
        if (!this.currentDikte) {
            this.ui.showToast('لطفاً یک دیکته انتخاب کنید', 'warning');
            return;
        }

        try {
            // Initialize session
            this.currentSession = {
                id: Date.now(),
                dikteId: this.currentDikte.id,
                dikteTitle: this.currentDikte.title,
                startTime: new Date().toISOString(),
                words: this.splitTextIntoWords(this.currentDikte.text),
                currentWordIndex: 0,
                correctAnswers: 0,
                totalWords: 0,
                answers: []
            };

            this.currentWordIndex = 0;
            this.sessionStartTime = Date.now();
            this.isSessionActive = true;

            // Show practice session UI
            this.showPracticeSession();

            // Load first word
            this.loadCurrentWord();

        } catch (error) {
            console.error('Error starting practice:', error);
            this.ui.showToast('خطا در شروع تمرین', 'error');
        }
    }

    /**
     * Show practice session UI
     */
    showPracticeSession() {
        const setupArea = document.getElementById('practice-setup');
        const sessionArea = document.getElementById('practice-session');

        if (setupArea) setupArea.classList.add('hidden');
        if (sessionArea) sessionArea.classList.remove('hidden');

        // Update session info
        const titleElement = document.getElementById('practice-title');
        const progressElement = document.getElementById('practice-progress');

        if (titleElement) titleElement.textContent = this.currentDikte.title;
        if (progressElement) {
            progressElement.textContent = `${this.currentWordIndex + 1}/${this.currentSession.words.length}`;
        }
    }

    /**
     * Load current word for practice
     */
    loadCurrentWord() {
        if (!this.currentSession || this.currentWordIndex >= this.currentSession.words.length) {
            this.finishPractice();
            return;
        }

        const currentWord = this.currentSession.words[this.currentWordIndex];
        const textElement = document.getElementById('practice-text');
        const answerElement = document.getElementById('practice-answer');

        if (textElement) {
            textElement.textContent = currentWord;
        }

        if (answerElement) {
            answerElement.value = '';
            answerElement.focus();
        }

        // Update progress
        const progressElement = document.getElementById('practice-progress');
        if (progressElement) {
            progressElement.textContent = `${this.currentWordIndex + 1}/${this.currentSession.words.length}`;
        }

        // Hide result area
        const resultArea = document.getElementById('practice-result');
        if (resultArea) {
            resultArea.classList.add('hidden');
        }

        // Show check answer button, hide next button
        const checkBtn = document.getElementById('check-answer');
        const nextBtn = document.getElementById('next-word');
        
        if (checkBtn) checkBtn.classList.remove('hidden');
        if (nextBtn) nextBtn.classList.add('hidden');
    }

    /**
     * Check current answer
     */
    async checkAnswer() {
        if (!this.currentSession) return;

        const answerElement = document.getElementById('practice-answer');
        const userAnswer = answerElement?.value.trim() || '';
        const correctWord = this.currentSession.words[this.currentWordIndex];

        if (!userAnswer) {
            this.ui.showToast('لطفاً پاسخ خود را وارد کنید', 'warning');
            return;
        }

        const isCorrect = this.compareAnswers(userAnswer, correctWord);
        
        // Store answer
        this.currentSession.answers.push({
            word: correctWord,
            userAnswer: userAnswer,
            correct: isCorrect,
            timestamp: new Date().toISOString()
        });

        if (isCorrect) {
            this.currentSession.correctAnswers++;
        }

        this.currentSession.totalWords++;

        // Show result
        this.showAnswerResult(isCorrect, correctWord, userAnswer);

        // Update UI
        const checkBtn = document.getElementById('check-answer');
        const nextBtn = document.getElementById('next-word');
        
        if (checkBtn) checkBtn.classList.add('hidden');
        if (nextBtn) nextBtn.classList.remove('hidden');

        // Disable answer input
        if (answerElement) {
            answerElement.disabled = true;
        }
    }

    /**
     * Show answer result
     */
    showAnswerResult(isCorrect, correctWord, userAnswer) {
        const resultArea = document.getElementById('practice-result');
        if (!resultArea) return;

        const resultHTML = isCorrect ? `
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div class="flex">
                    <svg class="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <div class="mr-3">
                        <h3 class="text-sm font-medium text-green-800 dark:text-green-200">عالی!</h3>
                        <div class="mt-2 text-sm text-green-700 dark:text-green-300">
                            <p>پاسخ شما صحیح است: <strong>${correctWord}</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        ` : `
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div class="flex">
                    <svg class="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <div class="mr-3">
                        <h3 class="text-sm font-medium text-red-800 dark:text-red-200">پاسخ نادرست</h3>
                        <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                            <p>پاسخ شما: <strong>${userAnswer}</strong></p>
                            <p>پاسخ صحیح: <strong>${correctWord}</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        resultArea.innerHTML = resultHTML;
        resultArea.classList.remove('hidden');
    }

    /**
     * Move to next word
     */
    nextWord() {
        this.currentWordIndex++;

        if (this.currentWordIndex >= this.currentSession.words.length) {
            this.finishPractice();
        } else {
            this.loadCurrentWord();
        }
    }

    /**
     * Finish practice session
     */
    async finishPractice() {
        if (!this.currentSession) return;

        try {
            const sessionDuration = Date.now() - this.sessionStartTime;
            const successRate = Math.round((this.currentSession.correctAnswers / this.currentSession.totalWords) * 100);

            // Complete session data
            this.currentSession.endTime = new Date().toISOString();
            this.currentSession.duration = Math.round(sessionDuration / 1000);
            this.currentSession.successRate = successRate;

            // Save to history
            await this.savePracticeHistory(this.currentSession);

            // Show completion modal
            this.showCompletionModal(this.currentSession);

            // Reset session
            this.resetPractice();

        } catch (error) {
            console.error('Error finishing practice:', error);
            this.ui.showToast('خطا در پایان تمرین', 'error');
        }
    }

    /**
     * Show completion modal
     */
    showCompletionModal(session) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title font-vazir">تمرین تمام شد!</h3>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-vazir">${session.dikteTitle}</h4>
                            <div class="flex justify-center space-x-8 space-x-reverse">
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${session.successRate}%</div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400 font-vazir">درصد موفقیت</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">${session.correctAnswers}/${session.totalWords}</div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400 font-vazir">پاسخ صحیح</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${session.duration}</div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400 font-vazir">ثانیه</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <h5 class="font-semibold text-gray-900 dark:text-white mb-3 font-vazir">نتیجه:</h5>
                            <div class="text-sm text-gray-600 dark:text-gray-400 font-vazir">
                                ${this.getCompletionMessage(session.successRate)}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="close-completion">بستن</button>
                    <button class="btn-primary" id="practice-again">تمرین مجدد</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('#close-completion');
        const practiceAgainBtn = modal.querySelector('#practice-again');

        const cleanup = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener('click', cleanup);
        practiceAgainBtn.addEventListener('click', () => {
            cleanup();
            this.startPractice();
        });

        modal.querySelector('.modal-overlay').addEventListener('click', cleanup);
    }

    /**
     * Get completion message based on success rate
     */
    getCompletionMessage(successRate) {
        if (successRate >= 90) {
            return 'عالی! شما عملکرد فوق‌العاده‌ای داشتید.';
        } else if (successRate >= 70) {
            return 'خوب! شما عملکرد خوبی داشتید.';
        } else if (successRate >= 50) {
            return 'متوسط! کمی بیشتر تمرین کنید.';
        } else {
            return 'نیاز به تمرین بیشتر دارید.';
        }
    }

    /**
     * Save practice history
     */
    async savePracticeHistory(session) {
        try {
            const history = {
                id: session.id,
                dikteId: session.dikteId,
                dikteTitle: session.dikteTitle,
                date: session.endTime,
                duration: session.duration,
                correct: session.correctAnswers,
                total: session.totalWords,
                successRate: session.successRate,
                answers: session.answers
            };

            await this.storage.setPracticeHistory(history);
        } catch (error) {
            console.error('Error saving practice history:', error);
        }
    }

    /**
     * Reset practice session
     */
    resetPractice() {
        this.currentSession = null;
        this.currentDikte = null;
        this.currentWordIndex = 0;
        this.sessionStartTime = null;
        this.isSessionActive = false;

        // Show setup area
        const setupArea = document.getElementById('practice-setup');
        const sessionArea = document.getElementById('practice-session');

        if (setupArea) setupArea.classList.remove('hidden');
        if (sessionArea) sessionArea.classList.add('hidden');

        // Reset selection
        document.querySelectorAll('.dikte-card').forEach(card => {
            card.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
        });

        // Disable start button
        const startBtn = document.getElementById('start-practice');
        if (startBtn) {
            startBtn.disabled = true;
        }
    }

    /**
     * Play current word audio
     */
    async playCurrentWord() {
        if (!this.currentSession || !this.audio) return;

        const currentWord = this.currentSession.words[this.currentWordIndex];
        await this.audio.speak(currentWord);
    }

    /**
     * Split text into words for practice
     */
    splitTextIntoWords(text) {
        // Split by spaces and filter out empty strings
        return text.split(/\s+/).filter(word => word.trim().length > 0);
    }

    /**
     * Compare user answer with correct answer
     */
    compareAnswers(userAnswer, correctAnswer) {
        // Normalize both answers (remove extra spaces, convert to lowercase)
        const normalizedUser = userAnswer.trim().toLowerCase();
        const normalizedCorrect = correctAnswer.trim().toLowerCase();

        // Exact match
        if (normalizedUser === normalizedCorrect) {
            return true;
        }

        // Check for common Persian variations
        const variations = {
            'ی': ['ي', 'ی'],
            'ي': ['ی', 'ي'],
            'ک': ['ك', 'ک'],
            'ك': ['ک', 'ك'],
            'ه': ['ة', 'ه'],
            'ة': ['ه', 'ة']
        };

        // Try variations
        for (const [char, variants] of Object.entries(variations)) {
            for (const variant of variants) {
                const testAnswer = normalizedUser.replace(new RegExp(variant, 'g'), char);
                if (testAnswer === normalizedCorrect) {
                    return true;
                }
            }
        }

        return false;
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
     * Format date
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
     * Get practice statistics
     */
    async getPracticeStats() {
        try {
            const history = await this.storage.getPracticeHistory();
            
            const stats = {
                totalSessions: history.length,
                totalWords: history.reduce((sum, h) => sum + h.total, 0),
                correctWords: history.reduce((sum, h) => sum + h.correct, 0),
                totalTime: history.reduce((sum, h) => sum + h.duration, 0),
                averageSuccessRate: history.length > 0 
                    ? Math.round(history.reduce((sum, h) => sum + h.successRate, 0) / history.length)
                    : 0
            };

            return stats;
        } catch (error) {
            console.error('Error getting practice stats:', error);
            return {
                totalSessions: 0,
                totalWords: 0,
                correctWords: 0,
                totalTime: 0,
                averageSuccessRate: 0
            };
        }
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PracticeManager;
}
