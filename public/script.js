document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const thinkingIndicator = document.getElementById('thinking-indicator');

  // --- Slideshow Logic (Preserved) ---
  const slides = [
    "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1936&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1983&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2070&auto=format&fit=crop"
  ];
  const slideshowContainer = document.getElementById('slideshow-container');
  if (slideshowContainer) {
    let currentSlide = 0;
    slides.forEach((url, index) => {
      const img = document.createElement('div');
      img.style.backgroundImage = `url('${url}')`;
      img.className = `absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ease-in-out blur-bg ${index === 0 ? 'opacity-100' : 'opacity-0'}`;
      img.id = `slide-${index}`;
      slideshowContainer.appendChild(img);
    });

    setInterval(() => {
      const activeSlide = document.getElementById(`slide-${currentSlide}`);
      if (activeSlide) {
        activeSlide.classList.remove('opacity-100');
        activeSlide.classList.add('opacity-0');
      }
      currentSlide = (currentSlide + 1) % slides.length;
      const nextSlide = document.getElementById(`slide-${currentSlide}`);
      if (nextSlide) {
        nextSlide.classList.remove('opacity-0');
        nextSlide.classList.add('opacity-100');
      }
    }, 5000);
  }

  // --- Chatbot UI Logic ---
  const chatbot = document.getElementById('chatbot');

  window.openChat = function () {
    if (chatbot) {
      chatbot.classList.remove('hidden');
      setTimeout(() => chatInput && chatInput.focus(), 300);
      if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  window.closeChat = function () {
    if (chatbot) chatbot.classList.add('hidden');
  }

  // --- Main Chat Logic ---
  if (chatForm) {
    chatForm.addEventListener('submit', handleChatSubmit);
  }

  async function handleChatSubmit(e) {
    e.preventDefault();
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    addMessage('user', userInput);
    chatInput.value = '';

    // Show thinking indicator
    thinkingIndicator.classList.remove('hidden');
    chatMessages.scrollTop = chatMessages.scrollHeight;


    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          conversation: [{
            role: 'user',
            text: userInput
          }]
        })
      });

      // Hide thinking indicator
      thinkingIndicator.classList.add('hidden');

      if (!response.ok) {
        console.error("API Error:", response.status, response.statusText);
        addBotMessage('Failed to get response from server.');
        return;
      }

      const data = await response.json();

      if (data && data.result) {
        addBotMessage(data.result);
      } else {
        addBotMessage('Sorry, no response received.');
      }

    } catch (error) {
      console.error('Fetch Error:', error);
      thinkingIndicator.classList.add('hidden');
      addBotMessage('Failed to get response from server.');
    }
  }

  function addMessage(sender, text) {
    if (!chatMessages) return;

    const div = document.createElement('div');
    div.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');
    const bubbleClasses = sender === 'user' ?
      'bg-purple-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' :
      'bg-gray-700 text-gray-100 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl';

    bubble.className = `${bubbleClasses} p-3 max-w-[85%] text-sm shadow-sm animate-[popIn_0.2s_ease-out]`;

    // Sanitize text to prevent XSS, then apply formatting
    const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const formattedText = sanitizedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    bubble.innerHTML = formattedText;

    div.appendChild(bubble);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addBotMessage(text) {
    // Since the thinking indicator is now separate, we just add a new message from the bot.
    addMessage('bot', text);
  }
});