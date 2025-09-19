// Initialize animations
AOS.init();
feather.replace();

// Background animation
VANTA.GLOBE({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x667eea,
    backgroundColor: 0xf1f5f9,
    size: 0.8
});

// Chat functionality - UPDATE THIS IP ADDRESS!
let RASPBERRY_PI_IP = localStorage.getItem('llamaServerIP') || '192.168.0.7';

// Add a function to change IP
function updateServerIP(newIP) {
    RASPBERRY_PI_IP = newIP;
    localStorage.setItem('llamaServerIP', newIP);
    alert('Server IP updated to: ' + newIP);
}

const API_URL = `http://${RASPBERRY_PI_IP}:8080/v1/chat/completions`;

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const ttsToggle = document.getElementById('tts-toggle');
const voiceInput = document.getElementById('voice-input');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');

let ttsEnabled = true;
let recognition;

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Send message
async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    // Add user message
    addMessage(message, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message-bubble ai-bubble flex items-center space-x-2';
    typingIndicator.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
            <i data-feather="cpu" class="w-3 h-3 text-white"></i>
        </div>
        <div class="flex space-x-1">
            <div class="w-2 h-2 rounded-full bg-gray-400 pulse"></div>
            <div class="w-2 h-2 rounded-full bg-gray-400 pulse" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 rounded-full bg-gray-400 pulse" style="animation-delay: 0.4s"></div>
        </div>
    `;
    chatContainer.appendChild(typingIndicator);
    scrollToBottom();
    feather.replace();

    try {
        // Use the chat completions endpoint for better formatting
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: message }
                ],
                max_tokens: 100,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        chatContainer.removeChild(typingIndicator);
        
        // Extract the response text
        const aiResponse = data.choices[0].message.content;
        addMessage(aiResponse, 'ai');
        
        // Speak the response if TTS is enabled
        if (ttsEnabled) {
            speak(aiResponse);
        }
        
    } catch (error) {
        chatContainer.removeChild(typingIndicator);
        addMessage('Error: ' + error.message, 'ai');
        console.error('Error:', error);
    }
}

// Add message to chat with improved animation
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${sender}-bubble`;
    
    if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="flex items-center space-x-2 mb-1">
                <div class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <i data-feather="cpu" class="w-3 h-3 text-white"></i>
                </div>
                <span class="font-semibold">AI Assistant</span>
            </div>
            <p>${text}</p>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="flex items-center space-x-2 mb-1">
                <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <i data-feather="user" class="w-3 h-3 text-white"></i>
                </div>
                <span class="font-semibold">You</span>
            </div>
            <p>${text}</p>
        `;
    }
    
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
    feather.replace();
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Text-to-speech function
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}

// Voice recognition
function startVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = function() {
            voiceInput.innerHTML = '<i data-feather="mic-off" class="w-5 h-5"></i>';
            feather.replace();
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            voiceInput.innerHTML = '<i data-feather="mic" class="w-5 h-5"></i>';
            feather.replace();
        };
        
        recognition.onend = function() {
            voiceInput.innerHTML = '<i data-feather="mic" class="w-5 h-5"></i>';
            feather.replace();
        };
        
        recognition.start();
    } else {
        alert('Speech recognition not supported in your browser');
    }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

ttsToggle.addEventListener('click', function() {
    ttsEnabled = !ttsEnabled;
    this.querySelector('span').textContent = `TTS: ${ttsEnabled ? 'ON' : 'OFF'}`;
    this.querySelector('i').setAttribute('data-feather', ttsEnabled ? 'volume-2' : 'volume-x');
    feather.replace();
});

voiceInput.addEventListener('click', startVoiceRecognition);

settingsBtn.addEventListener('click', function() {
    settingsModal.classList.remove('hidden');
});

closeSettings.addEventListener('click', function() {
    settingsModal.classList.add('hidden');
});

// Close modal when clicking outside
settingsModal.addEventListener('click', function(e) {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// Test connection on load
async function testConnection() {
    try {
        const response = await fetch(`http://${RASPBERRY_PI_IP}:8080/health`, {
            method: 'GET'
        });
        if (response.ok) {
            console.log('Connected to Raspberry Pi successfully!');
        }
    } catch (error) {
        console.error('Could not connect to Raspberry Pi:', error);
        addMessage('Could not connect to AI server. Please check if the server is running on your Raspberry Pi.', 'ai');
    }
}

// Test connection when page loads
window.addEventListener('load', testConnection);