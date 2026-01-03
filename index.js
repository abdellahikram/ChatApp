src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"
src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"
const firebaseConfig = {
            apiKey: "AIzaSyB4vxC_E77us7W8ZResF-QztxsYtd_jIXw",
            authDomain: "caller-n8fa5t.firebaseapp.com",
            databaseURL: "https://caller-n8fa5t-default-rtdb.firebaseio.com",
            projectId: "caller-n8fa5t",
            storageBucket: "caller-n8fa5t.firebasestorage.app",
            messagingSenderId: "555965049878",
            appId: "1:555965049878:web:6e64d012a64e02c1bc1937",
        };

        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        const storage = firebase.storage();

        let currentUser = null;

        // بيانات المستخدمين المصرح لهم
        const authorizedUsers = {
            "0123456789": "password123",  // غير هذا برقمك وكلمة السر الحقيقية
            "0987654321": "password456"   // رقم الزوجة وكلمة السر
        };

        const correctAnswer = "سعاد و نبيلة";

        function checkStep1() {
            const phone = document.getElementById('phoneNumber').value.trim();
            const password = document.getElementById('password').value;
            const error1 = document.getElementById('error1');

            if (!phone || !password) {
                error1.textContent = "الرجاء إدخال الرقم وكلمة السر";
                error1.classList.remove('hidden');
                return;
            }

            if (authorizedUsers[phone] && authorizedUsers[phone] === password) {
                currentUser = phone;
                error1.classList.add('hidden');
                document.getElementById('step1Page').classList.add('hidden');
                document.getElementById('step2Page').classList.remove('hidden');
            } else {
                error1.textContent = "رقم أو كلمة سر غير صحيحة";
                error1.classList.remove('hidden');
            }
        }

        function checkStep2() {
            const answer = document.getElementById('securityAnswer').value.trim();
            const error2 = document.getElementById('error2');

            if (answer === correctAnswer) {
                error2.classList.add('hidden');
                document.getElementById('step2Page').classList.add('hidden');
                document.getElementById('chatPage').classList.remove('hidden');
                loadMessages();
            } else {
                error2.textContent = "إجابة خاطئة! سيتم إغلاق التطبيق";
                error2.classList.remove('hidden');
                
                setTimeout(() => {
                    window.close();
                    window.location.href = 'about:blank';
                }, 2000);
            }
        }

        function logout() {
            currentUser = null;
            document.getElementById('chatPage').classList.add('hidden');
            document.getElementById('step1Page').classList.remove('hidden');
            document.getElementById('phoneNumber').value = '';
            document.getElementById('password').value = '';
            document.getElementById('securityAnswer').value = '';
        }

        function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const text = messageInput.value.trim();
            
            if (text && currentUser) {
                database.ref('messages').push({
                    text: text,
                    sender: currentUser,
                    timestamp: Date.now(),
                    type: 'text'
                });
                messageInput.value = '';
            }
        }

        function sendFile() {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            
            if (file && currentUser) {
                const storageRef = storage.ref('files/' + Date.now() + '_' + file.name);
                const uploadTask = storageRef.put(file);
                
                uploadTask.on('state_changed',
                    (snapshot) => {},
                    (error) => {
                        alert('Erreur lors du téléchargement du fichier');
                    },
                    () => {
                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            database.ref('messages').push({
                                fileURL: downloadURL,
                                fileType: file.type.startsWith('image') ? 'image' : 'video',
                                sender: currentUser,
                                timestamp: Date.now(),
                                type: 'file'
                            });
                        });
                    }
                );
                fileInput.value = '';
            }
        }

        function loadMessages() {
            const messagesRef = database.ref('messages');
            messagesRef.on('child_added', (snapshot) => {
                const message = snapshot.val();
                displayMessage(message);
            });
        }

        function displayMessage(message) {
            const messagesContainer = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            const isSent = message.sender === currentUser;
            
            messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
            
            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            
            if (!isSent) {
                const senderName = document.createElement('div');
                senderName.className = 'message-sender';
                senderName.textContent = message.sender;
                bubble.appendChild(senderName);
            }
            
            if (message.type === 'text') {
                const textContent = document.createElement('div');
                textContent.textContent = message.text;
                bubble.appendChild(textContent);
            } else if (message.type === 'file') {
                if (message.fileType === 'image') {
                    const img = document.createElement('img');
                    img.src = message.fileURL;
                    bubble.appendChild(img);
                } else if (message.fileType === 'video') {
                    const video = document.createElement('video');
                    video.src = message.fileURL;
                    video.controls = true;
                    bubble.appendChild(video);
                }
            }
            
            const time = document.createElement('div');
            time.className = 'message-time';
            time.textContent = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            bubble.appendChild(time);
            
            messageDiv.appendChild(bubble);
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function handleEnter(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }