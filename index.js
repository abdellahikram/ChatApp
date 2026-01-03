src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"
src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"
// Base de données des utilisateurs (côté client)
const users = {
    '0562871191': {
        password: 'AbdallahIkram',
        name: 'Abdallah',
        partnerId: '0655843146'
    },
    '0655843146': {
        password: 'AbdallahIkram',
        name: 'Ikram',
        partnerId: '0562871191'
    }
};

let currentUser = null;
let messages = [];

// Vérification de l'étape 1 (numéro et mot de passe)
function checkStep1() {
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value;
    const error1 = document.getElementById('error1');

    if (!phoneNumber || !password) {
        error1.textContent = 'يرجى ملء جميع الحقول';
        error1.classList.remove('hidden');
        return;
    }

    const user = users[phoneNumber];
    
    if (!user || user.password !== password) {
        error1.textContent = 'رقم الهاتف أو كلمة السر غير صحيحة';
        error1.classList.remove('hidden');
        return;
    }

    // Stockage temporaire de l'utilisateur
    currentUser = phoneNumber;
    
    // Passage à l'étape 2
    document.getElementById('step1Page').classList.add('hidden');
    document.getElementById('step2Page').classList.remove('hidden');
    error1.classList.add('hidden');
}

// Vérification de l'étape 2 (question de sécurité)
function checkStep2() {
    const securityAnswer = document.getElementById('securityAnswer').value.trim().toLowerCase();
    const error2 = document.getElementById('error2');

    if (!securityAnswer) {
        error2.textContent = 'يرجى إدخال الإجابة';
        error2.classList.remove('hidden');
        return;
    }

    const user = users[currentUser];
    
    if (securityAnswer !== user.securityAnswer) {
        error2.textContent = 'الإجابة غير صحيحة';
        error2.classList.remove('hidden');
        return;
    }

    // Connexion réussie - Charger le chat
    loadChat();
    document.getElementById('step2Page').classList.add('hidden');
    document.getElementById('chatPage').classList.remove('hidden');
    error2.classList.add('hidden');
}

// Charger la conversation
function loadChat() {
    const user = users[currentUser];
    document.getElementById('chatTitle').textContent = `💑 Conversation avec ${users[user.partnerId].name}`;
    
    // Charger les messages depuis le localStorage
    const storageKey = getStorageKey(currentUser, user.partnerId);
    const savedMessages = localStorage.getItem(storageKey);
    
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
        displayMessages();
    }
}

// Obtenir la clé de stockage unique pour la conversation
function getStorageKey(userId1, userId2) {
    const ids = [userId1, userId2].sort();
    return `chat_${ids[0]}_${ids[1]}`;
}

// Afficher les messages
function displayMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(msg.sender === currentUser ? 'sent' : 'received');
        
        if (msg.type === 'text') {
            messageDiv.textContent = msg.content;
        } else if (msg.type === 'file') {
            const mediaElement = msg.content.startsWith('data:image') 
                ? `<img src="${msg.content}" style="max-width: 200px; border-radius: 8px;">`
                : `<video src="${msg.content}" controls style="max-width: 200px; border-radius: 8px;"></video>`;
            messageDiv.innerHTML = mediaElement;
        }
        
        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        timeSpan.textContent = msg.time;
        messageDiv.appendChild(timeSpan);
        
        messagesContainer.appendChild(messageDiv);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Envoyer un message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    const message = {
        sender: currentUser,
        type: 'text',
        content: messageText,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    
    messages.push(message);
    saveMessages();
    displayMessages();
    messageInput.value = '';
}

// Envoyer un fichier
function sendFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const message = {
            sender: currentUser,
            type: 'file',
            content: e.target.result,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        
        messages.push(message);
        saveMessages();
        displayMessages();
        fileInput.value = '';
    };
    
    reader.readAsDataURL(file);
}

// Sauvegarder les messages
function saveMessages() {
    const user = users[currentUser];
    const storageKey = getStorageKey(currentUser, user.partnerId);
    localStorage.setItem(storageKey, JSON.stringify(messages));
}

// Gérer la touche Entrée
function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Déconnexion
function logout() {
    currentUser = null;
    messages = [];
    
    document.getElementById('chatPage').classList.add('hidden');
    document.getElementById('step1Page').classList.remove('hidden');
    
    document.getElementById('phoneNumber').value = '';
    document.getElementById('password').value = '';
    document.getElementById('securityAnswer').value = '';
}
