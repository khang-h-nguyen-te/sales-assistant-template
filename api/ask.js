const fetch = require('node-fetch');

// Helper function to add timeout to fetch
const fetchWithTimeout = async (url, options, timeout = 9000) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Vercel serverless function for the /api/ask endpoint
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST request
  if (req.method === 'POST') {
    const { query } = req.body;
    console.log('Processing request:', query);

    // If this is a cold start or first request, send a quick response
    if (query === '__ping') {
      return res.json({ 
        response: "I'm awake now! What can I help you with?",
        coldStart: true
      });
    }

    // Process the actual request with retries
    try {
      const apiUrl = process.env.API_ENDPOINT || 'https://pho24-chatbot.vercel.app/ask';
      console.log('Sending request to:', apiUrl);
      
      // Try up to 2 times (initial + 1 retry)
      let lastError = null;
      let attempts = 0;
      const maxAttempts = 2;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts}`);
        
        try {
          // Use a shorter timeout for better user experience
          const response = await fetchWithTimeout(
            apiUrl, 
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query }),
              redirect: 'follow',
            },
            8000 // 8-second timeout (Vercel has a 10s limit)
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error response (${response.status}):`, errorText.substring(0, 100));
            throw new Error(`API responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API response success');
          return res.json(data);
        } catch (error) {
          console.error(`Attempt ${attempts} failed:`, error.message);
          lastError = error;
          
          // If it's not a timeout error, don't retry
          if (error.name !== 'AbortError' && !error.message.includes('timeout')) {
            break;
          }
        }
      }
      
      throw lastError || new Error('All attempts failed');
    } catch (error) {
      console.error('Error processing request:', error.message);
      return res.status(500).json({ 
        error: 'Processing request failed',
        response: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment."
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}; 