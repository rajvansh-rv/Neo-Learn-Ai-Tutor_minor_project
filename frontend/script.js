document.addEventListener('DOMContentLoaded', () => {
    // --- Global User & History Init ---
    window.neoUserId = localStorage.getItem('neo_user_id') || 'neo_guest_' + Math.random().toString(36).substring(7);
    localStorage.setItem('neo_user_id', window.neoUserId);
    window.currentChatId = null;
    window.chatMessagesContext = [];

    setTimeout(() => { if (window.loadHistorySidebar) window.loadHistorySidebar(); }, 500);

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function toggleSidebar() {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }

    mobileMenuBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);

    // Close sidebar on window resize if switching to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.add('hidden');
        } else {
            if (overlay.classList.contains('hidden')) {
                sidebar.classList.add('-translate-x-full');
            }
        }
    });

    // Dark Mode Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

    // Initialize the icon based on the current class set by the head script
    if (document.documentElement.classList.contains('dark')) {
        if (themeIcon) {
            themeIcon.classList.remove('fa-circle-half-stroke', 'fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    } else {
        if (themeIcon) {
            themeIcon.classList.remove('fa-circle-half-stroke', 'fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            // toggle icons inside button
            if (themeIcon) {
                themeIcon.classList.toggle('fa-moon');
                themeIcon.classList.toggle('fa-sun');
            }

            // if set via local storage previously
            if (localStorage.getItem('color-theme')) {
                if (localStorage.getItem('color-theme') === 'light') {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('color-theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('color-theme', 'light');
                }

            // if NOT set via local storage previously
            } else {
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('color-theme', 'light');
                } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('color-theme', 'dark');
                }
            }
        });
    }

    // AI Tutor Chat Integration
    const chatInput = document.getElementById('chat-input');
    const chatSubmit = document.getElementById('chat-submit');
    const chatMessages = document.getElementById('chat-messages');
    const heroSection = document.getElementById('hero-section');
    const chatInputWrapper = document.getElementById('chat-input-wrapper');

    // Reference Functionality Elements
    const aiTutorTab = document.getElementById('ai-tutor-tab');
    const referenceTab = document.getElementById('reference-tab');
    const referenceContainer = document.getElementById('reference-container');
    const referenceGrid = document.getElementById('reference-grid');
    const refTopicLabel = document.getElementById('ref-topic-label');

    // ATS Functionality Elements
    const atsTab = document.getElementById('ats-tab');
    const atsContainer = document.getElementById('ats-container');

    // Profile Functionality Elements
    const profileTab = document.getElementById('profile-tab');
    const profileContainer = document.getElementById('profile-container');
    const authButtonsContainer = document.getElementById('auth-buttons-container');
    const userInfoContainer = document.getElementById('user-info-container');
    const logoutBtn = document.getElementById('logout-btn');

    // --- GLOBAL UI HELPERS ---
    
    // Global Toast Notification
    window.showToast = function(message, type = 'error') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
        const icon = type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check';
        
        toast.className = `toast-message flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgColor}`;
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    // Replace original alert with showToast where applicable (if it's not a native prompt)
    const originalAlert = window.alert;
    window.alert = function(msg) {
        window.showToast(msg, 'error');
    };

    // Centralized Page Switcher
    const pageSections = {
        'hero': heroSection,
        'chat': chatMessages,
        'reference': referenceContainer,
        'ats': atsContainer,
        'profile': profileContainer
    };

    window.switchPage = function(targetPage) {
        // Hide all
        Object.values(pageSections).forEach(section => {
            if (section && !section.classList.contains('hidden')) {
                section.classList.add('hidden');
                section.classList.remove('page-fade-in');
            }
        });

        // Show target
        const targetSection = pageSections[targetPage];
        if (targetSection) {
            targetSection.classList.remove('hidden');
            // Small delay to allow display:block to apply before opacity transition
            setTimeout(() => {
                targetSection.classList.add('page-section', 'page-fade-in');
            }, 10);
        }

        // Handle chat input wrapper visibility
        if (chatInputWrapper) {
            if (targetPage === 'hero' || targetPage === 'chat') {
                chatInputWrapper.classList.remove('hidden');
            } else {
                chatInputWrapper.classList.add('hidden');
            }
        }
        
        // Close mobile menu
        if (window.innerWidth < 1024 && !sidebar.classList.contains('-translate-x-full')) {
            mobileMenuBtn.click();
        }
    };


    // Helper to get auth header
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    if (chatInput && chatSubmit && chatMessages) {
        
        // Plus Dropdown & Modes logic is handled globally below.
        async function fetchResources(messageStr) {
            try {
                const response = await fetch(`http://localhost:5000/api/resources?message=${encodeURIComponent(messageStr)}`);
                const data = await response.json();
                if (data && data.success) {
                    localStorage.setItem('references', JSON.stringify({
                        topic: data.topic,
                        resources: data.resources
                    }));
                    // Instantly update UI if currently viewing the reference tab
                    if (referenceContainer && !referenceContainer.classList.contains('hidden')) {
                        renderReferences();
                    }
                }
            } catch (err) {
                console.error("Failed to fetch references:", err);
            }
        }

        async function sendMessage() {
            const message = chatInput.value.trim();
            if (!message && !window.uploadedFile) return;

            // Trigger background reference fetching
            if (message) fetchResources(message);

            // Clear input
            chatInput.value = '';
            
            // Switch to chat page immediately if not already there
            if (chatMessages.classList.contains('hidden')) {
                window.switchPage('chat');
            }

            // Add User Message to UI
            const userMsgWrapper = document.createElement('div');
            userMsgWrapper.className = 'message user flex justify-end w-full animate-fade-in-up';
            
            let fileHTML = '';
            if (window.uploadedFile) {
                const isImg = window.uploadedFile.type.startsWith('image/');
                const icon = isImg ? '<i class="fa-solid fa-image"></i>' : '<i class="fa-solid fa-file-lines"></i>';
                fileHTML = `<div class="text-xs bg-slate-100/20 text-white px-2 py-1 rounded inline-block mb-1 border border-white/20">${icon} Attached: ${window.uploadedFile.name}</div>`;
            }
            
            userMsgWrapper.innerHTML = `
                <div class="flex flex-col items-end">
                    ${fileHTML}
                    <div class="chat-bubble-user text-white p-5 rounded-3xl rounded-tr-sm max-w-[85%] sm:max-w-[100%]">
                        <p class="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">${message}</p>
                    </div>
                </div>
            `;
            chatMessages.appendChild(userMsgWrapper);
            
            // Auto scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Add Loading State
            const loadingWrapper = document.createElement('div');
            loadingWrapper.className = 'message ai flex justify-start w-full animate-fade-in-up';
            loadingWrapper.innerHTML = `
                <div class="chat-bubble-ai text-white p-5 rounded-3xl rounded-tl-sm max-w-[85%] sm:max-w-[75%] backdrop-blur-md">
                    <p class="font-bold mb-3 text-accent flex items-center gap-2"><div class="w-6 h-6 rounded bg-accent/20 flex items-center justify-center text-xs"><i class="fa-solid fa-bolt"></i></div> NeoLearn AI</p>
                    <div class="flex items-center gap-2 h-6">
                        <span class="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                        <span class="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                        <span class="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                    </div>
                </div>
            `;
            chatMessages.appendChild(loadingWrapper);
            
            // Auto scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Prepare Modified AI Request
            let aiRequestMessage = message;

            try {
                // If there's an uploaded file
                if (window.uploadedFile) {
                    if (window.uploadedFile.type === 'application/pdf') {
                        // Upload PDF and extract text
                        const pdfFormData = new FormData();
                        pdfFormData.append('pdf', window.uploadedFile);
                        
                        // We assume getAuthHeader() is available in scope to attach token if user is logged in
                        const token = localStorage.getItem('token');
                        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                        const uploadRes = await fetch('http://localhost:5000/api/pdf/upload', {
                            method: 'POST',
                            headers: headers,
                            body: pdfFormData
                        });
                        
                        const uploadData = await uploadRes.json();
                        
                        if (uploadData.success && uploadData.text) {
                            // Truncate text if it's too long (e.g., max 15000 characters) to avoid token limits
                            const truncatedText = uploadData.text.length > 15000 
                                ? uploadData.text.substring(0, 15000) + '\n\n... [Content truncated due to length]' 
                                : uploadData.text;
                                
                            aiRequestMessage = `Analyze this PDF and answer the user's question based on the document.\n\nDocument Text:\n${truncatedText}\n\nQuestion: ${aiRequestMessage}`;
                        } else if (uploadData.message && uploadData.message.includes('empty')) {
                            // OCR Fallback: Render PDF to images in browser
                            const arrayBuffer = await window.uploadedFile.arrayBuffer();
                            const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                            
                            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                            const images = [];
                            const numPages = Math.min(pdf.numPages, 3); // Max 3 pages to avoid large payloads
                            
                            for (let i = 1; i <= numPages; i++) {
                                const page = await pdf.getPage(i);
                                const viewport = page.getViewport({ scale: 1.5 });
                                const canvas = document.createElement('canvas');
                                const context = canvas.getContext('2d');
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                await page.render({ canvasContext: context, viewport: viewport }).promise;
                                images.push(canvas.toDataURL('image/jpeg', 0.8));
                            }
                            
                            window.pdfImagesPayload = images;
                            aiRequestMessage = `[User attached a scanned document]\n\nAnalyze the document and answer the user's question: ` + aiRequestMessage;
                        } else {
                            throw new Error(uploadData.message || "Failed to extract PDF text");
                        }
                    } else if (window.uploadedFile.type.startsWith('image/')) {
                        aiRequestMessage = `[User attached an image: ${window.uploadedFile.name}]\n\n` + aiRequestMessage;
                    }
                }

                if (window.chatMode === 'thinking') {
                    aiRequestMessage += "\n\n[INSTRUCTION: Think step-by-step before answering.]";
                } else if (window.chatMode === 'research') {
                    aiRequestMessage += "\n\n[INSTRUCTION: Provide a detailed, structured, research-level answer with examples and explanations.]";
                }

                // Build Context Memory
                window.chatMessagesContext.push({ role: 'user', content: aiRequestMessage });

                let response;
                
                if (window.pdfImagesPayload) {
                    response = await fetch('http://localhost:5000/api/vision/multi', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: aiRequestMessage, images: window.pdfImagesPayload })
                    });
                    delete window.pdfImagesPayload;
                } else if (window.uploadedFile && window.uploadedFile.type.startsWith('image/')) {
                    const formData = new FormData();
                    formData.append('file', window.uploadedFile);
                    formData.append('message', aiRequestMessage);
                    
                    response = await fetch('http://localhost:5000/api/vision', {
                        method: 'POST',
                        body: formData
                    });
                } else {
                    response = await fetch('http://localhost:5000/api/ai/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ message: aiRequestMessage, historyContext: window.chatMessagesContext.slice(0, -1) })
                    });
                }

                
                const data = await response.json();
                
                if (window.removeUploadedFile) window.removeUploadedFile();
                
                // Remove loading
                if (loadingWrapper.parentNode) {
                    chatMessages.removeChild(loadingWrapper);
                }

                if (data.success) {
                    // Add AI Response to UI
                    const aiMsgWrapper = document.createElement('div');
                    aiMsgWrapper.className = 'message ai flex justify-start w-full animate-fade-in-up';
                    aiMsgWrapper.innerHTML = `
                        <div class="chat-bubble-ai text-white p-5 rounded-3xl rounded-tl-sm max-w-[85%] sm:max-w-[80%] backdrop-blur-md leading-relaxed prose prose-invert max-w-none">
                            <p class="font-bold mb-3 text-accent flex items-center gap-2"><div class="w-6 h-6 rounded bg-accent/20 flex items-center justify-center text-xs"><i class="fa-solid fa-bolt"></i></div> NeoLearn AI</p>
                            <div class="whitespace-pre-wrap">${data.data}</div>
                        </div>
                    `;
                    chatMessages.appendChild(aiMsgWrapper);

                    if (window.isVoiceMode && window.speakResponse) {
                        window.speakResponse(data.data);
                    }
                    
                    // Save history memory
                    window.chatMessagesContext.push({ role: 'ai', content: data.data });
                    if (window.saveCurrentChat) window.saveCurrentChat();
                } else {
                    const errorWrapper = document.createElement('div');
                    errorWrapper.className = 'message error flex justify-start w-full animate-fade-in-up';
                    errorWrapper.innerHTML = `
                        <div class="glass-panel border-red-500/30 text-red-400 p-5 rounded-3xl rounded-tl-sm max-w-[85%] sm:max-w-[75%]">
                            <p class="font-bold mb-2 flex items-center gap-2"><div class="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center text-xs"><i class="fa-solid fa-triangle-exclamation"></i></div> Error</p>
                            <p>${data.message || 'Error communicating with AI. Please try again.'}</p>
                        </div>
                    `;
                    chatMessages.appendChild(errorWrapper);
                }
                if (window.isVoiceMode && window.resumeListening) window.resumeListening();
            } catch (error) {
                if (loadingWrapper.parentNode) {
                    chatMessages.removeChild(loadingWrapper);
                }
                const errorWrapper = document.createElement('div');
                errorWrapper.className = 'message error flex justify-start w-full animate-fade-in-up';
                errorWrapper.innerHTML = `
                    <div class="glass-panel border-red-500/30 text-red-400 p-5 rounded-3xl rounded-tl-sm max-w-[85%] sm:max-w-[75%]">
                        <p class="font-bold mb-2 flex items-center gap-2"><div class="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center text-xs"><i class="fa-solid fa-triangle-exclamation"></i></div> Error</p>
                        <p>${error.message || 'Network error connecting to the server. Please make sure the backend is running.'}</p>
                    </div>
                `;
                chatMessages.appendChild(errorWrapper);
                if (window.isVoiceMode && window.resumeListening) window.resumeListening();
            }
            
            // Auto scroll to bottom after response
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        chatSubmit.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // --- Full Voice Assistant & Speech Recognition Logic ---
        window.isVoiceMode = false;
        let isSpeaking = false;
        
        const micBtn = document.getElementById('mic-btn');
        const voiceAssistantBtn = document.getElementById('voice-assistant-btn');
        const voiceAssistantToolbar = document.getElementById('voice-assistant-toolbar');
        const voiceStatusText = document.getElementById('voice-status-text');
        const voiceStatusIcon = document.getElementById('voice-status-icon');
        const voiceWave = document.querySelector('.voice-wave');

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.lang = 'en-IN'; 
            recognition.interimResults = false;
            recognition.continuous = false;

            recognition.onstart = () => {
                if (window.isVoiceMode) {
                    voiceStatusText.textContent = "Listening...";
                    voiceStatusIcon.className = "fa-solid fa-microphone-lines text-primary animate-pulse";
                    voiceWave.classList.remove('speaking', 'paused');
                } else if (micBtn) {
                    micBtn.classList.add('listening');
                    chatInput.placeholder = "Listening...";
                }
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                chatInput.value = transcript;
                sendMessage(); 
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                if (event.error !== 'no-speech' && !window.isVoiceMode) {
                    alert("Speech recognition error: " + event.error);
                }
                resetMicUI();
                
                if (window.isVoiceMode && event.error === 'no-speech') {
                    // Try to re-engage if no speech occurred
                    window.resumeListening();
                } else if (window.isVoiceMode) {
                    stopVoiceAssistantMode();
                }
            };

            recognition.onend = () => {
                resetMicUI();
                if (window.isVoiceMode && !isSpeaking) {
                    // Only resume if we are not busy speaking
                    window.resumeListening();
                }
            };
        }

        function resetMicUI() {
            if (micBtn) micBtn.classList.remove('listening');
            if (!window.isVoiceMode && chatInput) {
                chatInput.placeholder = "Ask anything...";
            }
            if (window.isVoiceMode && voiceWave) {
                voiceWave.classList.add('paused');
            }
        }
        
        // Expose resume helper
        window.resumeListening = () => {
            if (window.isVoiceMode && recognition && !isSpeaking) {
                setTimeout(() => {
                    try { recognition.start(); } catch(e) {}
                }, 300);
            }
        };

        // Single shot mic button
        if (micBtn && recognition) {
            micBtn.addEventListener("click", () => {
                if (window.isVoiceMode) return; // Prevent interference
                if (micBtn.classList.contains('listening')) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            });
        } else if (micBtn) {
            micBtn.addEventListener("click", () => alert("Speech recognition not supported."));
        }

        // --- Continuous Voice Assistant Mode Logic ---
        window.speakResponse = function(text) {
            if (!window.speechSynthesis || !window.isVoiceMode) return;
            
            // Chrome TTS bug workaround: cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const cleanText = text.replace(/[*_#`]/g, '');
            // Split text by punctuation or newlines to prevent the 15-second TTS freeze bug
            const sentences = cleanText.replace(/([.!?\n])\s+/g, "$1|").split("|").filter(s => s.trim().length > 0);
            
            if (sentences.length === 0) return;

            let currentSentenceIndex = 0;
            isSpeaking = true;

            if (recognition) {
                try { recognition.stop(); } catch(e) {}
            }
            if (voiceStatusText) voiceStatusText.textContent = "AI is speaking...";
            if (voiceStatusIcon) voiceStatusIcon.className = "fa-solid fa-robot text-emerald-500 animate-bounce";
            if (voiceWave) {
                voiceWave.classList.add('speaking');
                voiceWave.classList.remove('paused');
            }

            const speakNextSentence = () => {
                if (currentSentenceIndex >= sentences.length || !window.isVoiceMode) {
                    isSpeaking = false;
                    window.resumeListening();
                    return;
                }

                const utteranceText = sentences[currentSentenceIndex].trim();
                if (!utteranceText) {
                    currentSentenceIndex++;
                    return speakNextSentence();
                }

                const speech = new SpeechSynthesisUtterance(utteranceText);
                
                speech.onend = () => {
                    currentSentenceIndex++;
                    speakNextSentence();
                };
                
                speech.onerror = (e) => {
                    console.error("Speech error", e);
                    currentSentenceIndex++;
                    speakNextSentence();
                };

                window.speechSynthesis.speak(speech);
            };

            speakNextSentence();
        };

        function startVoiceAssistantMode() {
            if (!recognition) {
                alert("Speech recognition is not supported in this browser.");
                return;
            }
            window.isVoiceMode = true;
            isSpeaking = false;
            
            if (voiceAssistantToolbar) voiceAssistantToolbar.classList.remove('hidden');
            if (voiceAssistantBtn) {
                voiceAssistantBtn.classList.add('from-red-500', 'to-red-600', 'hover:from-red-600', 'hover:to-red-700');
                voiceAssistantBtn.classList.remove('from-blue-500', 'to-indigo-600', 'hover:from-blue-600', 'hover:to-indigo-700');
                const btnSpan = voiceAssistantBtn.querySelector('span');
                if (btnSpan) btnSpan.textContent = 'Stop Voice Assistant';
                const btnIcon = voiceAssistantBtn.querySelector('i');
                if (btnIcon) btnIcon.className = 'fa-solid fa-stop-circle group-hover:scale-110 transition-transform';
            }
            
            chatInput.placeholder = "Voice Assistant Active (Listening)...";
            chatInput.disabled = true;
            if (micBtn) micBtn.disabled = true;
            
            window.resumeListening();
        }

        function stopVoiceAssistantMode() {
            window.isVoiceMode = false;
            isSpeaking = false;
            
            if (recognition) {
                try { recognition.stop(); } catch(e) {}
            }
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            
            if (voiceAssistantToolbar) voiceAssistantToolbar.classList.add('hidden');
            if (voiceAssistantBtn) {
                voiceAssistantBtn.classList.remove('from-red-500', 'to-red-600', 'hover:from-red-600', 'hover:to-red-700');
                voiceAssistantBtn.classList.add('from-blue-500', 'to-indigo-600', 'hover:from-blue-600', 'hover:to-indigo-700');
                const btnSpan = voiceAssistantBtn.querySelector('span');
                if (btnSpan) btnSpan.textContent = 'Voice Assistant';
                const btnIcon = voiceAssistantBtn.querySelector('i');
                if (btnIcon) btnIcon.className = 'fa-solid fa-satellite-dish group-hover:scale-110 transition-transform';
            }
            
            chatInput.placeholder = "Ask anything...";
            chatInput.disabled = false;
            if (micBtn) micBtn.disabled = false;
        }

        if (voiceAssistantBtn) {
            voiceAssistantBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.isVoiceMode) {
                    stopVoiceAssistantMode();
                } else {
                    startVoiceAssistantMode();
                }
            });
        }

        // New Chat Functionality
        const newChatBtn = document.getElementById('new-chat-btn');
        
        function startNewChat() {
            // Only perform if there are messages
            if (chatMessages.innerHTML.trim() === '') {
                window.switchPage('hero');
                return;
            }

            window.currentChatId = null;
            window.chatMessagesContext = [];

            // Clear local storage reference
            localStorage.removeItem('references');

            // 1. Smooth fade out of chat messages
            chatMessages.classList.add('page-fade-out');

            setTimeout(() => {
                // 2. Clear chat container
                chatMessages.innerHTML = '';
                chatMessages.classList.remove('page-fade-out');
                
                // 3. Clear stored state (input value)
                chatInput.value = '';
                chatMessages.scrollTop = 0;

                // 4. Show initial UI (Hero Section)
                window.switchPage('hero');
            }, 300); // Wait for fade out to complete
        }

        if (newChatBtn) {
            newChatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                startNewChat();
            });
        }

        // Smart Action Cards from Hero Section
        const actionExplain = document.getElementById('action-explain-topic');
        const actionRoadmap = document.getElementById('action-learning-roadmap');
        const actionATS = document.getElementById('action-ats-analyzer');

        if (actionExplain) {
            actionExplain.addEventListener('click', () => {
                chatInput.value = 'Explain Quantum Computing to me like I am 5';
                chatSubmit.click();
            });
        }
        
        if (actionRoadmap) {
            actionRoadmap.addEventListener('click', () => {
                chatInput.value = 'Generate a 3-month roadmap for learning Full Stack Web Development';
                chatSubmit.click();
            });
        }
        
        if (actionATS && atsTab) {
            actionATS.addEventListener('click', () => {
                atsTab.click();
            });
        }
        
        // --- Reference Tab Logic ---
        function renderReferences() {
            if (!referenceGrid || !refTopicLabel) return;
            
            const storedRefs = JSON.parse(localStorage.getItem('references'));
            referenceGrid.innerHTML = ''; // clear previous
            
            if (storedRefs && storedRefs.resources && storedRefs.resources.length > 0) {
                refTopicLabel.textContent = storedRefs.topic.toUpperCase();
                
                storedRefs.resources.forEach(res => {
                    const iconClass = res.type === 'youtube' ? 'fa-brands fa-youtube text-red-500' : 'fa-solid fa-link text-blue-500';
                    
                    const card = document.createElement('a');
                    card.href = res.url;
                    card.target = '_blank';
                    card.className = 'reference-card bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-slate-600 transition-all flex flex-col gap-3 group block';
                    
                    card.innerHTML = `
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                <i class="${iconClass}"></i>
                            </div>
                            <div class="font-semibold text-slate-800 dark:text-white line-clamp-1 flex-1">${res.title}</div>
                        </div>
                        <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">${res.description || res.platform}</p>
                        <div class="mt-auto pt-2 text-xs font-medium text-primary flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            View Resource <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                        </div>
                    `;
                    referenceGrid.appendChild(card);
                });
            } else {
                refTopicLabel.textContent = 'None';
                referenceGrid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-500 dark:text-slate-400"><i class="fa-solid fa-folder-open text-3xl mb-3 opacity-50 block"></i>No resources found for this topic yet. Try searching something first!</div>`;
            }
        }

        if (aiTutorTab && referenceTab && atsTab) {
            aiTutorTab.addEventListener('click', (e) => {
                e.preventDefault();
                if (chatMessages.innerHTML.trim() !== '') {
                    window.switchPage('chat');
                } else {
                    window.switchPage('hero');
                }
            });

            referenceTab.addEventListener('click', (e) => {
                e.preventDefault();
                window.switchPage('reference');
                renderReferences();
            });

            atsTab.addEventListener('click', (e) => {
                e.preventDefault();
                window.switchPage('ats');
            });

            if (profileTab && profileContainer) {
                profileTab.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.switchPage('profile');
                    loadUserProfile();
                });
            }
        }
        
        // --- ATS Resume Checker Logic ---
        let atsSelectedFile = null;
        const atsUploadArea = document.getElementById('ats-upload-area');
        const atsFileInput = document.getElementById('ats-file-input');
        const atsAnalyzeBtn = document.getElementById('ats-analyze-btn');
        const atsFilename = document.getElementById('ats-filename');
        const atsSelectedFileDiv = document.getElementById('ats-selected-file');
        const atsLoading = document.getElementById('ats-loading');
        const atsResult = document.getElementById('ats-result');

        if (atsUploadArea && atsFileInput) {
            // Drag and Drop
            atsUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                atsUploadArea.classList.add('border-primary', 'bg-blue-50', 'dark:bg-slate-700');
            });
            atsUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                atsUploadArea.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-slate-700');
            });
            atsUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                atsUploadArea.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-slate-700');
                if (e.dataTransfer.files.length) {
                    handleAtsFileSelection(e.dataTransfer.files[0]);
                }
            });

            // File Input Change
            atsFileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    handleAtsFileSelection(e.target.files[0]);
                }
            });

            function handleAtsFileSelection(file) {
                const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
                    window.showToast('Please upload a valid PDF or DOCX file.', 'error');
                    return;
                }
                atsSelectedFile = file;
                atsFilename.textContent = file.name;
                atsSelectedFileDiv.classList.remove('hidden');
                atsAnalyzeBtn.disabled = false;
                atsResult.classList.add('hidden'); // Hide previous results if any
            }

            atsAnalyzeBtn.addEventListener('click', async () => {
                if (!atsSelectedFile) return;

                atsAnalyzeBtn.disabled = true;
                atsLoading.classList.remove('hidden');
                atsResult.classList.add('hidden');

                const formData = new FormData();
                formData.append('resume', atsSelectedFile);

                try {
                    const headers = getAuthHeader();
                    const response = await fetch('http://localhost:5000/api/ats/analyze', {
                        method: 'POST',
                        headers: headers,
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        displayATSResults(data);
                    } else {
                        showError(data.message || 'Error analyzing resume.');
                    }
                } catch (err) {
                    console.error('ATS Error:', err);
                    showError('Failed to connect to the server. Is the backend running?');
                } finally {
                    atsLoading.classList.add('hidden');
                }
            });

            function showError(msg) {
                window.showToast(msg, 'error');
                atsAnalyzeBtn.disabled = false;
            }

            function displayATSResults(data) {
                // Score
                const scoreValue = document.getElementById('ats-score-value');
                const scoreMessage = document.getElementById('ats-score-message');
                
                scoreValue.textContent = data.score;
                if (data.score >= 80) {
                    scoreValue.className = 'text-emerald-500';
                    scoreMessage.textContent = 'Excellent! Your resume is highly ATS-friendly.';
                } else if (data.score >= 60) {
                    scoreValue.className = 'text-yellow-500';
                    scoreMessage.textContent = 'Good, but there is room for improvement.';
                } else {
                    scoreValue.className = 'text-red-500';
                    scoreMessage.textContent = 'Needs significant improvement to pass ATS filters.';
                }

                // Keywords
                const keywordsList = document.getElementById('ats-keywords-list');
                keywordsList.innerHTML = '';
                if (data.keywords && data.keywords.length > 0) {
                    data.keywords.forEach(kw => {
                        keywordsList.innerHTML += `<li><i class="fa-solid fa-check text-emerald-500 mr-2"></i> Found: <span class="font-semibold">${kw}</span></li>`;
                    });
                } else {
                    keywordsList.innerHTML = '<li><i class="fa-solid fa-xmark text-red-500 mr-2"></i> No key standard sections (Skills, Experience, Education) clearly identified.</li>';
                }

                // Formatting
                const formatList = document.getElementById('ats-formatting-list');
                formatList.innerHTML = '';
                if (data.formattingIssues && data.formattingIssues.length > 0) {
                    data.formattingIssues.forEach(issue => {
                        formatList.innerHTML += `<li>${issue}</li>`;
                    });
                } else {
                    formatList.innerHTML = '<li class="text-emerald-600 dark:text-emerald-400">No major formatting issues detected.</li>';
                }

                // Grammar
                const grammarList = document.getElementById('ats-grammar-list');
                grammarList.innerHTML = '';
                if (data.grammarIssues && data.grammarIssues.length > 0) {
                    data.grammarIssues.forEach(issue => {
                        grammarList.innerHTML += `<li>${issue}</li>`;
                    });
                } else {
                    grammarList.innerHTML = '<li class="text-emerald-600 dark:text-emerald-400">No major spelling or grammar issues detected.</li>';
                }

                // Suggestions
                const suggestionsContent = document.getElementById('ats-suggestions-content');
                suggestionsContent.innerHTML = '';
                if (data.suggestions && data.suggestions.length > 0) {
                    data.suggestions.forEach(suggestion => {
                        suggestionsContent.innerHTML += `<li>${suggestion}</li>`;
                    });
                } else {
                    suggestionsContent.innerHTML = '<li>No further suggestions.</li>';
                }

                atsResult.classList.remove('hidden');
                atsAnalyzeBtn.disabled = false;
                
                // Auto-fetch internships based on found keywords
                if (data.keywords && data.keywords.length > 0) {
                    const topKeyword = data.keywords[0];
                    document.getElementById('internship-domain-input').value = topKeyword;
                    fetchInternships(topKeyword);
                } else {
                    fetchInternships('technology'); // fallback
                }
            }
        }

        // --- Plus Dropdown & Modes Logic ---
        window.chatMode = "normal"; // "normal", "thinking", "research"
        window.uploadedFile = null;

        const plusBtn = document.getElementById('plus-btn');
        const plusIcon = document.getElementById('plus-icon');
        const plusDropdown = document.getElementById('plus-dropdown');
        const fileUploadInput = document.getElementById('file-upload-input');
        const activeModeContainer = document.getElementById('active-mode-container');

        if (plusBtn && plusDropdown) {
            plusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDropdown();
            });

            document.addEventListener('click', (e) => {
                if (!plusDropdown.contains(e.target) && !plusBtn.contains(e.target)) {
                    closeDropdown();
                }
            });

            const actionBtns = document.querySelectorAll('.dropdown-action-btn');
            actionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = btn.getAttribute('data-action');
                    handleDropdownAction(action);
                    closeDropdown();
                });
            });
        }

        function toggleDropdown() {
            const isOpen = !plusDropdown.classList.contains('hidden');
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }

        function openDropdown() {
            plusDropdown.classList.remove('hidden');
            setTimeout(() => {
                plusDropdown.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
                if (plusIcon) plusIcon.classList.add('rotate-45');
            }, 10);
        }

        function closeDropdown() {
            plusDropdown.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            if (plusIcon) plusIcon.classList.remove('rotate-45');
            setTimeout(() => {
                plusDropdown.classList.add('hidden');
            }, 200);
        }

        function handleDropdownAction(action) {
            if (action === 'upload') {
                if (fileUploadInput) fileUploadInput.click();
            } else if (action === 'thinking') {
                window.chatMode = (window.chatMode === 'thinking') ? 'normal' : 'thinking';
                updateActiveModeUI();
            } else if (action === 'research') {
                window.chatMode = (window.chatMode === 'research') ? 'normal' : 'research';
                updateActiveModeUI();
            }
        }

        if (fileUploadInput) {
            fileUploadInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    window.uploadedFile = file;
                    updateActiveModeUI();
                } catch(error) {
                    window.uploadedFile = file;
                    updateActiveModeUI();
                }
                
                e.target.value = '';
            });
        }

        window.removeUploadedFile = function() {
             window.uploadedFile = null;
             updateActiveModeUI();
        }

        function updateActiveModeUI() {
            if (!activeModeContainer) return;
            activeModeContainer.innerHTML = '';
            let hasContent = false;

            if (window.chatMode === 'thinking') {
                activeModeContainer.innerHTML += `
                    <div class="flex items-center gap-2 px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-lg text-sm font-medium shadow-sm animate-fade-in-up">
                        <i class="fa-solid fa-brain"></i> Thinking Mode Active
                        <button onclick="window.chatMode='normal'; window.updateActiveModeUI();" class="hover:text-red-500 ml-1 transition-colors"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                `;
                hasContent = true;
            } else if (window.chatMode === 'research') {
                activeModeContainer.innerHTML += `
                    <div class="flex items-center gap-2 px-3 py-1 bg-orange-500/20 text-orange-500 border border-orange-500/30 rounded-lg text-sm font-medium shadow-sm animate-fade-in-up">
                        <i class="fa-solid fa-magnifying-glass-chart"></i> Deep Research Active
                        <button onclick="window.chatMode='normal'; window.updateActiveModeUI();" class="hover:text-red-500 ml-1 transition-colors"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                `;
                hasContent = true;
            }

            if (window.uploadedFile) {
                let isImg = window.uploadedFile.type.startsWith('image/');
                const iconOrImage = isImg ? '<i class="fa-solid fa-image"></i>' : '<i class="fa-solid fa-file-lines"></i>';
                
                activeModeContainer.innerHTML += `
                    <div class="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-medium shadow-sm animate-fade-in-up">
                        <div class="text-primary">${iconOrImage}</div>
                        <span class="max-w-[150px] truncate">${window.uploadedFile.name}</span>
                        <button onclick="window.removeUploadedFile()" class="ml-1 text-slate-400 hover:text-red-500 transition-colors focus:outline-none">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                `;
                hasContent = true;
            }

            if (hasContent) {
                activeModeContainer.classList.remove('hidden');
            } else {
                activeModeContainer.classList.add('hidden');
            }
        }
        window.updateActiveModeUI = updateActiveModeUI;
        // --- Chat History System Logic ---
        window.saveCurrentChat = async function() {
            try {
                const headers = { 'Content-Type': 'application/json', ...getAuthHeader() };
                const response = await fetch('http://localhost:5000/api/chat/save', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ 
                        userId: window.neoUserId, 
                        id: window.currentChatId, 
                        messages: window.chatMessagesContext 
                    })
                });
                const data = await response.json();
                if (data.success && data.chat) {
                    const isNew = !window.currentChatId;
                    window.currentChatId = data.chat._id;
                    if (isNew && window.loadHistorySidebar) window.loadHistorySidebar();
                }
            } catch(err) { console.error("History save failed:", err); }
        };

        window.loadHistorySidebar = async function() {
            const historyPanel = document.getElementById('history-panel');
            if (!historyPanel) return;
            try {
                const response = await fetch(`http://localhost:5000/api/chat/${window.neoUserId}`);
                const data = await response.json();
                if (data.success && data.chats.length > 0) {
                    historyPanel.innerHTML = '';
                    data.chats.forEach(chat => {
                        const div = document.createElement('div');
                        div.className = 'text-sm text-slate-500 py-1.5 w-full flex justify-between items-center group';
                        
                        const titleSpan = document.createElement('span');
                        titleSpan.className = 'truncate pr-2 cursor-pointer hover:text-primary dark:hover:text-blue-400 transition-colors flex-1';
                        titleSpan.textContent = chat.title || 'Conversation';
                        titleSpan.onclick = () => window.loadChatSession(chat._id);
                        
                        const delBtn = document.createElement('button');
                        delBtn.className = 'text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 focus:outline-none';
                        delBtn.innerHTML = '<i class="fa-solid fa-trash text-xs"></i>';
                        delBtn.onclick = (e) => {
                            e.stopPropagation();
                            window.deleteChat(chat._id, div);
                        };
                        
                        div.appendChild(titleSpan);
                        div.appendChild(delBtn);
                        historyPanel.appendChild(div);
                    });

                    if (localStorage.getItem('token')) {
                        const clearBtn = document.createElement('button');
                        clearBtn.className = 'mt-3 text-xs text-red-500 hover:text-red-700 font-medium text-left flex items-center gap-1 py-1 transition-colors w-full focus:outline-none';
                        clearBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Clear All History';
                        clearBtn.onclick = () => window.clearAllHistory();
                        historyPanel.appendChild(clearBtn);
                    }
                } else {
                    historyPanel.innerHTML = '<div class="text-xs text-slate-400 py-2 italic w-full text-left">No past histories found.</div>';
                }
            } catch (err) {
                 historyPanel.innerHTML = '<div class="text-xs text-red-400 py-2 italic w-full text-left">Error loading history.</div>';
            }
        };

        window.deleteChat = async function(id, element) {
            if (!confirm('Are you sure you want to delete this chat?')) return;
            
            try {
                const headers = getAuthHeader();
                const response = await fetch(`http://localhost:5000/api/chat/${id}`, {
                    method: 'DELETE',
                    headers: headers
                });
                
                const data = await response.json();
                if (data.success) {
                    element.classList.add('opacity-0', 'scale-95', 'transition-all', 'duration-300');
                    setTimeout(() => {
                        element.remove();
                        const historyPanel = document.getElementById('history-panel');
                        if (historyPanel && historyPanel.querySelectorAll('div.group').length === 0) {
                            window.loadHistorySidebar();
                        }
                    }, 300);
                    
                    if (window.currentChatId === id) {
                        startNewChat();
                    }
                } else {
                    alert('Error deleting chat: ' + data.message);
                }
            } catch (error) {
                console.error('Delete chat error:', error);
                alert('Network error deleting chat.');
            }
        };

        window.clearAllHistory = async function() {
            if (!confirm('Are you absolutely sure you want to clear ALL your chat history? This cannot be undone.')) return;
            
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('You must be logged in to clear all history.');
                return;
            }

            try {
                const headers = getAuthHeader();
                const response = await fetch(`http://localhost:5000/api/chat/user/${userId}`, {
                    method: 'DELETE',
                    headers: headers
                });
                
                const data = await response.json();
                if (data.success) {
                    window.loadHistorySidebar();
                    startNewChat();
                } else {
                    alert('Error clearing history: ' + data.message);
                }
            } catch (error) {
                console.error('Clear history error:', error);
                alert('Network error clearing history.');
            }
        };

        window.loadChatSession = async function(id) {
            try {
                const response = await fetch(`http://localhost:5000/api/chat/session/${id}`);
                const data = await response.json();
                if (data.success && data.chat) {
                    window.currentChatId = data.chat._id;
                    window.chatMessagesContext = data.chat.messages || [];
                    
                    chatMessages.innerHTML = '';
                    window.switchPage('chat');
                    
                    window.chatMessagesContext.forEach(msg => {
                        if (msg.role === 'user') {
                            chatMessages.innerHTML += `
                                <div class="message user flex justify-end w-full animate-fade-in-up">
                                    <div class="flex flex-col items-end">
                                        <div class="bg-primary text-white p-4 rounded-2xl rounded-tr-sm max-w-[85%] sm:max-w-[100%] shadow-sm">
                                            <p class="whitespace-pre-wrap">${msg.content}</p>
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else if (msg.role === 'ai') {
                             chatMessages.innerHTML += `
                                <div class="message ai flex justify-start w-full animate-fade-in-up">
                                    <div class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-4 rounded-2xl rounded-tl-sm max-w-[85%] sm:max-w-[75%] border border-gray-100 dark:border-slate-700 shadow-sm leading-relaxed">
                                        <p class="font-medium mb-2 text-emerald-500 flex items-center"><i class="fa-solid fa-robot mr-2"></i>NeoLearn</p>
                                        <div class="whitespace-pre-wrap">${msg.content}</div>
                                    </div>
                                </div>
                            `;
                        }
                    });
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    if (window.innerWidth < 1024 && document.getElementById('mobile-menu-btn')) document.getElementById('mobile-menu-btn').click();
                }
            } catch (err) { console.error('Failed restoring chat:', err); }
        };

        const historyTab = document.getElementById('history-tab');
        if (historyTab) {
            historyTab.addEventListener('click', (e) => {
                e.preventDefault();
                const panel = document.getElementById('history-panel');
                const chev = document.getElementById('history-chevron');
                if (panel.classList.contains('hidden')) {
                    panel.classList.remove('hidden');
                    panel.classList.add('flex');
                    if(chev) chev.classList.add('rotate-180');
                    if(window.loadHistorySidebar) window.loadHistorySidebar();
                } else {
                    panel.classList.add('hidden');
                    panel.classList.remove('flex');
                    if(chev) chev.classList.remove('rotate-180');
                }
            });
        }

        // --- Internship Finder Logic ---
        const internshipSearchBtn = document.getElementById('search-internships-btn');
        const internshipInput = document.getElementById('internship-domain-input');
        
        if (internshipSearchBtn && internshipInput) {
            internshipSearchBtn.addEventListener('click', () => {
                const domain = internshipInput.value.trim();
                if (domain) {
                    fetchInternships(domain);
                }
            });
            
            internshipInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const domain = internshipInput.value.trim();
                    if (domain) {
                        fetchInternships(domain);
                    }
                }
            });
        }
        
        async function fetchInternships(domain) {
            const grid = document.getElementById('internship-grid');
            const loading = document.getElementById('internship-loading');
            const empty = document.getElementById('internship-empty');
            const btn = document.getElementById('search-internships-btn');
            
            if (!grid || !loading || !empty || !btn) return;
            
            grid.innerHTML = '';
            grid.classList.add('hidden');
            empty.classList.add('hidden');
            loading.classList.remove('hidden');
            btn.disabled = true;
            
            try {
                const headers = getAuthHeader();
                const response = await fetch(`http://localhost:5000/api/internships?domain=${encodeURIComponent(domain)}`, {
                    headers: headers
                });
                const data = await response.json();
                
                loading.classList.add('hidden');
                btn.disabled = false;
                
                if (data.success && data.internships && data.internships.length > 0) {
                    displayInternships(data.internships);
                } else {
                    empty.classList.remove('hidden');
                }
            } catch (err) {
                console.error('Error fetching internships:', err);
                loading.classList.add('hidden');
                btn.disabled = false;
                empty.classList.remove('hidden');
                empty.querySelector('h3').textContent = 'Error connecting to server';
                empty.querySelector('p').textContent = 'Please try again later.';
            }
        }
        
        function displayInternships(internships) {
            const grid = document.getElementById('internship-grid');
            grid.innerHTML = '';
            
            internships.forEach(intern => {
                grid.innerHTML += `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-1">${intern.title}</h3>
                            <p class="text-primary font-medium mb-3">${intern.company}</p>
                            
                            <div class="grid grid-cols-2 gap-3 mb-4 text-sm text-slate-600 dark:text-slate-300">
                                <div class="flex items-center gap-2">
                                    <i class="fa-solid fa-location-dot text-slate-400"></i>
                                    <span>${intern.location}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fa-solid fa-money-bill-wave text-slate-400"></i>
                                    <span>${intern.stipend}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="fa-regular fa-clock text-slate-400"></i>
                                    <span>${intern.duration}</span>
                                </div>
                            </div>
                            
                            <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                                ${intern.description}
                            </p>
                        </div>
                        <a href="${intern.applyLink}" target="_blank" class="w-full text-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold py-2.5 rounded-lg transition-colors mt-auto inline-block">
                            Apply Now
                        </a>
                    </div>
                `;
            });
            
            grid.classList.remove('hidden');
        }

        // --- Profile Authentication and Loading Logic ---
        function checkAuthState() {
            const token = localStorage.getItem('token');
            const userName = localStorage.getItem('userName') || 'User';
            const userId = localStorage.getItem('userId');
            
            if (token && authButtonsContainer && userInfoContainer) {
                authButtonsContainer.classList.add('hidden');
                userInfoContainer.classList.remove('hidden');
                document.getElementById('sidebar-user-name').textContent = userName;
                document.getElementById('sidebar-user-avatar').textContent = userName.charAt(0).toUpperCase();
                
                if (userId) {
                    window.neoUserId = userId;
                }
            } else if (authButtonsContainer && userInfoContainer) {
                authButtonsContainer.classList.remove('hidden');
                userInfoContainer.classList.add('hidden');
                window.neoUserId = localStorage.getItem('neo_user_id');
            }
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                localStorage.removeItem('userId');
                localStorage.removeItem('user');
                checkAuthState();
                if (profileContainer && !profileContainer.classList.contains('hidden')) {
                    loadUserProfile();
                }
                alert('Logged out successfully.');
            });
        }

        async function loadUserProfile() {
            const token = localStorage.getItem('token');
            const notLoggedIn = document.getElementById('profile-not-logged-in');
            const content = document.getElementById('profile-content');
            const loading = document.getElementById('profile-loading');
            const header = document.querySelector('.bg-white.dark\\:bg-slate-800.rounded-3xl.p-8.shadow-sm'); // The profile header

            if (!token) {
                if(header) header.classList.add('hidden');
                if(content) content.classList.add('hidden');
                if(loading) loading.classList.add('hidden');
                if(notLoggedIn) notLoggedIn.classList.remove('hidden');
                return;
            }

            if(header) header.classList.remove('hidden');
            if(notLoggedIn) notLoggedIn.classList.add('hidden');
            if(content) content.classList.add('hidden');
            if(loading) loading.classList.remove('hidden');

            try {
                // Fetch User Profile
                const profileRes = await fetch('http://localhost:5000/api/user/profile', { headers: getAuthHeader() });
                const profileData = await profileRes.json();

                if (profileData.success) {
                    const u = profileData.user;
                    document.getElementById('profile-name').textContent = u.name;
                    document.getElementById('profile-email').textContent = u.email;
                    document.getElementById('profile-avatar').innerHTML = u.name.charAt(0).toUpperCase();
                    document.getElementById('profile-join-date').textContent = new Date(u.createdAt).toLocaleDateString();
                    
                    document.getElementById('stat-chats').textContent = u.stats.totalChats;
                    document.getElementById('stat-ats').textContent = u.stats.totalAts;
                    document.getElementById('stat-internships').textContent = u.stats.totalInternshipSearches;
                }

                // Fetch ATS Reports
                const atsRes = await fetch('http://localhost:5000/api/user/ats', { headers: getAuthHeader() });
                const atsData = await atsRes.json();
                const atsList = document.getElementById('profile-ats-list');
                atsList.innerHTML = '';
                if (atsData.success && atsData.reports.length > 0) {
                    atsData.reports.forEach(r => {
                        let color = r.score >= 80 ? 'emerald' : (r.score >= 60 ? 'yellow' : 'red');
                        atsList.innerHTML += `
                            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600">
                                <div>
                                    <div class="font-semibold text-slate-800 dark:text-white text-sm">${r.fileName}</div>
                                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">${new Date(r.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div class="text-${color}-500 font-bold text-lg">${r.score}/100</div>
                            </div>
                        `;
                    });
                } else {
                    atsList.innerHTML = '<div class="text-center py-4 text-slate-500 text-sm">No ATS scans yet.</div>';
                }

                // Fetch Internships
                const intRes = await fetch('http://localhost:5000/api/user/internships', { headers: getAuthHeader() });
                const intData = await intRes.json();
                const intList = document.getElementById('profile-internships-list');
                intList.innerHTML = '';
                if (intData.success && intData.searches.length > 0) {
                    intData.searches.forEach(s => {
                        intList.innerHTML += `
                            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600">
                                <div>
                                    <div class="font-semibold text-slate-800 dark:text-white text-sm capitalize">${s.domain}</div>
                                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">${new Date(s.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div class="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded text-xs font-bold">${s.resultsCount} found</div>
                            </div>
                        `;
                    });
                } else {
                    intList.innerHTML = '<div class="text-center py-4 text-slate-500 text-sm">No searches yet.</div>';
                }

                loading.classList.add('hidden');
                content.classList.remove('hidden');
            } catch (err) {
                console.error("Failed to load profile:", err);
                loading.innerHTML = '<div class="text-red-500">Failed to load profile data.</div>';
            }
        }

        // Initialize auth state
        checkAuthState();
    }
});
