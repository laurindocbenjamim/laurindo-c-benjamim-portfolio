document.addEventListener('DOMContentLoaded', function() {


    // DOM elements
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const waveform = document.getElementById('waveform');
    const noAudio = document.getElementById('noAudio');
    const recordedAudioPlayer = document.getElementById('recordedAudioPlayer');
    const recordingIndicator = document.querySelector('.recording-indicator');
    const audioUpload = document.getElementById('audioUpload');
    const playUploadedBtn = document.getElementById('playUploadedBtn');
    const uploadedAudioPlayer = document.getElementById('uploadedAudioPlayer');
    const streamingToggle = document.getElementById('streamingToggle');
    const streamingOptions = document.getElementById('streamingOptions');
    const chunkSizeInput = document.getElementById('chunkSize');
    const chunkAlert = document.getElementById('chunkAlert');
    const chunkSizeDisplay = document.getElementById('chunkSizeDisplay');
    
    // Audio variables
    let audioContext;
    let analyser;
    let microphone;
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    let isStreaming = false;
    let animationId;
    const barCount = 20;
    

     // Check if user is logged in
     const isLoggedIn = localStorage.getItem('user_id');
     if (!isLoggedIn || isLoggedIn === 0 || isLoggedIn === null || isLoggedIn === undefined) {
         // Hide login button
         document.getElementById('login').style.display = 'block';
         document.getElementById('register').style.display = 'block';
         document.getElementById('isLoggedOut').style.display = 'none';
         // Redirect to login page
         alert('You are not logged in. Please log in to access this feature.');
         localStorage.clear();
         localStorage.setItem('denyed_page', 'convert-speech-to-text.html');
         alert(localStorage.getItem('denyed_page'))
         window.location.href = '../new_login.html';
     }
     
    // Create waveform bars
    function createWaveformBars() {
        waveform.innerHTML = '';
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'wave-bar';
            bar.style.height = '5px';
            waveform.appendChild(bar);
        }
    }
    
    // Initialize audio context
    async function initAudioContext() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            
            // Create gain node to prevent feedback
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0;
            
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            createWaveformBars();
            return true;
        } catch (error) {
            console.error('AudioContext error:', error);
            return false;
        }
    }
    
    // Show chunk alert
    function showChunkAlert(size) {
        chunkSizeDisplay.textContent = (size / 1024).toFixed(2);
        chunkAlert.style.display = 'block';
        setTimeout(() => {
            chunkAlert.style.display = 'none';
        }, 2000);
    }
    
    // Process audio chunk (simulated backend)
    function processAudioChunk(chunk) {
        console.log('Processing chunk:', chunk.size, 'bytes');
        showChunkAlert(chunk.size);
        
        // In a real app, you would send this to your backend
        // Here we just simulate processing
        return new Promise(resolve => {
            setTimeout(() => {
                const p = document.createElement('p');
                p.textContent = `[Chunk processed] Partial transcription would appear here...`;
                p.className = 'text-info small';
                recordedAudioPlayer.insertAdjacentElement('beforebegin', p);
                resolve();
            }, 500);
        });
    }
    
    // Start recording
    async function startRecording() {
        try {
            if (!audioContext && !(await initAudioContext())) {
                throw new Error('Audio context initialization failed');
            }
            
            isStreaming = streamingToggle.checked;
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    latency: 0
                },
                video: false
            });
            
            // Create new media source and connect to analyzer
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            
            // Setup media recorder
            const options = {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000
            };
            mediaRecorder = new MediaRecorder(stream, options);
            
            mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0) {
                    if (isStreaming) {
                        // Process chunk immediately in streaming mode
                        await processAudioChunk(event.data);
                    } else {
                        // Store chunk for later processing
                        audioChunks.push(event.data);
                    }
                }
            };
            
            mediaRecorder.onstop = () => {
                if (!isStreaming && audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    recordedAudioPlayer.src = audioUrl;
                    
                    // Simulate full audio processing
                    const p = document.createElement('p');
                    p.textContent = `[Full recording processed] Transcription would appear here...`;
                    p.className = 'text-success small';
                    recordedAudioPlayer.insertAdjacentElement('beforebegin', p);
                }
                
                recordedAudioPlayer.style.display = 'block';
                audioChunks = [];
                cancelAnimationFrame(animationId);
            };
            
            // Start recording with appropriate chunk size
            const chunkSize = isStreaming ? parseInt(chunkSizeInput.value) * 1000 : 50;
            mediaRecorder.start(chunkSize);
            
            // Update UI
            isRecording = true;
            recordBtn.disabled = true;
            stopBtn.disabled = false;
            recordingIndicator.style.display = 'flex';
            noAudio.style.display = 'none';
            recordedAudioPlayer.style.display = 'none';
            
            // Clear previous messages
            document.querySelectorAll('.text-info, .text-success').forEach(el => el.remove());
            
            // Start visualization
            visualizeWaveform();
            
        } catch (error) {
            console.error('Recording error:', error);
            alert('Error accessing microphone: ' + error.message);
            stopRecording();
        }
    }
    
    // Visualize waveform
    function visualizeWaveform() {
        if (!isRecording) return;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        const bars = document.querySelectorAll('.wave-bar');
        bars.forEach((bar, i) => {
            const value = dataArray[i % bufferLength] / 255;
            const height = 5 + (value * 60);
            bar.style.height = `${height}px`;
            bar.style.opacity = 0.7 + (value * 0.3);
        });
        
        animationId = requestAnimationFrame(visualizeWaveform);
    }
    
    // Stop recording
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            if (microphone) {
                microphone.disconnect();
            }
            
            isRecording = false;
            recordBtn.disabled = false;
            stopBtn.disabled = true;
            recordingIndicator.style.display = 'none';
            recordBtn.innerHTML = '<i class="fas fa-microphone me-2"></i>Start Recording';
            
            cancelAnimationFrame(animationId);
        }
    }
    
    // Handle file upload
    audioUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('audio.*')) {
            alert('Please select an audio file');
            return;
        }
        
        const audioUrl = URL.createObjectURL(file);
        uploadedAudioPlayer.src = audioUrl;
        playUploadedBtn.disabled = false;
        uploadedAudioPlayer.style.display = 'block';
    });
    
    // Play uploaded audio
    playUploadedBtn.addEventListener('click', function() {
        uploadedAudioPlayer.play();
    });
    
    // Toggle streaming options
    streamingToggle.addEventListener('change', function() {
        isStreaming = this.checked;
        streamingOptions.style.display = isStreaming ? 'block' : 'none';
    });
    
    // Event listeners
    recordBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    
    // Initialize waveform on load
    createWaveformBars();
});