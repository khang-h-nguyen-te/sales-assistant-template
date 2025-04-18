document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const chatContainer = document.querySelector('.chat-container');
    const closeButton = document.querySelector('.close-btn');
    const chatWidgetButton = document.querySelector('.chat-widget-button');

    // --- CONFIGURATION ---
    // Get API endpoint from environment config
    const config = window.ENV_CONFIG || {};
    
    // Use local proxy endpoint (server.js handles the CORS issues)
    const API_ENDPOINT = '/api/ask';
    
    // CORS proxy option (kept for reference)
    // const API_ENDPOINT = `https://corsproxy.io/?${encodeURIComponent(config.API_ENDPOINT || 'YOUR_API_ENDPOINT_HERE')}`;
    
    console.log('Using API endpoint:', API_ENDPOINT); // Debug log
    
    const ASSISTANT_NAME = 'Pho24'; // Changed from Assistant
    const ASSISTANT_AVATAR = 'placeholder-avatar.png'; // <-- Replace with your assistant's avatar path
    // const USER_AVATAR = 'placeholder-user.png'; // No user avatar in current design
    const INITIAL_MESSAGE = 'Hey, how can I help you today?'; // Initial message from Pho24

    // Warm up the API when the page loads to prevent cold start delays
    (async function warmUpAPI() {
        try {
            console.log('Warming up API...');
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: '__ping' })
            });
            if (response.ok) {
                console.log('API warmed up successfully');
            }
        } catch (error) {
            console.warn('API warm-up failed, will retry on first user message:', error);
        }
    })();

    // Function to parse Markdown to HTML
    function parseMarkdown(text) {
        // Check if marked is available
        if (typeof marked !== 'undefined') {
            try {
                // Configure marked for safe HTML
                marked.setOptions({
                    breaks: true, // Convert \n to <br>
                    gfm: true,    // GitHub Flavored Markdown
                    sanitize: false // Don't sanitize - we'll handle this
                });
                return marked.parse(text);
            } catch (e) {
                console.error('Error parsing markdown:', e);
                return text; // Fallback to plain text
            }
        }
        return text; // Fallback if marked is not available
    }

    // Function to sanitize HTML
    function sanitizeHTML(html) {
        // Very basic sanitization - for production, use a library like DOMPurify
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/onclick/gi, 'data-disabled-onclick')
            .replace(/onerror/gi, 'data-disabled-onerror');
    }

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
        
        // Parse markdown for assistant messages
        const processedText = isUser ? text : sanitizeHTML(parseMarkdown(text));

        if (isUser) {
            messageContentHTML = `
                <div class="message-content">${processedText}</div>
                <div class="message-time">${formattedTime}</div>
            `;
        } else {
            messageContentHTML = `
                <img src="${ASSISTANT_AVATAR}" alt="${ASSISTANT_NAME} Avatar" class="avatar">
                <div class="message-details">
                    <div class="message-sender">${sender}</div>
                    <div class="message-content markdown-content">${processedText}</div>
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
        const existingIndicator = chatMessages.querySelector('.message.assistant.typing');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const typingElement = document.createElement('div');
        typingElement.classList.add('message', 'assistant', 'typing');
        typingElement.innerHTML = `
             <img src="${ASSISTANT_AVATAR}" alt="${ASSISTANT_NAME} Avatar" class="avatar">
             <div class="message-details">
                 <div class="message-sender">${ASSISTANT_NAME}</div>
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
        if (!messageText) return;

        addMessageToChat('User', messageText, getCurrentTime(), true);
        messageInput.value = '';

        showTypingIndicator();

        try {
            console.log('Sending to API:', messageText);
            let retries = 2;
            let success = false;
            let data;
            
            while (retries > 0 && !success) {
                try {
                    const response = await fetch(API_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Origin': window.location.origin,
                        },
                        credentials: 'omit',
                        mode: 'cors',
                        body: JSON.stringify({ query: messageText })
                    });

                    if (!response.ok) {
                        throw new Error(`API error: ${response.statusText}`);
                    }

                    data = await response.json();
                    success = true;
                } catch (error) {
                    console.error(`Retry attempt ${3-retries} failed:`, error);
                    retries--;
                    if (retries === 0) {
                        throw error;
                    }
                    // Wait a second before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            const assistantReply = data.response || "Sorry, I couldn't process that.";

            console.log('Received from API:', assistantReply);
            addMessageToChat(ASSISTANT_NAME, assistantReply, getCurrentTime()); // Use ASSISTANT_NAME

        } catch (error) {
            console.error('Error sending/receiving message:', error);
            const typingIndicator = chatMessages.querySelector('.message.assistant.typing');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            addMessageToChat(ASSISTANT_NAME, "Oops! Something went wrong. Please try again.", getCurrentTime()); // Use ASSISTANT_NAME
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Toggle chat window visibility
    if (chatWidgetButton && closeButton && chatContainer) {
        chatWidgetButton.addEventListener('click', () => {
            chatContainer.style.display = 'flex';
            chatWidgetButton.style.display = 'none';
             // Add initial message only when chat opens for the first time
            if (chatMessages.children.length === 0 && INITIAL_MESSAGE) { 
                addMessageToChat(ASSISTANT_NAME, INITIAL_MESSAGE, getCurrentTime());
            }
        });

        closeButton.addEventListener('click', () => {
            chatContainer.style.display = 'none';
            chatWidgetButton.style.display = 'flex';
        });

        // Initially hide the chat container and show the button
        chatContainer.style.display = 'none';
        chatWidgetButton.style.display = 'flex';
    }

    // Remove initial message display on DOM load, it's now added when chat opens
    // addMessageToChat(ASSISTANT_NAME, INITIAL_MESSAGE, getCurrentTime());

}); 