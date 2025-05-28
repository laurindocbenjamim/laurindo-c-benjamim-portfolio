document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const videoUpload = document.getElementById('videoUpload');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoPlaceholder = document.getElementById('videoPlaceholder');
    const videoInfo = document.getElementById('videoInfo');
    const videoFileName = document.getElementById('videoFileName');
    const videoFileSize = document.getElementById('videoFileSize');
    const processBtn = document.getElementById('processBtn');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const progressBar = document.getElementById('progressBar');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const dubbingControls = document.getElementById('dubbingControls');
    const uploadArea = document.querySelector('.upload-area');
    
    // Audio Recording Elements
    const startRecordBtn = document.getElementById('startRecord');
    const pauseRecordBtn = document.getElementById('pauseRecord');
    const stopRecordBtn = document.getElementById('stopRecord');
    const recordingIndicator = document.getElementById('recordingIndicator');
    const recordingTime = document.getElementById('recordingTime');
    const tracksContainer = document.getElementById('tracksContainer');
    
    // Audio Recording Variables
    let mediaRecorder;
    let audioChunks = [];
    let recordingStartTime;
    let recordingTimer;
    let audioContext;
    let analyser;
    let canvasCtx;
    let isRecordingPaused = false;
    let pauseStartTime;
    let totalPausedTime = 0;
    let activeAudioElement = null;

    // Video Player Event Listeners
    videoUpload.addEventListener('change', handleVideoUpload);
    uploadArea.addEventListener('click', () => videoUpload.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    processBtn.addEventListener('click', processVideo);
    playBtn.addEventListener('click', playVideo);
    pauseBtn.addEventListener('click', pauseVideo);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    videoPlayer.addEventListener('timeupdate', updateProgressBar);
    videoPlayer.addEventListener('loadedmetadata', setVideoDuration);
    videoPlayer.addEventListener('play', () => {
        playBtn.classList.add('d-none');
        pauseBtn.classList.remove('d-none');
    });
    videoPlayer.addEventListener('pause', () => {
        pauseBtn.classList.add('d-none');
        playBtn.classList.remove('d-none');
    });
    
    // Audio Recording Event Listeners
    startRecordBtn.addEventListener('click', startRecording);
    pauseRecordBtn.addEventListener('click', togglePauseRecording);
    stopRecordBtn.addEventListener('click', stopRecording);

    // Video Player Functions
    function handleVideoUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.includes('video')) {
            displayVideoInfo(file);
            loadVideo(file);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#4361ee';
        uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#4a4a4a';
        uploadArea.style.backgroundColor = '';
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        handleDragLeave(e);
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.includes('video')) {
            displayVideoInfo(file);
            loadVideo(file);
            videoUpload.files = e.dataTransfer.files;
        }
    }

    function displayVideoInfo(file) {
        videoFileName.textContent = file.name;
        videoFileSize.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        videoInfo.classList.remove('d-none');
    }

    function loadVideo(file) {
        const videoURL = URL.createObjectURL(file);
        videoPlayer.src = videoURL;
        videoPlaceholder.classList.add('d-none');
        videoPlayer.classList.remove('d-none');
        dubbingControls.classList.remove('d-none');
    }

    function processVideo() {
        // Simulate processing
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Processing...';
        processBtn.disabled = true;
        
        setTimeout(() => {
            processBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i> Processed';
            setTimeout(() => {
                processBtn.innerHTML = '<i class="fas fa-play-circle me-2"></i> Process Video';
                processBtn.disabled = false;
            }, 2000);
        }, 3000);
    }

    function playVideo() {
        videoPlayer.play();
    }

    function pauseVideo() {
        videoPlayer.pause();
    }

    function updateProgressBar() {
        const percent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentTime.textContent = formatTime(videoPlayer.currentTime);
    }

    function setVideoDuration() {
        duration.textContent = formatTime(videoPlayer.duration);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Audio Recording Functions
    function startRecording() {
        // Reset previous recording if any
        audioChunks = [];
        totalPausedTime = 0;
        
        // Update UI
        startRecordBtn.disabled = true;
        stopRecordBtn.disabled = false;
        pauseRecordBtn.disabled = false;
        recordingIndicator.classList.remove('d-none');
        
        // Start timer
        recordingStartTime = Date.now();
        updateRecordingTime();
        recordingTimer = setInterval(updateRecordingTime, 1000);
        
        // Initialize audio context and analyzer for visualization
        initAudioVisualizer();
        
        // Start recording
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                
                // Setup audio visualization
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                visualizeAudio();
                
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                
                mediaRecorder.onstop = () => {
                    saveRecording();
                    stream.getTracks().forEach(track => track.stop());
                };
                
                mediaRecorder.start(100); // Collect data every 100ms
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
                alert('Could not access microphone. Please check permissions.');
                resetRecordingUI();
            });
    }

    function togglePauseRecording() {
        if (!mediaRecorder) return;
        
        if (isRecordingPaused) {
            // Resume recording
            mediaRecorder.resume();
            totalPausedTime += Date.now() - pauseStartTime;
            pauseRecordBtn.innerHTML = '<i class="fas fa-pause"></i>';
            pauseRecordBtn.classList.remove('btn-secondary');
            pauseRecordBtn.classList.add('btn-warning');
            isRecordingPaused = false;
        } else {
            // Pause recording
            mediaRecorder.pause();
            pauseStartTime = Date.now();
            pauseRecordBtn.innerHTML = '<i class="fas fa-play"></i>';
            pauseRecordBtn.classList.remove('btn-warning');
            pauseRecordBtn.classList.add('btn-secondary');
            isRecordingPaused = true;
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        resetRecordingUI();
        clearInterval(recordingTimer);
    }

    function updateRecordingTime() {
        const elapsed = Date.now() - recordingStartTime - totalPausedTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        recordingTime.textContent = 
            `${minutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds}`;
    }

    function resetRecordingUI() {
        startRecordBtn.disabled = false;
        stopRecordBtn.disabled = true;
        pauseRecordBtn.disabled = true;
        recordingIndicator.classList.add('d-none');
        pauseRecordBtn.innerHTML = '<i class="fas fa-pause"></i>';
        pauseRecordBtn.classList.remove('btn-secondary');
        pauseRecordBtn.classList.add('btn-warning');
        isRecordingPaused = false;
    }

    function saveRecording() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const recordingDuration = (Date.now() - recordingStartTime - totalPausedTime) / 1000;
        
        // Create track element
        const trackId = 'track-' + Date.now();
        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        trackElement.id = trackId;
        trackElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Audio Track</strong>
                    <span class="text-muted ms-2">${formatTime(recordingDuration)}</span>
                </div>
                <div class="track-controls">
                    <button class="btn btn-sm btn-outline-info play-track" data-id="${trackId}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning ms-1 edit-track" data-id="${trackId}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary ms-1 download-track" data-id="${trackId}">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1 delete-track" data-id="${trackId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="track-progress">
                <div class="track-progress-bar" id="progress-${trackId}"></div>
            </div>
            <div class="waveform-container" id="waveform-${trackId}">
                <div class="waveform-progress" id="waveform-progress-${trackId}"></div>
                <audio src="${audioUrl}" preload="auto" class="d-none"></audio>
            </div>
        `;
        
        // Add to tracks container
        const emptyState = tracksContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        tracksContainer.prepend(trackElement);
        
        // Initialize waveform visualization
        initWaveform(trackId, audioUrl);
        
        // Add event listeners
        const audioElement = trackElement.querySelector('audio');
        const progressBar = document.getElementById(`progress-${trackId}`);
        const waveformProgress = document.getElementById(`waveform-progress-${trackId}`);
        const waveformContainer = document.getElementById(`waveform-${trackId}`);
        const trackProgress = trackElement.querySelector('.track-progress');
        
        // Click to seek functionality
        waveformContainer.addEventListener('click', (e) => {
            if (!audioElement.duration) return;
            
            const rect = waveformContainer.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            const seekTime = clickPosition * audioElement.duration;
            
            audioElement.currentTime = seekTime;
            
            if (audioElement.paused) {
                togglePlayTrack(trackId);
            }
        });
        
        trackProgress.addEventListener('click', (e) => {
            if (!audioElement.duration) return;
            
            const rect = trackProgress.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            const seekTime = clickPosition * audioElement.duration;
            
            audioElement.currentTime = seekTime;
            
            if (audioElement.paused) {
                togglePlayTrack(trackId);
            }
        });
        
        // Progress update during playback
        audioElement.addEventListener('timeupdate', () => {
            if (!audioElement.duration) return;
            
            const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            waveformProgress.style.width = `${progressPercent}%`;
        });
        
        // Add event listeners for track controls
        trackElement.querySelector('.play-track').addEventListener('click', () => togglePlayTrack(trackId));
        trackElement.querySelector('.edit-track').addEventListener('click', () => openEditModal(trackId));
        trackElement.querySelector('.download-track').addEventListener('click', () => downloadTrack(trackId));
        trackElement.querySelector('.delete-track').addEventListener('click', () => deleteTrack(trackId));
    }
    
    function downloadTrack(trackId) {
        const trackElement = document.getElementById(trackId);
        const audioElement = trackElement.querySelector('audio');
        const audioUrl = audioElement.src;
        
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `audio-track-${trackId}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    function openEditModal(trackId) {
        const trackElement = document.getElementById(trackId);
        const audioElement = trackElement.querySelector('audio');
        
        // Store reference to current track
        currentEditingTrack = trackId;
        
        // Initialize modal waveform (simplified for demo)
        const modalWaveform = document.getElementById('modalWaveform');
        const modalProgress = document.getElementById('modalWaveformProgress');
        
        // Clear previous content
        modalWaveform.innerHTML = '';
        modalProgress.style.width = '0%';
        
        // Create canvas for waveform visualization
        const canvas = document.createElement('canvas');
        canvas.width = modalWaveform.offsetWidth;
        canvas.height = 100;
        modalWaveform.appendChild(canvas);
        
        // Draw simplified waveform
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(67, 97, 238, 0.7)';
        for (let i = 0; i < canvas.width; i += 3) {
            const randomHeight = Math.random() * 60 + 20;
            ctx.fillRect(i, (canvas.height - randomHeight) / 2, 2, randomHeight);
        }
        
        // Setup modal event listeners
        document.getElementById('previewEditBtn').onclick = () => {
            // In a real app, this would apply the effects temporarily for preview
            alert('Preview would play audio with applied effects (not implemented in demo)');
        };
        
        document.getElementById('applyEditBtn').onclick = () => {
            // In a real app, this would process the audio with selected effects
            alert('Effects would be applied to audio (not implemented in demo)');
            bootstrap.Modal.getInstance(document.getElementById('audioEditModal')).hide();
        };
        
        // Click to seek in modal
        modalWaveform.addEventListener('click', (e) => {
            if (!audioElement.duration) return;
            
            const rect = modalWaveform.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            const seekTime = clickPosition * audioElement.duration;
            
            audioElement.currentTime = seekTime;
            modalProgress.style.width = `${clickPosition * 100}%`;
            
            if (audioElement.paused) {
                audioElement.play();
            }
        });
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('audioEditModal'));
        modal.show();
    }
    
    // Update the editTrack function
    function editTrack(trackId) {
        openEditModal(trackId);
    }

    
    function togglePlayTrack(trackId) {
        const trackElement = document.getElementById(trackId);
        const audioElement = trackElement.querySelector('audio');
        const playButton = trackElement.querySelector('.play-track');
        
        // Stop any currently playing audio
        if (activeAudioElement && activeAudioElement !== audioElement) {
            activeAudioElement.pause();
            const activeTrackId = activeAudioElement.closest('.track-item').id;
            document.querySelector(`.play-track[data-id="${activeTrackId}"]`).innerHTML = '<i class="fas fa-play"></i>';
            document.getElementById(activeTrackId).classList.remove('active');
        }
        
        if (audioElement.paused) {
            audioElement.play()
                .then(() => {
                    playButton.innerHTML = '<i class="fas fa-pause"></i>';
                    trackElement.classList.add('active');
                    activeAudioElement = audioElement;
                    
                    // Handle when audio ends
                    audioElement.onended = () => {
                        playButton.innerHTML = '<i class="fas fa-play"></i>';
                        trackElement.classList.remove('active');
                        activeAudioElement = null;
                    };
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    alert('Error playing audio. Please try again.');
                });
        } else {
            audioElement.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            trackElement.classList.remove('active');
            activeAudioElement = null;
        }
    }

    function editTrack(trackId) {
        // In a real app, this would open an editor for the track
        alert(`Editing track ${trackId}`);
    }

    function deleteTrack(trackId) {
        if (confirm('Are you sure you want to delete this track?')) {
            const trackElement = document.getElementById(trackId);
            const audioElement = trackElement.querySelector('audio');
            
            // Stop if this track is currently playing
            if (activeAudioElement === audioElement) {
                audioElement.pause();
                activeAudioElement = null;
            }
            
            trackElement.remove();
            
            // Show empty state if no tracks left
            if (tracksContainer.children.length === 0) {
                tracksContainer.innerHTML = `
                    <div class="empty-state text-center py-4 text-muted">
                        <i class="fas fa-wave-square fa-3x mb-3"></i>
                        <p>No audio tracks recorded yet</p>
                    </div>
                `;
            }
        }
    }

    function initAudioVisualizer() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        const canvas = document.getElementById('audioVisualizer');
        canvasCtx = canvas.getContext('2d');
    }

    function visualizeAudio() {
        if (!analyser) return;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            requestAnimationFrame(draw);
            
            analyser.getByteFrequencyData(dataArray);
            
            const canvas = document.getElementById('audioVisualizer');
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2;
                
                canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };
        
        draw();
    }

    function initWaveform(trackId, audioUrl) {
        // In a real app, you would use a library like Wavesurfer.js
        // This is a simplified visualization
        const canvas = document.createElement('canvas');
        const container = document.getElementById(`waveform-${trackId}`);
        canvas.width = container.offsetWidth;
        canvas.height = 50;
        canvas.style.width = '100%';
        canvas.style.height = '50px';
        const ctx = canvas.getContext('2d');
        
        container.appendChild(canvas);
        
        // Simple static waveform for demo purposes
        ctx.fillStyle = 'rgba(67, 97, 238, 0.7)';
        for (let i = 0; i < canvas.width; i += 3) {
            const randomHeight = Math.random() * 30 + 5;
            ctx.fillRect(i, (canvas.height - randomHeight) / 2, 2, randomHeight);
        }
    }

    // Initialize
    videoPlayer.classList.add('d-none');
});