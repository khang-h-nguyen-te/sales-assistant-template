document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const chatContainer = document.querySelector('.chat-container');
    const closeButton = document.querySelector('.close-btn');
    const chatWidgetButton = document.querySelector('.chat-widget-button');

    // --- CONFIGURATION --- Get API URL from environment or config
    // Replace with your actual mechanism to get the API endpoint
    const API_ENDPOINT = 'YOUR_API_ENDPOINT_HERE'; // <--- Replace this
    const ASSISTANT_AVATAR = 'placeholder-avatar.png'; // <-- Replace with your assistant's avatar path
    const USER_AVATAR = 'placeholder-user.png'; // <-- Replace with default user avatar if needed

    // Function to add a message to the chat display
    function addMessageToChat(sender, text, time, isUser = false) {
        // Remove any existing typing indicator
        const typingIndicator = chatMessages.querySelector('.message.assistant.typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', isUser ? 'user' : 'assistant');

        let messageContentHTML;
        const formattedTime = time || getCurrentTime();

        if (isUser) {
            messageContentHTML = `
                <div class="message-content">${text}</div>
                <div class="message-time">${formattedTime}</div>
            `;
            // Optional: Add user avatar if design requires it
            // messageContentHTML = `
            //     <img src="${USER_AVATAR}" alt="User Avatar" class="avatar">
            //     <div class="message-details">
            //          <div class="message-content">${text}</div>
            //          <div class="message-time">${formattedTime}</div>
            //     </div>
            // `;
        } else {
            messageContentHTML = `
                <img src="${ASSISTANT_AVATAR}" alt="Assistant Avatar" class="avatar">
                <div class="message-details">
                    <div class="message-sender">${sender}</div>
                    <div class="message-content">${text}</div>
                    <div class="message-time">${formattedTime}</div>
                </div>
            `;
        }

        messageElement.innerHTML = messageContentHTML;
        chatMessages.appendChild(messageElement);

        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to show typing indicator
    function showTypingIndicator() {
         // Remove any existing typing indicator first
        const existingIndicator = chatMessages.querySelector('.message.assistant.typing');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const typingElement = document.createElement('div');
        typingElement.classList.add('message', 'assistant', 'typing');
        typingElement.innerHTML = `
             <img src="${ASSISTANT_AVATAR}" alt="Assistant Avatar" class="avatar">
             <div class="message-details">
                 <div class="message-sender">Assistant</div>
                 <div class="message-content">
                    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                 </div>
            </div>
        `;
        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to get current time formatted
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Function to handle sending a message
    async function sendMessage() {
        const messageText = messageInput.value.trim();
        if (!messageText) return; // Don't send empty messages

        // Add user message to chat
        addMessageToChat('User', messageText, getCurrentTime(), true);
        messageInput.value = ''; // Clear input field

        // Show typing indicator
        showTypingIndicator();

        // --- API Call --- Replace with your actual API call logic
        try {
            console.log('Sending to API:', messageText);
            // ** START: Replace this block with your API call **
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any other headers like Authorization if needed
                },
                body: JSON.stringify({ query: messageText })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            const assistantReply = data.reply || "Sorry, I couldn't process that."; // Adjust based on your API response structure
             // ** END: Replace this block with your API call **

            console.log('Received from API:', assistantReply);
            // Add assistant reply to chat
            addMessageToChat('Assistant', assistantReply, getCurrentTime());

        } catch (error) {
            console.error('Error sending/receiving message:', error);
            // Remove typing indicator
            const typingIndicator = chatMessages.querySelector('.message.assistant.typing');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            // Display error message in chat
            addMessageToChat('Assistant', "Oops! Something went wrong. Please try again.", getCurrentTime());
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Optional: Toggle chat window visibility
    if (chatWidgetButton && closeButton && chatContainer) {
        chatWidgetButton.addEventListener('click', () => {
            chatContainer.style.display = 'flex'; // Or 'block'
            chatWidgetButton.style.display = 'none';
        });

        closeButton.addEventListener('click', () => {
            chatContainer.style.display = 'none';
            chatWidgetButton.style.display = 'flex'; // Or 'block'
        });

        // Initially hide the chat container and show the button
        chatContainer.style.display = 'none';
        chatWidgetButton.style.display = 'flex'; // Or 'block'
    }

    // Add initial welcome message or fetch history if needed
    // Example:
    // addMessageToChat('Assistant', 'Welcome! How can I assist you today?', getCurrentTime());

}); 