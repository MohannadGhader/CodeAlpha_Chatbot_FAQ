// 1. DATASET: Your "Source of Truth"
const faqDatabase = [
    { 
        intent: "submission", 
        keywords: ["submit", "upload", "form", "send", "link", "submitting", "task", "tasks"],
        answer: "To submit your task, upload the code to GitHub, post a video on LinkedIn tagging @CodeAlpha, and complete the official Google Form." 
    },
    { 
        intent: "duration", 
        keywords: ["long", "time", "duration", "weeks", "month", "period", "stay"],
        answer: "The CodeAlpha internship typically spans 4 to 8 weeks, allowing enough time to complete all 4 domain tasks." 
    },
    { 
        intent: "certificate", 
        keywords: ["certificate", "verified", "completion", "get", "award", "certify"],
        answer: "Yes, you will receive a verified certificate after your tasks are reviewed and approved by the CodeAlpha mentors." 
    }
];

// 2. NLP PREPROCESSING
function nlpPreprocess(text) {
    const stopWords = ['is', 'the', 'a', 'an', 'and', 'how', 'do', 'i', 'to', 'at', 'can', 'you', 'what', 'for', 'of'];
    let tokens = text.toLowerCase()
                     .replace(/[^\w\s]/gi, '')
                     .split(/\s+/)
                     .filter(word => !stopWords.includes(word) && word.length > 1);
    
    console.log("NLP Tokens Generated:", tokens);
    return tokens;
}

// 3. INTENT MATCHING & IMPROVED CONVERSATION
function findBestFAQ(userInput) {
    const lowInput = userInput.toLowerCase();

    // --- A. Handle Greetings ---
    if (lowInput.match(/^(hi|hello|hey|greetings)/)) {
        return "Hello! I'm doing great. How are things going with your internship tasks today?";
    }
    
    // --- B. Handle "How are you" ---
    if (lowInput.includes("how are you")) {
        return "I'm functioning perfectly! Thank you for asking. How are you feeling today?";
    }

    // --- C. Handle User Mood (The Fix for "I'm fine") ---
    const positiveMoods = ["fine", "good", "great", "well", "happy", "excellent", "ok"];
    const negativeMoods = ["bad", "tired", "sad", "struggling", "hard", "difficult"];

    if (positiveMoods.some(mood => lowInput.includes(mood))) {
        return "That's wonderful to hear! Since you're doing well, would you like to check some FAQs about the internship?";
    }
    if (negativeMoods.some(mood => lowInput.includes(mood))) {
        return "I'm sorry to hear that. Coding can be tough! Maybe I can help clear things up? Here are some FAQs you might find useful:";
    }

    // --- D. Handle FAQ Matching ---
    const userTokens = nlpPreprocess(userInput);
    if (userTokens.length === 0) return "I'm here to help! Please choose a topic below to learn more about the CodeAlpha internship.";

    let bestMatch = null;
    let highestScore = 0;

    faqDatabase.forEach(item => {
        let score = 0;
        userTokens.forEach(token => {
            if (item.keywords.includes(token)) score += 1;
        });

        const finalScore = score / Math.max(userTokens.length, 1);
        if (finalScore > highestScore) {
            highestScore = finalScore;
            bestMatch = item;
        }
    });

    // If we find a match, give the answer. If not, give a polite "guide" response.
    return highestScore > 0.2 ? bestMatch.answer : "I'm not quite sure about that specific question, but I can definitely help you with these topics below:";
}

// 4. UI CONTROLLER
const chatBox = document.getElementById('chat-box');
const inputField = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}

function showOptions() {
    // Check if options already exist to avoid duplicates
    if (document.querySelector('.options-container')) return;

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    const choices = [
        { label: "📜 Task Submission", query: "How do I submit my tasks?" },
        { label: "⏳ Internship Duration", query: "How long is the internship?" },
        { label: "🎓 Certificates", query: "Will I get a certificate?" }
    ];

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = choice.label;
        btn.onclick = () => {
            inputField.value = choice.query;
            handleChat();
            optionsContainer.remove(); 
        };
        optionsContainer.appendChild(btn);
    });

    chatBox.appendChild(optionsContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleChat() {
    const text = inputField.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    inputField.value = '';

    const botMsg = appendMessage("Processing...", 'bot');
    botMsg.classList.add('typing-effect');

    setTimeout(() => {
        const response = findBestFAQ(text);
        botMsg.innerText = response;
        botMsg.classList.remove('typing-effect');
        
        // Always show options if it's a "guide" response or small talk follow-up
        if (response.includes("below") || response.includes("wonderful") || response.includes("help clear")) {
            showOptions();
        }
    }, 800);
}

// 5. EVENT LISTENERS
sendBtn.addEventListener('click', handleChat);
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat();
});

// Initial Welcome
window.onload = () => {
    setTimeout(() => {
        appendMessage("Hi Mohannad! I'm your CodeAlpha Assistant. I'm here to support your AI internship. How are you doing today?", 'bot');
        // We wait a bit before showing options so the user has time to answer "How are you"
    }, 500);
};