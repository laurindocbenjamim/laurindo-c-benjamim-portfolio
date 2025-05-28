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
    const mergeTrackSelect = document.getElementById('mergeTrackSelect');

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
    let currentEditingTrack = null;
    let audioTracks = [];


    let audioSource;
    let audioBuffer;
    let audioNodes = {};
    let isModalPlaying = false;
    let modalAudioElement = document.getElementById('modalAudioPlayer');
    let currentProcessedBlob = null;

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
        const selectedTrackId = mergeTrackSelect.value;
        const selectedTrack = audioTracks.find(track => track.id === selectedTrackId);

        // Simulate processing
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Processing...';
        processBtn.disabled = true;

        setTimeout(() => {
            processBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i> Processed';

            if (selectedTrack) {
                alert(`Video will be merged with audio track: ${selectedTrack.name}`);
            } else {
                alert('Video processed with original audio');
            }

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
        const trackId = 'track-' + Date.now();
        const trackName = `Audio Track ${audioTracks.length + 1}`;

        // Create track element
        const trackElement = document.createElement('div');
        
        trackElement.className = 'track-item';
        trackElement.id = trackId;
        trackElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="track-title">${trackName}</span>
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

        // Store track data
        const trackData = {
            id: trackId,
            name: trackName,
            element: trackElement,
            audioUrl: audioUrl,
            duration: recordingDuration
        };

        // To store the original audio blob for editing
        trackData.originalBlob = audioBlob;
        audioTracks.push(trackData);

        // Update merge track dropdown
        updateMergeTrackSelect();

        // Initialize waveform visualization
        initWaveform(trackId, audioUrl);

        // Add event listeners
        const audioElement = trackElement.querySelector('audio');
        const progressBar = document.getElementById(`progress-${trackId}`);
        const waveformProgress = document.getElementById(`waveform-progress-${trackId}`);
        const waveformContainer = document.getElementById(`waveform-${trackId}`);
        const trackProgress = trackElement.querySelector('.track-progress');
        const trackTitle = trackElement.querySelector('.track-title');

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

        // Track name editing
        trackTitle.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentName = trackTitle.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.className = 'track-title-input';

            input.addEventListener('blur', () => {
                const newName = input.value.trim() || currentName;
                trackTitle.textContent = newName;
                trackData.name = newName;
                updateMergeTrackSelect();
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            });

            trackTitle.replaceWith(input);
            input.focus();
        });

        // Add event listeners for track controls
        trackElement.querySelector('.play-track').addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlayTrack(trackId);
        });
        trackElement.querySelector('.edit-track').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(trackId);
        });
        trackElement.querySelector('.download-track').addEventListener('click', (e) => {
            e.stopPropagation();
            downloadTrack(trackId);
        });
        trackElement.querySelector('.delete-track').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTrack(trackId);
        });
    }

    function updateMergeTrackSelect() {
        mergeTrackSelect.innerHTML = '<option value="">None (Original Audio)</option>';
        audioTracks.forEach(track => {
            const option = document.createElement('option');
            option.value = track.id;
            option.textContent = track.name;
            mergeTrackSelect.appendChild(option);
        });
    }

    function downloadTrack(trackId) {
        const track = audioTracks.find(t => t.id === trackId);
        if (!track) return;

        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = track.audioUrl;
        a.download = `${track.name.replace(/\s+/g, '-').toLowerCase()}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Replace the openEditModal function with this:
    function openEditModal(trackId) {
        const track = audioTracks.find(t => t.id === trackId);
        if (!track) return;

        currentEditingTrack = trackId;
        document.getElementById('modalTrackName').textContent = track.name;

        // Reset all effect controls
        document.getElementById('noiseReduction').value = 0;
        document.getElementById('volumeBoost').value = 100;
        document.getElementById('stereoWidth').value = 100;
        document.getElementById('reverbAmount').value = 0;
        document.getElementById('pitchShift').value = 0;
        document.getElementById('playbackSpeed').value = 100;

        // Initialize audio context if not already done
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Load the audio buffer
        fetch(track.audioUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(buffer => {
                audioBuffer = buffer;
                initModalWaveform(buffer);
                setupAudioNodes();
            })
            .catch(error => {
                console.error('Error loading audio:', error);
                alert('Error loading audio for editing');
            });

        // Setup event listeners for modal controls
        document.getElementById('modalPlayBtn').onclick = playModalAudio;
        document.getElementById('modalStopBtn').onclick = stopModalAudio;
        document.getElementById('downloadEditedBtn').onclick = downloadEditedAudio;
        document.getElementById('applyEditBtn').onclick = applyAudioEffects;

        // Setup effect control listeners
        const effectControls = ['noiseReduction', 'volumeBoost', 'stereoWidth', 'reverbAmount', 'pitchShift', 'playbackSpeed'];
        effectControls.forEach(controlId => {
            document.getElementById(controlId).addEventListener('input', updateAudioEffects);
        });

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('audioEditModal'));
        modal.show();

        // Handle modal close
        document.getElementById('audioEditModal').addEventListener('hidden.bs.modal', () => {
            stopModalAudio();
            currentProcessedBlob = null;
        });
    }

    function initModalWaveform(buffer) {
        const modalWaveform = document.getElementById('modalWaveform');
        modalWaveform.innerHTML = '';

        // Create canvas for waveform visualization
        const canvas = document.createElement('canvas');
        canvas.width = modalWaveform.offsetWidth;
        canvas.height = 120;
        modalWaveform.appendChild(canvas);

        // Draw waveform
        const ctx = canvas.getContext('2d');
        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / canvas.width);
        const amp = canvas.height / 2;

        ctx.fillStyle = 'rgba(67, 97, 238, 0.7)';
        for (let i = 0; i < canvas.width; i++) {
            const min = 1.0;
            const max = -1.0;
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
        }
    }

    function setupAudioNodes() {
        // Clear previous nodes
        Object.values(audioNodes).forEach(node => {
            if (node && node.disconnect) node.disconnect();
        });
        audioNodes = {};

        // Create audio nodes
        audioNodes.source = audioContext.createBufferSource();
        audioNodes.source.buffer = audioBuffer;

        audioNodes.gain = audioContext.createGain();
        audioNodes.stereo = audioContext.createStereoPanner();
        audioNodes.compressor = audioContext.createDynamicsCompressor();
        audioNodes.filter = audioContext.createBiquadFilter();
        audioNodes.convolver = audioContext.createConvolver();
        audioNodes.delay = audioContext.createDelay();
        audioNodes.analyser = audioContext.createAnalyser();
        audioNodes.destination = audioContext.destination;

        // Set default values
        audioNodes.gain.gain.value = 1.0;
        audioNodes.stereo.pan.value = 0;
        audioNodes.filter.type = 'highpass';
        audioNodes.filter.frequency.value = 20;
        audioNodes.compressor.threshold.value = -24;
        audioNodes.compressor.knee.value = 30;
        audioNodes.compressor.ratio.value = 12;
        audioNodes.compressor.attack.value = 0.003;
        audioNodes.compressor.release.value = 0.25;

        // Connect nodes
        audioNodes.source.connect(audioNodes.gain);
        audioNodes.gain.connect(audioNodes.stereo);
        audioNodes.stereo.connect(audioNodes.filter);
        audioNodes.filter.connect(audioNodes.compressor);
        audioNodes.compressor.connect(audioNodes.analyser);
        audioNodes.analyser.connect(audioNodes.destination);

        // Setup visualization
        visualizeModalAudio();
    }

    function updateAudioEffects() {
        if (!audioNodes.gain) return;

        // Volume boost (0-200% of original)
        const volumeValue = parseInt(document.getElementById('volumeBoost').value) / 100;
        audioNodes.gain.gain.value = volumeValue;

        // Stereo width (-1 to 1)
        const stereoValue = (parseInt(document.getElementById('stereoWidth').value) - 100) / 100;
        audioNodes.stereo.pan.value = stereoValue;

        // Noise reduction (high-pass filter)
        const noiseReduction = parseInt(document.getElementById('noiseReduction').value);
        audioNodes.filter.frequency.value = 20 + (noiseReduction * 5);

        // Reverb
        const reverbAmount = parseInt(document.getElementById('reverbAmount').value) / 100;
        if (reverbAmount > 0) {
            if (!audioNodes.convolverConnected) {
                audioNodes.compressor.disconnect();
                audioNodes.compressor.connect(audioNodes.convolver);
                audioNodes.convolver.connect(audioNodes.analyser);
                audioNodes.convolverConnected = true;

                // Create impulse response for reverb
                const length = audioContext.sampleRate * 2;
                const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
                const left = impulse.getChannelData(0);
                const right = impulse.getChannelData(1);

                for (let i = 0; i < length; i++) {
                    const n = reverbAmount * 5;
                    left[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, n);
                    right[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, n);
                }

                audioNodes.convolver.buffer = impulse;
            }
        } else if (audioNodes.convolverConnected) {
            audioNodes.compressor.disconnect();
            audioNodes.convolver.disconnect();
            audioNodes.compressor.connect(audioNodes.analyser);
            audioNodes.convolverConnected = false;
        }

        // Pitch shift (using playback rate)
        const pitchValue = parseInt(document.getElementById('pitchShift').value);
        audioNodes.source.playbackRate.value = Math.pow(2, pitchValue / 12);

        // Playback speed (50-200%)
        const speedValue = parseInt(document.getElementById('playbackSpeed').value) / 100;
        audioNodes.source.playbackRate.value = speedValue;
    }

    function playModalAudio() {
        if (isModalPlaying) return;

        // Recreate source node (can only be played once)
        audioNodes.source = audioContext.createBufferSource();
        audioNodes.source.buffer = audioBuffer;
        audioNodes.source.connect(audioNodes.gain);

        // Update effects
        updateAudioEffects();

        // Setup playback tracking
        const startTime = audioContext.currentTime;
        const progressElement = document.getElementById('modalWaveformProgress');
        const duration = audioBuffer.duration / (audioNodes.source.playbackRate.value || 1);

        audioNodes.source.start();
        audioNodes.source.onended = () => {
            isModalPlaying = false;
            document.getElementById('modalPlayBtn').innerHTML = '<i class="fas fa-play"></i> Play';
            progressElement.style.width = '0%';
        };

        isModalPlaying = true;
        document.getElementById('modalPlayBtn').innerHTML = '<i class="fas fa-pause"></i> Pause';

        // Update progress bar
        const updateProgress = () => {
            if (!isModalPlaying) return;

            const elapsed = audioContext.currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            progressElement.style.width = `${progress * 100}%`;

            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            }
        };

        updateProgress();
    }

    function stopModalAudio() {
        if (!isModalPlaying) return;

        if (audioNodes.source) {
            audioNodes.source.stop();
        }
        isModalPlaying = false;
        document.getElementById('modalPlayBtn').innerHTML = '<i class="fas fa-play"></i> Play';
        document.getElementById('modalWaveformProgress').style.width = '0%';
    }

    function visualizeModalAudio() {
        if (!audioNodes.analyser) return;

        const canvas = document.querySelector('#modalWaveform canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const analyser = audioNodes.analyser;

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height;

                ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    }

    function downloadEditedAudio() {
        if (!currentProcessedBlob) {
            alert('Please play the audio first to process it with effects');
            return;
        }

        const track = audioTracks.find(t => t.id === currentEditingTrack);
        if (!track) return;

        const url = URL.createObjectURL(currentProcessedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${track.name}-edited.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    function applyAudioEffects() {
        // In a real implementation, this would apply the effects to the original track
        // For this demo, we'll just show a message
        alert('Audio effects applied to track!');

        // Close the modal
        bootstrap.Modal.getInstance(document.getElementById('audioEditModal')).hide();
    }

    function togglePlayTrack(trackId) {
        const track = audioTracks.find(t => t.id === trackId);
        if (!track) return;

        const trackElement = track.element;
        const audioElement = trackElement.querySelector('audio');
        const playButton = trackElement.querySelector('.play-track');

        // Stop any currently playing audio
        if (activeAudioElement && activeAudioElement !== audioElement) {
            const activeTrack = audioTracks.find(t => t.element.contains(activeAudioElement));
            if (activeTrack) {
                const activePlayButton = activeTrack.element.querySelector('.play-track');
                activeAudioElement.pause();
                activePlayButton.innerHTML = '<i class="fas fa-play"></i>';
                activeTrack.element.classList.remove('active');

                // Reset progress bars
                document.getElementById(`progress-${activeTrack.id}`).style.width = '0%';
                document.getElementById(`waveform-progress-${activeTrack.id}`).style.width = '0%';
            }
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

                        // Reset progress bars
                        document.getElementById(`progress-${trackId}`).style.width = '0%';
                        document.getElementById(`waveform-progress-${trackId}`).style.width = '0%';
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

    function deleteTrack(trackId) {
        if (!confirm('Are you sure you want to delete this track?')) return;

        const trackIndex = audioTracks.findIndex(t => t.id === trackId);
        if (trackIndex === -1) return;

        const track = audioTracks[trackIndex];
        const audioElement = track.element.querySelector('audio');

        // Stop if this track is currently playing
        if (activeAudioElement === audioElement) {
            audioElement.pause();
            activeAudioElement = null;
        }

        // Remove from DOM and array
        track.element.remove();
        audioTracks.splice(trackIndex, 1);

        // Update merge track dropdown
        updateMergeTrackSelect();

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
        const container = document.getElementById(`waveform-${trackId}`);
        const canvas = document.createElement('canvas');
        canvas.width = container.offsetWidth;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');

        container.insertBefore(canvas, container.firstChild);

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