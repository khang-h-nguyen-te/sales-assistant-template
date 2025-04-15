// build.js - Script to inject environment variables into config.js
const fs = require('fs');
const path = require('path');

// Read the config template
const configPath = path.join(__dirname, 'config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace the API_ENDPOINT value only if environment variable exists
if (process.env.API_ENDPOINT) {
  console.log('Using API_ENDPOINT from environment variable');
  configContent = configContent.replace(/API_ENDPOINT:.*$/m, `API_ENDPOINT: '${process.env.API_ENDPOINT}'`);
} else {
  console.log('Using default API_ENDPOINT from config.js');
}

// Write the updated config
fs.writeFileSync(configPath, configContent);

console.log('Configuration file updated successfully'); 