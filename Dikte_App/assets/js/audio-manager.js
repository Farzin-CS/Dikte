/**
 * Audio Manager
 * Handles text-to-speech functionality, audio playback, and sound effects
 */

class AudioManager {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.speechUtterance = null;
        this.isSpeaking = false;
        this.settings = {
            enabled: true,
            speed: 1,
            repeatCount: 2,
            voice: null
        };
        
        this.init();
    }

    /**
     * Initialize audio manager
     */
    init() {
        this.loadSettings();
        this.setupSpeechSynthesis();
        this.bindEvents();
    }

    /**
     * Load audio settings from storage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('audioSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('Error loading audio settings:', error);
        }
    }

    /**
     * Save audio settings to storage
     */
    saveSettings() {
        try {
            localStorage.setItem('audioSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving audio settings:', error);
        }
    }

    /**
     * Setup speech synthesis
     */
    setupSpeechSynthesis() {
        if (!this.speechSynthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Wait for voices to load
        if (this.speechSynthesis.getVoices().length === 0) {
            this.speechSynthesis.addEventListener('voiceschanged', () => {
                this.setupVoices();
            });
        } else {
            this.setupVoices();
        }
    }

    /**
     * Setup available voices
     */
    setupVoices() {
        const voices = this.speechSynthesis.getVoices();
        
        // Find Persian/Farsi voice
        const persianVoice = voices.find(voice => 
            voice.lang.includes('fa') || 
            voice.lang.includes('per') || 
            voice.lang.includes('fas') ||
            voice.name.toLowerCase().includes('persian') ||
            voice.name.toLowerCase().includes('farsi')
        );

        if (persianVoice) {
            this.settings.voice = persianVoice;
        } else {
            // Fallback to first available voice
            this.settings.voice = voices[0] || null;
        }

        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        console.log('Selected voice:', this.settings.voice?.name);
    }

    /**
     * Bind audio-related events
     */
    bindEvents() {
        // Handle speech synthesis events
        if (this.speechSynthesis) {
            this.speechSynthesis.addEventListener('start', () => {
                this.isSpeaking = true;
                this.updateAudioButtonState();
            });

            this.speechSynthesis.addEventListener('end', () => {
                this.isSpeaking = false;
                this.updateAudioButtonState();
            });

            this.speechSynthesis.addEventListener('error', (event) => {
                console.error('Speech synthesis error:', event.error);
                this.isSpeaking = false;
                this.updateAudioButtonState();
            });
        }

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isSpeaking) {
                this.stopSpeaking();
            }
        });
    }

    /**
     * Speak text using text-to-speech
     */
    async speak(text, options = {}) {
        if (!this.settings.enabled || !this.speechSynthesis) {
            return false;
        }

        try {
            // Stop any current speech
            this.stopSpeaking();

            // Create utterance
            this.speechUtterance = new SpeechSynthesisUtterance(text);
            
            // Configure utterance
            this.configureUtterance(this.speechUtterance, options);

            // Speak
            this.speechSynthesis.speak(this.speechUtterance);

            return true;
        } catch (error) {
            console.error('Error speaking text:', error);
            return false;
        }
    }

    /**
     * Configure speech utterance
     */
    configureUtterance(utterance, options = {}) {
        // Set voice
        if (this.settings.voice) {
            utterance.voice = this.settings.voice;
        }

        // Set language
        utterance.lang = 'fa-IR';

        // Set rate (speed)
        utterance.rate = options.speed || this.settings.speed;

        // Set pitch
        utterance.pitch = options.pitch || 1;

        // Set volume
        utterance.volume = options.volume || 1;

        // Set event handlers
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateAudioButtonState();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateAudioButtonState();
        };

        utterance.onerror = (event) => {
            console.error('Utterance error:', event.error);
            this.isSpeaking = false;
            this.updateAudioButtonState();
        };
    }

    /**
     * Stop current speech
     */
    stopSpeaking() {
        if (this.speechSynthesis && this.isSpeaking) {
            this.speechSynthesis.cancel();
            this.isSpeaking = false;
            this.updateAudioButtonState();
        }
    }

    /**
     * Speak text with repeat
     */
    async speakWithRepeat(text, repeatCount = null) {
        const count = repeatCount || this.settings.repeatCount;
        
        for (let i = 0; i < count; i++) {
            await this.speak(text);
            
            // Wait between repetitions (except for the last one)
            if (i < count - 1) {
                await this.wait(1000); // 1 second delay
            }
        }
    }

    /**
     * Wait for specified milliseconds
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Update audio button state
     */
    updateAudioButtonState() {
        const audioButtons = document.querySelectorAll('[data-audio-button]');
        
        audioButtons.forEach(button => {
            const icon = button.querySelector('svg');
            const text = button.querySelector('span');
            
            if (this.isSpeaking) {
                button.disabled = true;
                button.classList.add('loading');
                if (icon) {
                    icon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    `;
                }
                if (text) {
                    text.textContent = 'در حال پخش...';
                }
            } else {
                button.disabled = false;
                button.classList.remove('loading');
                if (icon) {
                    icon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                    `;
                }
                if (text) {
                    text.textContent = 'پخش صدا';
                }
            }
        });
    }

    /**
     * Play sound effect
     */
    playSoundEffect(type) {
        if (!this.settings.enabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configure sound based on type
        switch (type) {
            case 'success':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
                
            case 'error':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
                
            case 'notification':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                break;
                
            default:
                oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        }

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    /**
     * Get available voices
     */
    getAvailableVoices() {
        if (!this.speechSynthesis) return [];
        
        return this.speechSynthesis.getVoices().map(voice => ({
            name: voice.name,
            lang: voice.lang,
            default: voice.default
        }));
    }

    /**
     * Set voice by name
     */
    setVoice(voiceName) {
        const voices = this.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === voiceName);
        
        if (voice) {
            this.settings.voice = voice;
            this.saveSettings();
            return true;
        }
        
        return false;
    }

    /**
     * Test audio functionality
     */
    async testAudio() {
        const testText = 'سلام، این یک تست صدا است.';
        return await this.speak(testText);
    }

    /**
     * Check if audio is supported
     */
    isSupported() {
        return !!this.speechSynthesis;
    }

    /**
     * Check if audio is enabled
     */
    isEnabled() {
        return this.settings.enabled && this.isSupported();
    }

    /**
     * Enable/disable audio
     */
    setEnabled(enabled) {
        this.settings.enabled = enabled;
        this.saveSettings();
        
        if (!enabled && this.isSpeaking) {
            this.stopSpeaking();
        }
    }

    /**
     * Set speech speed
     */
    setSpeed(speed) {
        this.settings.speed = Math.max(0.1, Math.min(10, speed));
        this.saveSettings();
    }

    /**
     * Set repeat count
     */
    setRepeatCount(count) {
        this.settings.repeatCount = Math.max(1, Math.min(10, count));
        this.saveSettings();
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Speak practice word with context
     */
    async speakPracticeWord(word, context = '') {
        if (!this.isEnabled()) return false;

        let textToSpeak = word;
        
        // Add context if provided
        if (context) {
            textToSpeak = `${context}: ${word}`;
        }

        return await this.speak(textToSpeak, {
            speed: this.settings.speed,
            pitch: 1.1 // Slightly higher pitch for clarity
        });
    }

    /**
     * Speak full dikte text
     */
    async speakDikteText(text) {
        if (!this.isEnabled()) return false;

        // Split text into sentences for better pronunciation
        const sentences = text.split(/[.!?؟]/).filter(s => s.trim().length > 0);
        
        for (const sentence of sentences) {
            await this.speak(sentence.trim(), {
                speed: this.settings.speed * 0.8, // Slightly slower for full text
                pitch: 1
            });
            
            // Pause between sentences
            await this.wait(500);
        }

        return true;
    }

    /**
     * Create audio button element
     */
    createAudioButton(text, onClick) {
        const button = document.createElement('button');
        button.className = 'btn-secondary flex items-center gap-2';
        button.setAttribute('data-audio-button', 'true');
        button.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
            </svg>
            <span>${text}</span>
        `;
        
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        
        return button;
    }

    /**
     * Initialize audio buttons on page
     */
    initAudioButtons() {
        const audioButtons = document.querySelectorAll('[data-audio-button]');
        
        audioButtons.forEach(button => {
            if (!button.hasAttribute('data-initialized')) {
                button.setAttribute('data-initialized', 'true');
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    if (this.isSpeaking) {
                        this.stopSpeaking();
                    } else {
                        const text = button.getAttribute('data-audio-text');
                        if (text) {
                            this.speak(text);
                        }
                    }
                });
            }
        });
    }

    /**
     * Cleanup audio resources
     */
    cleanup() {
        this.stopSpeaking();
        
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
