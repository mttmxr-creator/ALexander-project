// DeepSeek AI Assistant Frontend
class DeepSeekChat {
    constructor() {
        this.apiUrl = this.detectApiUrl();
        this.chatHistory = [];
        this.currentStreamingMessage = null;
        this.isStreaming = true;
        
        this.initializeElements();
        this.loadSettings();
        this.loadChatHistory();
        this.setupEventListeners();
        this.setWelcomeTime();
        this.addTestButton();
    }

    // Initialize DOM elements
    initializeElements() {
        this.elements = {
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            chatMessages: document.getElementById('chatMessages'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            themeToggle: document.getElementById('themeToggle'),
            clearChat: document.getElementById('clearChat'),
            charCount: document.getElementById('charCount'),
            errorToast: document.getElementById('errorToast'),
            toastMessage: document.getElementById('toastMessage'),
            closeToast: document.getElementById('closeToast'),
            settingsModal: document.getElementById('settingsModal'),
            apiUrlInput: document.getElementById('apiUrl'),
            streamingInput: document.getElementById('streaming'),
            saveSettings: document.getElementById('saveSettings'),
            resetSettings: document.getElementById('resetSettings'),
            closeSettings: document.getElementById('closeSettings')
        };
    }

    // Add test button to header
    addTestButton() {
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            const testButton = document.createElement('button');
            testButton.className = 'theme-toggle';
            testButton.innerHTML = '🧪';
            testButton.setAttribute('aria-label', 'Test API Connection');
            testButton.title = 'Test API Connection';
            testButton.addEventListener('click', () => this.testApiConnection());
            
            headerControls.insertBefore(testButton, headerControls.firstChild);
        }
    }

