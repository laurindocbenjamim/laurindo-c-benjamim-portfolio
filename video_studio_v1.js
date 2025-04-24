document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap modal
    const uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
    const uploadBtn = document.getElementById('uploadBtn');
    const submitUpload = document.getElementById('submitUpload');
    const mediaFilesInput = document.getElementById('mediaFiles');
    const videoPlayer = document.getElementById('videoPlayer');
    const audioPlayer = document.getElementById('audioPlayer');
    const textContainer = document.getElementById('textContainer');
    const videoContainer = document.getElementById('videoContainer');
    const audioSection = document.getElementById('audioSection');
    const textSection = document.getElementById('textSection');
    
    // Open modal when upload button is clicked
    uploadBtn.addEventListener('click', function() {
        uploadModal.show();
    });
    
    // Handle file upload
    submitUpload.addEventListener('click', function() {
        const files = mediaFilesInput.files;
        const autoPlay = document.getElementById('autoPlay').checked;
        
        if (files.length === 0) {
            alert('Please select at least one file to upload');
            return;
        }
        
        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileType = file.type.split('/')[0];
            
            if (fileType === 'video') {
                handleVideoUpload(file, autoPlay);
            } else if (fileType === 'audio') {
                handleAudioUpload(file);
            } else if (file.type === 'text/plain') {
                handleTextUpload(file);
            } else {
                console.log('Unsupported file type:', file.type);
            }
        }
        
        uploadModal.hide();
        // Reset form
        document.getElementById('uploadForm').reset();
    });
    
    function handleVideoUpload(file, autoPlay) {
        const videoURL = URL.createObjectURL(file);
        
        // Show video player and hide empty state
        videoPlayer.classList.remove('d-none');
        videoContainer.querySelector('.empty-state').classList.add('d-none');
        
        videoPlayer.src = videoURL;
        videoPlayer.load();
        
        if (autoPlay) {
            videoPlayer.play().catch(e => console.log('Autoplay prevented:', e));
        }
        
        // Add video controls
        addVideoControls();
    }
    
    function handleAudioUpload(file) {
        const audioURL = URL.createObjectURL(file);
        
        // Show audio section
        audioSection.classList.remove('d-none');
        
        audioPlayer.src = audioURL;
        audioPlayer.load();
        
        // Add audio controls event listeners
        addAudioControls();
    }
    
    function handleTextUpload(file) {
        // Show text section
        textSection.classList.remove('d-none');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            textContainer.textContent = e.target.result;
        };
        reader.readAsText(file);
    }
    
    function addVideoControls() {
        // Speed control
        const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
        let currentSpeedIndex = 2; // Default to 1.0
        
        // Add event listener for speed control if not already added
        if (!videoPlayer.hasAttribute('data-speed-control-added')) {
            videoPlayer.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;
                videoPlayer.playbackRate = speedOptions[currentSpeedIndex];
                
                // Show speed indicator
                const indicator = document.createElement('div');
                indicator.className = 'speed-indicator';
                indicator.textContent = speedOptions[currentSpeedIndex] + 'x';
                videoContainer.appendChild(indicator);
                
                setTimeout(() => {
                    indicator.remove();
                }, 1000);
            });
            
            videoPlayer.setAttribute('data-speed-control-added', 'true');
        }
    }
    
    function addAudioControls() {
        const speedControl = document.querySelector('.audio-controls .speed-control');
        const repeatControl = document.querySelector('.audio-controls .repeat-control');
        const muteControl = document.querySelector('.audio-controls .mute-control');
        
        const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
        let currentSpeedIndex = 2; // Default to 1.0
        let isRepeating = false;
        
        // Speed control
        speedControl.addEventListener('click', function() {
            currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;
            audioPlayer.playbackRate = speedOptions[currentSpeedIndex];
            speedControl.textContent = speedOptions[currentSpeedIndex] + 'x';
        });
        
        // Repeat control
        repeatControl.addEventListener('click', function() {
            isRepeating = !isRepeating;
            audioPlayer.loop = isRepeating;
            repeatControl.classList.toggle('active', isRepeating);
        });
        
        // Mute control
        muteControl.addEventListener('click', function() {
            audioPlayer.muted = !audioPlayer.muted;
            if (audioPlayer.muted) {
                muteControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else {
                muteControl.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        });
    }
    
    // Custom right-click menu prevention for video (except for our speed control)
    document.addEventListener('contextmenu', function(e) {
        if (e.target === videoPlayer) {
            return; // Let our speed control work
        }
        e.preventDefault();
    }, false);
});