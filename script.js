// Get DOM elements
const chatContainer = document.getElementById('chat-container');
const chatWidgetButton = document.getElementById('chat-widget-button');
const closeBtn = document.getElementById('close-btn');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

// Toggle chat window visibility
chatWidgetButton.addEventListener('click', () => {
    chatContainer.style.display = chatContainer.style.display === 'none' ? 'flex' : 'none';
});

closeBtn.addEventListener('click', () => {
    chatContainer.style.display = 'none';
});

// Function to add a message to the chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user' : 'assistant');

    if (!isUser) {
        messageDiv.innerHTML = `
            <img src="path_to_pho_viet_logo.png" alt="Assistant Avatar" class="avatar">
            <div class="message-details">
                <div class="message-sender">Assistant</div>
                <div class="message-content">${content}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'assistant', 'typing');
    typingDiv.innerHTML = `
        <img src="path_to_pho_viet_logo.png" alt="Assistant Avatar" class="avatar">
        <div class="message-details">
            <div class="message-sender">Assistant</div>
            <div class="message-content">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Function to remove typing indicator
function removeTypingIndicator(typingDiv) {
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Function to send a message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);
    messageInput.value = '';

    // Show typing indicator
    const typingDiv = showTypingIndicator();

    try {
        // Replace with your API endpoint
        const response = await fetch('YOUR_API_ENDPOINT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        // Assuming your API returns a response field called 'reply'
        removeTypingIndicator(typingDiv);
        addMessage(data.reply);
    } catch (error) {
        removeTypingIndicator(typingDiv);
        addMessage('Error: Could not reach the chatbot.');
        console.error(error);
    }
}

// Send message on button click
sendButton.addEventListener('click', sendMessage);

// Send message on Enter key press
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});