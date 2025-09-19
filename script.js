document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('input-text');
    const voiceSelect = document.getElementById('voice-select');
    const generateBtn = document.getElementById('generate-btn');
    const speakBtn = document.getElementById('speak-btn');
    const responseContent = document.getElementById('response-content');
    const status = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    
    let aiResponse = '';
    let voices = [];
    let synthesis = window.speechSynthesis;
    
    // Initialize voices
    function loadVoices() {
        voices = synthesis.getVoices();
        voiceSelect.innerHTML = '<option value="">Select a voice...</option>';
        
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }
    
    // Load voices when they are ready
    if (synthesis.onvoiceschanged !== undefined) {
        synthesis.onvoiceschanged = loadVoices;
    }
    
    // Initial load
    loadVoices();
    
    // Simulate LLM response (in a real application, this would be an API call)
    function getLLMResponse(prompt) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Simulated responses based on input
                const responses = [
                    "Hello! I'm an AI assistant. How can I help you today?",
                    "That's an interesting question. Based on my knowledge, I can tell you that AI is transforming many industries.",
                    "I understand what you're asking. From my perspective, the future of AI looks very promising.",
                    "Thanks for your input. I'm constantly learning from interactions like this one.",
                    "I've processed your request and here's what I think: AI and human collaboration will shape the future of technology."
                ];
                
                // Simple "intent" detection
                if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
                    resolve(responses[0]);
                } else if (prompt.toLowerCase().includes('question')) {
                    resolve(responses[1]);
                } else if (prompt.toLowerCase().includes('future')) {
                    resolve(responses[2]);
                } else if (prompt.toLowerCase().includes('learn')) {
                    resolve(responses[3]);
                } else {
                    // Default response based on prompt length
                    const index = Math.min(prompt.length % 5, 4);
                    resolve(responses[index]);
                }
            }, 2000); // Simulate network delay
        });
    }
    
    // Generate AI response
    generateBtn.addEventListener('click', async function() {
        const text = inputText.value.trim();
        
        if (!text) {
            alert('Please enter some text first');
            return;
        }
        
        // Show status
        status.classList.remove('hidden');
        statusText.textContent = 'Processing your request...';
        generateBtn.disabled = true;
        
        try {
            // Get response from LLM
            aiResponse = await getLLMResponse(text);
            
            // Display response
            responseContent.innerHTML = `<p>${aiResponse}</p>`;
            
            // Enable speak button
            speakBtn.disabled = false;
            
            // Update status
            statusText.textContent = 'Response generated successfully';
            setTimeout(() => {
                status.classList.add('hidden');
            }, 2000);
        } catch (error) {
            responseContent.innerHTML = `<p style="color: #ff6b6b;">Error: ${error.message}</p>`;
            statusText.textContent = 'An error occurred';
        } finally {
            generateBtn.disabled = false;
        }
    });
    
    // Speak the response
    speakBtn.addEventListener('click', function() {
        if (!aiResponse) {
            alert('Please generate a response first');
            return;
        }
        
        const selectedVoice = voiceSelect.value;
        let utterance;
        
        if (selectedVoice) {
            const voice = voices.find(v => v.name === selectedVoice);
            utterance = new SpeechSynthesisUtterance(aiResponse);
            utterance.voice = voice;
        } else {
            utterance = new SpeechSynthesisUtterance(aiResponse);
        }
        
        synthesis.speak(utterance);
        
        // Update status while speaking
        status.classList.remove('hidden');
        statusText.textContent = 'Speaking...';
        
        utterance.onend = function() {
            statusText.textContent = 'Speech completed';
            setTimeout(() => {
                status.classList.add('hidden');
            }, 2000);
        };
    });
});