    // Detect API URL automatically
    detectApiUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
        // For production, use the deployed API URL
        return 'https://alexander-ai.onrender.com';
    }

    // Load settings from localStorage
    loadSettings() {
        const savedApiUrl = localStorage.getItem('deepseek_api_url');
        const savedStreaming = localStorage.getItem('deepseek_streaming');
        
        if (savedApiUrl) {
            this.apiUrl = savedApiUrl;
            this.elements.apiUrlInput.value = savedApiUrl;
        }
        
        if (savedStreaming !== null) {
            this.isStreaming = savedStreaming === 'true';
            this.elements.streamingInput.checked = this.isStreaming;
        }
    }

    // Save settings to localStorage
    saveSettings() {
        const apiUrl = this.elements.apiUrlInput.value.trim();
        const streaming = this.elements.streamingInput.checked;
        
        if (apiUrl) {
            this.apiUrl = apiUrl;
            localStorage.setItem('deepseek_api_url', apiUrl);
        }
        
        this.isStreaming = streaming;
        localStorage.setItem('deepseek_streaming', streaming);
        
        this.showToast('Настройки сохранены!', 'success');
        this.closeModal();
    }

    // Reset settings to defaults
    resetSettings() {
        this.elements.apiUrlInput.value = '';
        this.elements.streamingInput.checked = true;
        this.apiUrl = this.detectApiUrl();
        this.isStreaming = true;
        
        localStorage.removeItem('deepseek_api_url');
        localStorage.removeItem('deepseek_streaming');
        
        this.showToast('Настройки сброшены!', 'success');
    }

    // Load chat history from localStorage
    loadChatHistory() {
        const saved = localStorage.getItem('deepseek_chat_history');
        if (saved) {
            try {
                this.chatHistory = JSON.parse(saved);
                this.renderChatHistory();
            } catch (e) {
                console.error('Error loading chat history:', e);
                this.chatHistory = [];
            }
        }
    }

    // Save chat history to localStorage
    saveChatHistory() {
        localStorage.setItem('deepseek_chat_history', JSON.stringify(this.chatHistory));
    }

    // Setup event listeners
    setupEventListeners() {
        // Send message events
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input events
        this.elements.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.adjustTextareaHeight();
            this.updateSendButton();
        });

        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Clear chat
        this.elements.clearChat.addEventListener('click', () => this.clearChat());

        // Toast close
        this.elements.closeToast.addEventListener('click', () => this.hideToast());

        // Settings modal
        this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        this.elements.resetSettings.addEventListener('click', () => this.resetSettings());
        this.elements.closeSettings.addEventListener('click', () => this.closeModal());

        // Close modal on outside click
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.elements.messageInput.focus();
                        break;
                    case 'l':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.sendMessage();
                        break;
                }
            }
        });
    }

    // Test API connection
    async testApiConnection() {
        console.log('🧪 Testing API connection...');
        console.log('📍 API URL:', this.apiUrl);
        
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            console.log('📡 Health check response:', response);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API is healthy:', data);
                this.showToast('✅ API подключение успешно!', 'success');
                
                // Show detailed info
                alert(`API Status: ${data.status}\nBase loaded: ${data.b1c_base_loaded}\nPrompt manager: ${data.prompt_manager_ready}\nDeepSeek client: ${data.deepseek_client_ready}`);
            } else {
                console.error('❌ API health check failed:', response.status, response.statusText);
                this.showToast(`❌ API ошибка: ${response.status} ${response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('❌ API connection error:', error);
            this.showToast(`❌ Ошибка подключения: ${error.message}`, 'error');
            
            // Detailed error analysis
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                console.log('🔍 Это CORS или сеть ошибка');
                if (this.apiUrl.includes('localhost')) {
                    console.log('💡 Проверьте, что backend запущен на localhost:8000');
                } else {
                    console.log('💡 Проверьте, что backend развернут и доступен');
                }
            }
        }
    }

    // Send message to API
    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage('user', message);
        this.elements.messageInput.value = '';
        this.updateCharCount();
        this.adjustTextareaHeight();
        this.updateSendButton();

        // Show loading indicator
        this.showLoading();

        try {
            console.log('📤 Sending message to API:', this.apiUrl);
            
            if (this.isStreaming) {
                await this.streamResponse(message);
            } else {
                await this.getResponse(message);
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
            
            // Detailed error analysis
            let errorMessage = 'Неизвестная ошибка';
            let errorType = 'error';
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                if (this.apiUrl.includes('localhost')) {
                    errorMessage = 'Backend не запущен. Запустите python main.py на localhost:8000';
                } else {
                    errorMessage = 'Backend недоступен. Проверьте https://alexander-ai.onrender.com/health';
                }
                errorType = 'warning';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'CORS ошибка. Backend не разрешает запросы с этого домена';
                errorType = 'error';
            } else if (error.message.includes('401')) {
                errorMessage = 'API ключ не настроен. Проверьте DEEPSEEK_API_KEY на Render';
                errorType = 'error';
            } else if (error.message.includes('500')) {
                errorMessage = 'Ошибка сервера. Проверьте логи backend';
                errorType = 'error';
            } else {
                errorMessage = `Ошибка: ${error.message}`;
            }
            
            this.showToast(errorMessage, errorType);
            this.addMessage('assistant', `Извините, произошла ошибка при обработке вашего запроса: ${errorMessage}`);
        } finally {
            this.hideLoading();
        }
    }

    // Get streaming response
    async streamResponse(message) {
        console.log('📡 Starting streaming request...');
        
        const response = await fetch(`${this.apiUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                stream: true
            })
        });

        console.log('📡 Streaming response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Streaming response error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        // Create assistant message container
        this.currentStreamingMessage = this.createMessageElement('assistant', '');
        this.elements.chatMessages.appendChild(this.currentStreamingMessage);

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                fullResponse += chunk;

                // Update the streaming message
                this.updateStreamingMessage(fullResponse);
            }
        } finally {
            reader.releaseLock();
        }

        // Add to chat history
        this.chatHistory.push({
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString()
        });
        this.saveChatHistory();

        this.currentStreamingMessage = null;
        console.log('✅ Streaming completed, total response length:', fullResponse.length);
    }

    // Get regular response
    async getResponse(message) {
        console.log('📡 Starting regular request...');
        
        const response = await fetch(`${this.apiUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                stream: false
            })
        });

        console.log('📡 Regular response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Regular response error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📡 Response data:', data);
        
        if (data.success) {
            this.addMessage('assistant', data.response);
        } else {
            throw new Error('API returned error');
        }
    }

    // Create message element
    createMessageElement(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? '👤' : '🤖';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.formatTime(new Date());
        
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        return messageDiv;
    }

    // Add message to chat
    addMessage(role, content) {
        const messageElement = this.createMessageElement(role, content);
        const messageText = messageElement.querySelector('.message-text');
        
        // Render markdown if it's an assistant message
        if (role === 'assistant') {
            messageText.innerHTML = marked.parse(content);
        } else {
            messageText.textContent = content;
        }
        
        this.elements.chatMessages.appendChild(messageElement);
        
        // Add to chat history
        this.chatHistory.push({
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        });
        this.saveChatHistory();
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    // Update streaming message
    updateStreamingMessage(content) {
        if (this.currentStreamingMessage) {
            const messageText = this.currentStreamingMessage.querySelector('.message-text');
            messageText.innerHTML = marked.parse(content);
            this.scrollToBottom();
        }
    }

    // Render chat history
    renderChatHistory() {
        this.elements.chatMessages.innerHTML = '';
        
        // Add welcome message
        const welcomeMessage = this.createMessageElement('assistant', 
            'Привет! Я ваш AI ассистент с экспертизой в области психологии поведения и влияния на людей. Как я могу вам помочь сегодня?'
        );
        this.elements.chatMessages.appendChild(welcomeMessage);
        
        // Add saved messages
        this.chatHistory.forEach(msg => {
            if (msg.role !== 'system') { // Skip system messages
                this.addMessage(msg.role, msg.content);
            }
        });
    }

    // Clear chat
    clearChat() {
        if (confirm('Вы уверены, что хотите очистить весь чат?')) {
            this.chatHistory = [];
            this.saveChatHistory();
            this.renderChatHistory();
            this.showToast('Чат очищен!', 'success');
        }
    }

    // Toggle theme
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            this.elements.themeToggle.querySelector('.theme-icon').textContent = '🌙';
            localStorage.setItem('deepseek_theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            this.elements.themeToggle.querySelector('.theme-icon').textContent = '☀️';
            localStorage.setItem('deepseek_theme', 'dark');
        }
    }

    // Load theme from localStorage
    loadTheme() {
        const savedTheme = localStorage.getItem('deepseek_theme') || 'light';
        const body = document.body;
        
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(`${savedTheme}-theme`);
        
        if (savedTheme === 'dark') {
            this.elements.themeToggle.querySelector('.theme-icon').textContent = '☀️';
        }
    }

    // Show loading indicator
    showLoading() {
        this.elements.loadingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    // Hide loading indicator
    hideLoading() {
        this.elements.loadingIndicator.style.display = 'none';
    }

    // Show toast message
    showToast(message, type = 'error') {
        this.elements.toastMessage.textContent = message;
        this.elements.errorToast.className = `toast show toast-${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => this.hideToast(), 5000);
    }

    // Hide toast
    hideToast() {
        this.elements.errorToast.classList.remove('show');
    }

    // Show modal
    showModal() {
        this.elements.settingsModal.classList.add('show');
    }

    // Close modal
    closeModal() {
        this.elements.settingsModal.classList.remove('show');
    }

    // Update character count
    updateCharCount() {
        const count = this.elements.messageInput.value.length;
        this.elements.charCount.textContent = `${count}/4000`;
        
        // Change color based on count
        if (count > 3500) {
            this.elements.charCount.style.color = 'var(--warning-color)';
        } else if (count > 3000) {
            this.elements.charCount.style.color = 'var(--text-secondary)';
        } else {
            this.elements.charCount.style.color = 'var(--text-muted)';
        }
    }

    // Adjust textarea height
    adjustTextareaHeight() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 8 * 24) + 'px'; // 8 lines max
    }

    // Update send button state
    updateSendButton() {
        const hasText = this.elements.messageInput.value.trim().length > 0;
        this.elements.sendButton.disabled = !hasText;
    }

    // Scroll to bottom of chat
    scrollToBottom() {
        setTimeout(() => {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }, 100);
    }

    // Format timestamp
    formatTime(date) {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Set welcome message time
    setWelcomeTime() {
        const welcomeTime = document.getElementById('welcomeTime');
        if (welcomeTime) {
            welcomeTime.textContent = this.formatTime(new Date());
        }
    }

    // Initialize the app
    init() {
        this.loadTheme();
        this.updateCharCount();
        this.updateSendButton();
        this.scrollToBottom();
        
        // Test API connection on startup
        this.testApiConnection();
    }

    // Test API connection
    async testApiConnection() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            if (response.ok) {
                console.log('✅ API connection successful');
            } else {
                console.warn('⚠️ API connection failed');
            }
        } catch (error) {
            console.warn('⚠️ API connection failed:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chat = new DeepSeekChat();
    chat.init();
    
    // Make chat instance globally available for debugging
    window.deepseekChat = chat;
});

// Add settings button to header (optional)
document.addEventListener('DOMContentLoaded', () => {
    const headerControls = document.querySelector('.header-controls');
    if (headerControls) {
        const settingsButton = document.createElement('button');
        settingsButton.className = 'theme-toggle';
        settingsButton.innerHTML = '⚙️';
        settingsButton.setAttribute('aria-label', 'Настройки');
        settingsButton.addEventListener('click', () => {
            window.deepseekChat.showModal();
        });
        
        headerControls.insertBefore(settingsButton, headerControls.firstChild);
    }
});
