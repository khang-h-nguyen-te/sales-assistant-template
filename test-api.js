const fetch = require('node-fetch');

// API endpoint
const apiUrl = 'https://pho24-chatbot.vercel.app/ask';

async function testApi() {
  try {
    console.log('Sending test request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'Hello, this is a test message' }),
      redirect: 'follow', // Follow redirects automatically
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response body:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Parsed JSON:', data);
    } catch (e) {
      console.log('Not valid JSON');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApi(); 