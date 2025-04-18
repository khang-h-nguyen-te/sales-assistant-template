(function() {
  // Create container for the widget
  const container = document.createElement('div');
  container.id = 'pho24-chat-widget-container';
  container.style.position = 'fixed';
  container.style.bottom = '0';
  container.style.right = '0';
  container.style.zIndex = '99999'; // Higher z-index to ensure visibility
  document.body.appendChild(container);
  
  // Create and load iframe with proper URL parameters to indicate button mode
  const iframe = document.createElement('iframe');
  iframe.src = 'https://sales-assistant-template-pi.vercel.app?mode=button';
  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style.right = '20px';
  iframe.style.width = '60px';  // Slightly smaller size for better mobile fit
  iframe.style.height = '60px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '99999';
  iframe.style.borderRadius = '50%';
  iframe.style.overflow = 'hidden';
  iframe.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
  iframe.style.transition = 'all 0.3s ease-in-out';
  iframe.style.maxHeight = '80vh'; // Maximum height on viewport
  iframe.style.backgroundColor = 'transparent'; // Ensure background is transparent
  iframe.allowTransparency = "true"; // Allow transparency in the iframe
  
  // Add to container
  container.appendChild(iframe);
  
  // Check if mobile
  const isMobile = window.innerWidth <= 768;
  
  // Responsive dimensions based on device
  const getChatDimensions = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (windowWidth <= 480) {
      // Small mobile phone
      return {
        width: 'calc(100% - 20px)', // Full width minus small margins
        height: '80vh',
        bottom: '0',
        right: '10px',
        left: '10px',
        borderRadius: '15px 15px 0 0'
      };
    } else if (windowWidth <= 768) {
      // Tablet/larger phone
      return {
        width: Math.min(350, windowWidth - 40) + 'px', // Adapt to screen size with margins
        height: Math.min(550, windowHeight * 0.8) + 'px',
        borderRadius: '15px'
      };
    } else {
      // Desktop
      return {
        width: '380px',
        height: Math.min(620, windowHeight * 0.8) + 'px',
        borderRadius: '15px'
      };
    }
  };
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (iframe.style.width !== '60px') {
      // Only update if chat is expanded
      const dimensions = getChatDimensions();
      Object.assign(iframe.style, dimensions);
    }
  });
  
  // Add message listener to handle expansion when chat opens
  window.addEventListener('message', function(event) {
    // Verify origin for security
    if (event.origin !== 'https://sales-assistant-template-pi.vercel.app') return;
    
    // Handle messages from the iframe
    if (event.data === 'expand') {
      // Expand iframe when chat is opened
      const dimensions = getChatDimensions();
      Object.assign(iframe.style, dimensions);
      iframe.src = 'https://sales-assistant-template-pi.vercel.app?mode=chat';
    } else if (event.data === 'collapse') {
      // Collapse iframe when chat is closed
      iframe.style.width = '60px';
      iframe.style.height = '60px';
      iframe.style.bottom = '20px';
      iframe.style.right = '20px';
      iframe.style.left = 'auto'; // Reset left position
      iframe.style.borderRadius = '50%';
      iframe.src = 'https://sales-assistant-template-pi.vercel.app?mode=button';
    }
  });
})(); 