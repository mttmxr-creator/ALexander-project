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
            // Test API button
            const testButton = document.createElement('button');
            testButton.className = 'theme-toggle';
            testButton.innerHTML = '🧪';
            testButton.setAttribute('aria-label', 'Test API Connection');
            testButton.title = 'Test API Connection';
            testButton.addEventListener('click', () => this.testApiConnection());
            
            // API Mode toggle button
            const apiModeButton = document.createElement('button');
            apiModeButton.className = 'theme-toggle';
            apiModeButton.innerHTML = this.apiUrl.includes('localhost') ? '🏠' : '☁️';
            apiModeButton.setAttribute('aria-label', 'Toggle API Mode');
            apiModeButton.title = `Current: ${this.apiUrl.includes('localhost') ? 'Local' : 'Production'} API`;
            apiModeButton.addEventListener('click', () => this.toggleApiMode());
            
            headerControls.insertBefore(apiModeButton, headerControls.firstChild);
            headerControls.insertBefore(testButton, headerControls.firstChild);
        }
    }
    
    // Toggle between local and production API
    toggleApiMode() {
        const currentMode = this.apiUrl.includes('localhost') ? 'local' : 'production';
        const newMode = currentMode === 'local' ? 'production' : 'local';
        
        if (newMode === 'local') {
            this.apiUrl = 'http://localhost:8000';
            localStorage.setItem('deepseek_api_mode', 'local');
            this.elements.apiUrlInput.value = this.apiUrl;
            this.showToast('🏠 Переключено на локальный API', 'success');
        } else {
            this.apiUrl = 'https://alexander-ai.onrender.com';
            localStorage.setItem('deepseek_api_mode', 'production');
            this.elements.apiUrlInput.value = this.apiUrl;
            this.showToast('☁️ Переключено на продакшн API', 'success');
        }
        
        // Update button icon
        const apiModeButton = document.querySelector('.header-controls button[aria-label="Toggle API Mode"]');
        if (apiModeButton) {
            apiModeButton.innerHTML = newMode === 'local' ? '🏠' : '☁️';
            apiModeButton.title = `Current: ${newMode === 'local' ? 'Local' : 'Production'} API`;
        }
        
        console.log('🔧 API mode toggled to:', newMode);
        console.log('📍 New API URL:', this.apiUrl);
        
        // Test connection with new API
        setTimeout(() => this.testApiConnection(), 1000);
    }

    // Detect API URL automatically
    detectApiUrl() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const fullUrl = window.location.href;

        console.log('🔍 Detecting API URL:');
        console.log('  Hostname:', hostname);
        console.log('  Protocol:', protocol);
        console.log('  Full URL:', fullUrl);

        // Check if we're running on GitHub Pages
        if (hostname === 'mttmxr-creator.github.io') {
            console.log('  ✅ GitHub Pages detected, using GitHub Actions backend');
            return 'https://api.github.com/repos/mttmxr-creator/ALexander-project/actions/workflows/full-deploy.yml/runs';
        }
        
        // Check if we're running locally
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            console.log('  ✅ Local development detected, using localhost API');
            return 'http://localhost:8000';
        }
        
        // For any other domain, use GitHub Actions
        console.log('  ✅ Other domain detected, using GitHub Actions backend');
        return 'https://api.github.com/repos/mttmxr-creator/ALexander-project/actions/workflows/full-deploy.yml/runs';
    }

    // Load settings from localStorage
    loadSettings() {
        const savedApiUrl = localStorage.getItem('deepseek_api_url');
        const savedStreaming = localStorage.getItem('deepseek_streaming');
        const savedApiMode = localStorage.getItem('deepseek_api_mode');
        
        // Set API mode (local/production)
        if (savedApiMode === 'production') {
            this.apiUrl = 'https://alexander-ai.onrender.com';
            console.log('🔧 Using production API from settings');
        } else if (savedApiMode === 'local') {
            this.apiUrl = 'http://localhost:8000';
            console.log('🔧 Using local API from settings');
        } else {
            // Auto-detect based on current location
            this.apiUrl = this.detectApiUrl();
            console.log('🔧 Auto-detected API URL');
        }
        
        // Override with saved URL if exists
        if (savedApiUrl) {
            this.apiUrl = savedApiUrl;
            console.log('🔧 Using saved API URL:', savedApiUrl);
        }
        
        if (savedStreaming !== null) {
            this.isStreaming = savedStreaming === 'true';
            this.elements.streamingInput.checked = this.isStreaming;
        }
        
        // Update settings UI
        this.updateSettingsUI();
    }
    
    // Update settings UI to reflect current state
    updateSettingsUI() {
        if (this.elements.apiUrlInput) {
            this.elements.apiUrlInput.value = this.apiUrl;
        }
        
        // Add API mode selector if not exists
        this.addApiModeSelector();
    }
    
    // Add API mode selector to settings
    addApiModeSelector() {
        const settingsBody = document.querySelector('.modal-body');
        if (!settingsBody || document.getElementById('apiModeSelector')) return;
        
        const modeSelector = document.createElement('div');
        modeSelector.className = 'setting-group';
        modeSelector.id = 'apiModeSelector';
        
        const currentMode = this.apiUrl.includes('localhost') ? 'local' : 'production';
        
        modeSelector.innerHTML = `
            <label>API Mode:</label>
            <select id="apiModeSelect">
                <option value="auto" ${!localStorage.getItem('deepseek_api_mode') ? 'selected' : ''}>Auto-detect</option>
                <option value="local" ${currentMode === 'local' ? 'selected' : ''}>Local (localhost:8000)</option>
                <option value="production" ${currentMode === 'production' ? 'selected' : ''}>Production (alexander-ai.onrender.com)</option>
            </select>
            <small>Выберите режим API или оставьте Auto-detect для автоматического определения</small>
        `;
        
        // Insert after first setting group
        const firstGroup = settingsBody.querySelector('.setting-group');
        if (firstGroup) {
            firstGroup.parentNode.insertBefore(modeSelector, firstGroup.nextSibling);
        }
        
        // Add event listener
        const select = modeSelector.querySelector('#apiModeSelect');
        select.addEventListener('change', (e) => {
            const mode = e.target.value;
            if (mode === 'auto') {
                localStorage.removeItem('deepseek_api_mode');
                this.apiUrl = this.detectApiUrl();
            } else if (mode === 'local') {
                localStorage.setItem('deepseek_api_mode', 'local');
                this.apiUrl = 'http://localhost:8000';
            } else if (mode === 'production') {
                localStorage.setItem('deepseek_api_mode', 'production');
                this.apiUrl = 'https://alexander-ai.onrender.com';
            }
            
            console.log('🔧 API mode changed to:', mode);
            console.log('📍 New API URL:', this.apiUrl);
            
            // Update URL input
            if (this.elements.apiUrlInput) {
                this.elements.apiUrlInput.value = this.apiUrl;
            }
        });
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

    // Send message
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
            
            // Try JavaScript backend first
            if (this.jsBackend && this.jsBackend.isInitialized) {
                console.log('🚀 Using JavaScript Backend');
                response = await this.jsBackend.processChat(message);
            } else {
                // Fallback to HTTP API
                console.log('🌐 Using HTTP API');
                response = await this.sendToHttpAPI(message);
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

    // Send to HTTP API (fallback)
    async sendToHttpAPI(message) {
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

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
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
        return messageElement.id; // Return the ID for updating
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

    // Initialize chat
    init() {
        this.loadSettings();
        this.loadChatHistory();
        this.addTestButton();
        this.updateSendButton();
        this.scrollToBottom();

        // Log current API URL for debugging
        console.log('🚀 DeepSeek Chat initialized');
        console.log('📍 Current API URL:', this.apiUrl);
        console.log('🌐 Current location:', window.location.href);
        
        // Initialize JavaScript backend
        this.initJavaScriptBackend();
        
        // Show current API URL in interface for debugging
        this.showApiUrlInfo();
    }

    // Initialize JavaScript backend
    async initJavaScriptBackend() {
        try {
            // Check if JavaScript backend is available
            if (typeof window.JavaScriptBackend !== 'undefined') {
                this.jsBackend = new window.JavaScriptBackend();
                await this.jsBackend.init();
                console.log('✅ JavaScript Backend initialized');
                
                // Test backend health
                const health = await this.jsBackend.healthCheck();
                console.log('🏥 Backend health:', health);
                
            } else {
                console.log('⚠️ JavaScript Backend not available, using HTTP API');
            }
        } catch (error) {
            console.error('❌ Failed to initialize JavaScript Backend:', error);
        }
    }
    
    // Show API URL info in interface
    showApiUrlInfo() {
        // Add info about current API URL
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = `
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
        infoDiv.innerHTML = `
            <strong>🔗 API URL:</strong><br>
            ${this.apiUrl}<br>
            <strong>🌐 Location:</strong><br>
            ${window.location.hostname}
        `;
        document.body.appendChild(infoDiv);
        
        // Remove after 10 seconds
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.parentNode.removeChild(infoDiv);
            }
        }, 10000);
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
