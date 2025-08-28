// 🚀 DeepSeek Chat - JavaScript Backend Version
class DeepSeekChat {
    constructor() {
        this.jsBackend = null;
        this.chatHistory = [];
        this.elements = {};
        this.isInitialized = false;
        
        this.init();
    }

    // Initialize the app
    init() {
        this.loadElements();
        this.loadSettings();
        this.loadChatHistory();
        this.addTestButton();
        this.updateSendButton();
        this.scrollToBottom();

        // Log current status
        console.log('🚀 DeepSeek Chat initialized');
        console.log('🌐 Current location:', window.location.href);
        
        // Initialize JavaScript backend
        this.initJavaScriptBackend();
        
        // Show current status in interface
        this.showStatusInfo();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    // Load DOM elements
    loadElements() {
        this.elements = {
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            chatMessages: document.getElementById('chatMessages'),
            themeToggle: document.getElementById('themeToggle'),
            settingsButton: document.getElementById('settingsButton'),
            settingsModal: document.getElementById('settingsModal'),
            closeModal: document.getElementById('closeModal'),
            charCount: document.getElementById('charCount'),
            streamingInput: document.getElementById('streamingInput')
        };
    }

    // Load settings from localStorage
    loadSettings() {
        const savedStreaming = localStorage.getItem('deepseek_streaming');
        
        if (savedStreaming !== null) {
            this.isStreaming = savedStreaming === 'true';
            if (this.elements.streamingInput) {
                this.elements.streamingInput.checked = this.isStreaming;
            }
        }
    }

    // Load chat history from localStorage
    loadChatHistory() {
        const savedHistory = localStorage.getItem('deepseek_chat_history');
        if (savedHistory) {
            this.chatHistory = JSON.parse(savedHistory);
            this.chatHistory.forEach(msg => {
                this.addMessage(msg.role, msg.content, false);
            });
        }
    }

    // Save chat history to localStorage
    saveChatHistory() {
        localStorage.setItem('deepseek_chat_history', JSON.stringify(this.chatHistory));
    }

    // Initialize JavaScript backend
    async initJavaScriptBackend() {
        try {
            // Check if JavaScript backend is available
            if (typeof window.JavaScriptBackend !== 'undefined') {
                this.jsBackend = new window.JavaScriptBackend();
                await this.jsBackend.init();
                this.isInitialized = true;
                console.log('✅ JavaScript Backend initialized');
                
                // Test backend health
                const health = await this.jsBackend.healthCheck();
                console.log('🏥 Backend health:', health);
                
            } else {
                console.log('⚠️ JavaScript Backend not available');
            }
        } catch (error) {
            console.error('❌ Failed to initialize JavaScript Backend:', error);
        }
    }

    // Show status info in interface
    showStatusInfo() {
        const statusDiv = document.createElement('div');
        statusDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: monospace;
            z-index: 1000;
            max-width: 300px;
            word-break: break-all;
        `;
        
        const backendStatus = this.jsBackend && this.jsBackend.isInitialized ? '✅ Ready' : '❌ Not Ready';
        
        statusDiv.innerHTML = `
            <strong>🚀 Status:</strong><br>
            ${backendStatus}<br>
            <strong>🌐 Location:</strong><br>
            ${window.location.hostname}
        `;
        document.body.appendChild(statusDiv);

        // Remove after 10 seconds
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 10000);
    }

    // Add test button to header
    addTestButton() {
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            // Test backend button
            const testButton = document.createElement('button');
            testButton.className = 'theme-toggle';
            testButton.innerHTML = '🧪';
            testButton.setAttribute('aria-label', 'Test Backend');
            testButton.title = 'Test Backend Connection';
            testButton.addEventListener('click', () => this.testBackend());
            
            headerControls.insertBefore(testButton, headerControls.firstChild);
        }
    }

    // Test backend connection
    async testBackend() {
        try {
            console.log('🧪 Testing backend connection...');
            
            if (this.jsBackend && this.jsBackend.isInitialized) {
                const health = await this.jsBackend.healthCheck();
                console.log('🏥 Backend health:', health);
                
                if (health.status === 'healthy') {
                    this.showToast('✅ Backend работает отлично!', 'success');
                } else {
                    this.showToast('⚠️ Backend имеет проблемы', 'warning');
                }
            } else {
                this.showToast('❌ Backend не инициализирован', 'error');
            }
            
        } catch (error) {
            console.error('❌ Backend test failed:', error);
            this.showToast('❌ Ошибка тестирования backend', 'error');
        }
    }

    // Send message using JavaScript backend
    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage('user', message);
        this.elements.messageInput.value = '';
        this.updateCharCount();
        this.updateSendButton();

        // Show assistant message placeholder
        const assistantMessageId = this.addMessage('assistant', '');
        this.elements.messageInput.disabled = true;
        this.elements.sendButton.disabled = true;

        try {
            let response;
            
            // Use JavaScript backend
            if (this.jsBackend && this.jsBackend.isInitialized) {
                console.log('🚀 Using JavaScript Backend');
                response = await this.jsBackend.processChat(message);
            } else {
                console.log('⚠️ JavaScript Backend not available');
                response = 'Извините, JavaScript Backend не инициализирован. Попробуйте обновить страницу.';
            }

            // Update assistant message
            this.updateMessage(assistantMessageId, response);
            
        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.updateMessage(assistantMessageId, `❌ Ошибка: ${error.message}`);
        } finally {
            this.elements.messageInput.disabled = false;
            this.elements.sendButton.disabled = false;
            this.elements.messageInput.focus();
            this.scrollToBottom();
        }
    }

    // Add message to chat
    addMessage(role, content, saveToHistory = true) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        messageElement.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        
        if (role === 'assistant') {
            messageText.innerHTML = marked.parse(content || '...');
        } else {
            messageText.textContent = content;
        }
        
        messageElement.appendChild(messageText);
        this.elements.chatMessages.appendChild(messageElement);
        
        // Save to history
        if (saveToHistory) {
            this.chatHistory.push({
                role: role,
                content: content,
                timestamp: new Date().toISOString()
            });
            this.saveChatHistory();
        }
        
        // Scroll to bottom
        this.scrollToBottom();
        return messageElement.id;
    }

    // Update message content
    updateMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            const messageText = messageElement.querySelector('.message-text');
            if (messageText) {
                if (content.startsWith('❌ Ошибка:')) {
                    messageText.innerHTML = `<span style="color: var(--error-color);">${content}</span>`;
                } else {
                    messageText.innerHTML = marked.parse(content);
                }
            }
        }
    }

    // Update character count
    updateCharCount() {
        if (this.elements.charCount) {
            const count = this.elements.messageInput.value.length;
            this.elements.charCount.textContent = `${count}/4000`;
            
            if (count > 3500) {
                this.elements.charCount.style.color = 'var(--error-color)';
            } else if (count > 2000) {
                this.elements.charCount.style.color = 'var(--warning-color)';
            } else {
                this.elements.charCount.style.color = 'var(--text-secondary)';
            }
        }
    }

    // Update send button state
    updateSendButton() {
        const message = this.elements.messageInput.value.trim();
        this.elements.sendButton.disabled = !message;
    }

    // Scroll to bottom of chat
    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Event listeners
    setupEventListeners() {
        // Send button click
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key press
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input change
        this.elements.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.updateSendButton();
        });
        
        // Theme toggle
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Settings
        if (this.elements.settingsButton) {
            this.elements.settingsButton.addEventListener('click', () => this.openSettings());
        }
        
        if (this.elements.closeModal) {
            this.elements.closeModal.addEventListener('click', () => this.closeSettings());
        }
    }

    // Toggle theme
    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('deepseek_theme', isLight ? 'light' : 'dark');
        
        if (this.elements.themeToggle) {
            this.elements.themeToggle.innerHTML = isLight ? '🌙' : '☀️';
        }
    }

    // Open settings
    openSettings() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.add('show');
        }
    }

    // Close settings
    closeSettings() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.remove('show');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DeepSeekChat();
});
