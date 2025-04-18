(function() {
  // Create container for the widget
  const container = document.createElement('div');
  container.id = 'pho24-chat-widget-container';
  document.body.appendChild(container);
  
  // Create and load iframe
  const iframe = document.createElement('iframe');
  iframe.src = 'https://sales-assistant-template-pi.vercel.app';
  iframe.style.position = 'fixed';
  iframe.style.bottom = '0';
  iframe.style.right = '0';
  iframe.style.width = '70px';  // Size for just the button
  iframe.style.height = '70px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '9999';
  iframe.style.borderRadius = '50%';
  iframe.style.overflow = 'hidden';
  iframe.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
  iframe.style.transition = 'width 0.3s, height 0.3s';
  
  // Add to container
  container.appendChild(iframe);
  
  // Add message listener to handle expansion when chat opens
  window.addEventListener('message', function(event) {
    // Verify origin for security
    if (event.origin !== 'https://sales-assistant-template-pi.vercel.app') return;
    
    // Handle messages from the iframe
    if (event.data === 'expand') {
      // Expand iframe when chat is opened
      iframe.style.width = '400px';
      iframe.style.height = '700px';
      iframe.style.borderRadius = '15px';
    } else if (event.data === 'collapse') {
      // Collapse iframe when chat is closed
      iframe.style.width = '70px';
      iframe.style.height = '70px';
      iframe.style.borderRadius = '50%';
    }
  });
})(); 