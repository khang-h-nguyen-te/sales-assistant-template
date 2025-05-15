(function() {
  // Detect if we're in Wix
  const isInWix = window.location.href.indexOf('wix.com') > -1 || 
                document.querySelector('html[data-wix-app]') !== null || 
                document.querySelector('body[data-wf-site]') !== null;
  
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
  iframe.src = 'https://sales-assistant-template-pi.vercel.app?mode=button' + (isInWix ? '&wix=true' : '');
  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style.right = '20px';
  iframe.style.width = '60px';  // Slightly smaller size for better mobile fit
  iframe.style.height = '60px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '99999';
  iframe.style.borderRadius = '50%';
  iframe.style.overflow = 'hidden';
  iframe.style.boxShadow = isInWix ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.2)';
  iframe.style.transition = 'none';
  iframe.style.maxHeight = '80vh'; // Maximum height on viewport
  iframe.style.backgroundColor = 'transparent'; // Ensure background is transparent
  iframe.allowTransparency = "true"; // Allow transparency in the iframe
  iframe.frameBorder = "0"; // Set frame border to 0
  iframe.scrolling = "no"; // Disable scrolling
  
  // Add Wix-specific styling if detected
  if (isInWix) {
    iframe.style.webkitBoxShadow = "none";
    iframe.style.mozBoxShadow = "none";
    iframe.style.msFilter = "none";
    iframe.setAttribute('wix-integration', 'true');
  }
  
  
  // Add to container
  container.appendChild(iframe);
  
  // Check if mobile
  const isMobile = window.innerWidth <= 768;
  
  // Responsive dimensions based on device
  const getChatDimensions = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const dimensions = {
      boxShadow: isInWix ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.2)',
      webkitBoxShadow: isInWix ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.2)',
      mozBoxShadow: isInWix ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.2)',
      msFilter: isInWix ? 'none' : 'progid:DXImageTransform.Microsoft.Shadow(color=#000000,direction=135,strength=10)',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      transition: 'none'
    };
    
    if (windowWidth <= 480) {
      // Small mobile phone
      return Object.assign(dimensions, {
        width: 'calc(100% - 20px)', // Full width minus small margins
        height: '80vh',
        bottom: '0',
        right: '10px',
        left: '10px',
        borderRadius: '15px 15px 0 0'
      });
    } else if (windowWidth <= 768) {
      // Tablet/larger phone
      return Object.assign(dimensions, {
        width: Math.min(350, windowWidth - 40) + 'px', // Adapt to screen size with margins
        height: Math.min(550, windowHeight * 0.8) + 'px',
        borderRadius: '15px'
      });
    } else {
      // Desktop
      return Object.assign(dimensions, {
        width: '380px',
        height: Math.min(620, windowHeight * 0.8) + 'px',
        borderRadius: '15px'
      });
    }
  };
  
  // Simplified direct toggle without animation
  function toggleChat(mode) {
    if (mode === 'expand') {
      const dimensions = getChatDimensions();
      // Apply all styles at once without animation
      Object.assign(iframe.style, dimensions);
      // Set src last to avoid flicker during transition
      setTimeout(() => {
        iframe.src = 'https://sales-assistant-template-pi.vercel.app?mode=chat' + (isInWix ? '&wix=true' : '');
      }, 10);
    } else {
      // Collapse - set all properties at once
      Object.assign(iframe.style, {
        width: '60px',
        height: '60px',
        bottom: '20px',
        right: '20px',
        left: 'auto',
        borderRadius: '50%',
        boxShadow: isInWix ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.2)',
        webkitBoxShadow: isInWix ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.2)',
        mozBoxShadow: isInWix ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.2)',
        msFilter: isInWix ? 'none' : 'progid:DXImageTransform.Microsoft.Shadow(color=#000000,direction=135,strength=10)',
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        transition: 'none'
      });
      // Set src last to avoid flicker
      setTimeout(() => {
        iframe.src = 'https://sales-assistant-template-pi.vercel.app?mode=button' + (isInWix ? '&wix=true' : '');
      }, 10);
    }
  }
  
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
    
    // Handle messages from the iframe with simplified toggle
    if (event.data === 'expand') {
      toggleChat('expand');
    } else if (event.data === 'collapse') {
      toggleChat('collapse');
    }
  });
})(); 