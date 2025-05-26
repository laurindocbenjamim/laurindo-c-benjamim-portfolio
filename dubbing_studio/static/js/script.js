document.addEventListener('DOMContentLoaded', function () {
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

    // Event Listeners
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

    // Functions
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

    // Initialize
    videoPlayer.classList.add('d-none');


    // Add these variables at the top of the script
    let mediaRecorder;
    let audioChunks = [];
    let recordingStartTime;
    let recordingTimer;
    let audioContext;
    let analyser;
    let canvasCtx;
    let isPaused = false;
    let pauseStartTime;
    let totalPausedTime = 0;

    // Add these event listeners in the DOMContentLoaded event
    document.getElementById('startRecord').addEventListener('click', startRecording);
    document.getElementById('pauseRecord').addEventListener('click', togglePauseRecording);
    document.getElementById('stopRecord').addEventListener('click', stopRecording);

    // Add these functions to the script
    function startRecording() {
        // Reset previous recording if any
        audioChunks = [];
        totalPausedTime = 0;

        // Update UI
        document.getElementById('startRecord').disabled = true;
        document.getElementById('stopRecord').disabled = false;
        document.getElementById('pauseRecord').disabled = false;
        document.getElementById('recordingIndicator').classList.remove('d-none');

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

                mediaRecorder.start();
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
                alert('Could not access microphone. Please check permissions.');
                resetRecordingUI();
            });
    }

    function togglePauseRecording() {
        if (isPaused) {
            // Resume recording
            mediaRecorder.resume();
            totalPausedTime += Date.now() - pauseStartTime;
            document.getElementById('pauseRecord').innerHTML = '<i class="fas fa-pause"></i>';
            document.getElementById('pauseRecord').classList.remove('btn-secondary');
            document.getElementById('pauseRecord').classList.add('btn-warning');
        } else {
            // Pause recording
            mediaRecorder.pause();
            pauseStartTime = Date.now();
            document.getElementById('pauseRecord').innerHTML = '<i class="fas fa-play"></i>';
            document.getElementById('pauseRecord').classList.remove('btn-warning');
            document.getElementById('pauseRecord').classList.add('btn-secondary');
        }
        isPaused = !isPaused;
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
        document.getElementById('recordingTime').textContent =
            `${minutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds}`;
    }

    function resetRecordingUI() {
        document.getElementById('startRecord').disabled = false;
        document.getElementById('stopRecord').disabled = true;
        document.getElementById('pauseRecord').disabled = true;
        document.getElementById('recordingIndicator').classList.add('d-none');
        document.getElementById('pauseRecord').innerHTML = '<i class="fas fa-pause"></i>';
        document.getElementById('pauseRecord').classList.remove('btn-secondary');
        document.getElementById('pauseRecord').classList.add('btn-warning');
        isPaused = false;
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
                <button class="btn btn-sm btn-outline-danger ms-1 delete-track" data-id="${trackId}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="waveform-container mt-2" id="waveform-${trackId}">
            <audio src="${audioUrl}" preload="auto" class="d-none"></audio>
        </div>
    `;

        // Add to tracks container
        const tracksContainer = document.getElementById('tracksContainer');
        const emptyState = tracksContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        tracksContainer.prepend(trackElement);

        // Initialize waveform visualization
        initWaveform(trackId, audioUrl);

        // Add event listeners for track controls
        trackElement.querySelector('.play-track').addEventListener('click', () => togglePlayTrack(trackId));
        trackElement.querySelector('.edit-track').addEventListener('click', () => editTrack(trackId));
        trackElement.querySelector('.delete-track').addEventListener('click', () => deleteTrack(trackId));
    }

    function togglePlayTrack(trackId) {
        const trackElement = document.getElementById(trackId);
        const audioElement = trackElement.querySelector('audio');
        const playButton = trackElement.querySelector('.play-track');

        if (audioElement.paused) {
            // Stop all other tracks
            document.querySelectorAll('audio').forEach(audio => {
                if (audio !== audioElement) {
                    audio.pause();
                    const otherTrackId = audio.closest('.track-item').id;
                    document.querySelector(`.play-track[data-id="${otherTrackId}"]`).innerHTML = '<i class="fas fa-play"></i>';
                }
            });

            audioElement.play();
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
            trackElement.classList.add('active');
        } else {
            audioElement.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            trackElement.classList.remove('active');
        }
    }

    function editTrack(trackId) {
        // In a real app, this would open an editor for the track
        alert(`Editing track ${trackId}`);
    }

    function deleteTrack(trackId) {
        if (confirm('Are you sure you want to delete this track?')) {
            document.getElementById(trackId).remove();

            // Show empty state if no tracks left
            const tracksContainer = document.getElementById('tracksContainer');
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
        canvas.width = document.getElementById(`waveform-${trackId}`).offsetWidth;
        canvas.height = 50;
        canvas.style.width = '100%';
        canvas.style.height = '50px';
        const ctx = canvas.getContext('2d');

        document.getElementById(`waveform-${trackId}`).appendChild(canvas);

        // Simple static waveform for demo purposes
        ctx.fillStyle = 'rgba(67, 97, 238, 0.7)';
        for (let i = 0; i < canvas.width; i += 3) {
            const randomHeight = Math.random() * 30 + 5;
            ctx.fillRect(i, (canvas.height - randomHeight) / 2, 2, randomHeight);
        }
    }

});