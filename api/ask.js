const fetch = require('node-fetch');

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
    try {
      const { query } = req.body;
      console.log('Proxying request to API:', query);

      // Updated API endpoint or use environment variable
      const apiUrl = process.env.API_ENDPOINT || 'https://pho24-chatbot.vercel.app/ask';
      
      console.log('Sending request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        redirect: 'follow', // Follow redirects automatically
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API responded with status: ${response.status}, message: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      res.json(data);
    } catch (error) {
      console.error('Proxy error:', error.message);
      res.status(500).json({ 
        error: 'An error occurred while processing your request',
        response: 'Sorry, I couldn\'t process that request. Please try again later.'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 