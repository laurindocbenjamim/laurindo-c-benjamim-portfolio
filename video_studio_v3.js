document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components
    const uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
    const uploadTabs = new bootstrap.Tab(document.getElementById('uploadTabs'));
    
    // DOM elements
    const uploadBtn = document.getElementById('uploadBtn');
    const submitUpload = document.getElementById('submitUpload');
    const mediaFilesInput = document.getElementById('mediaFiles');
    const videoPlayer = document.getElementById('videoPlayer');
    const audioPlayer = document.getElementById('audioPlayer');
    const textContainer = document.getElementById('textContainer');
    const videoContainer = document.getElementById('videoContainer');
    const audioSection = document.getElementById('audioSection');
    const textSection = document.getElementById('textSection');
    const urlUploadForm = document.getElementById('urlUploadForm');
    const urlLoadingIndicator = document.getElementById('urlLoadingIndicator');
    const urlErrorMessage = document.getElementById('urlErrorMessage');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    // Track current active tab
    let currentTab = 'file';
    
    // Tab change event
    document.getElementById('uploadTabs').addEventListener('shown.bs.tab', function(event) {
        currentTab = event.target.id.split('-')[0]; // 'file' or 'url'
    });
    
    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggle = sidebarToggle.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnToggle && window.innerWidth < 992) {
            sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    });
    
    // Open modal when upload button is clicked
    uploadBtn.addEventListener('click', function() {
        uploadModal.show();
    });
    
    // Handle form submission based on active tab
    submitUpload.addEventListener('click', function() {
        if (currentTab === 'file') {
            handleFileUpload();
        } else {
            handleUrlUpload();
        }
    });
    
    function handleFileUpload() {
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
        document.getElementById('uploadForm').reset();
    }
    
    async function handleUrlUpload() {
        const url = document.getElementById('mediaUrl').value.trim();
        const urlType = document.getElementById('urlType').value;
        const autoPlay = document.getElementById('urlAutoPlay').checked;
        
        if (!url) {
            showUrlError('Please enter a valid URL');
            return;
        }
        
        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            showUrlError('Please enter a valid URL');
            return;
        }
        
        // Show loading indicator
        urlLoadingIndicator.classList.add('active');
        urlErrorMessage.textContent = '';
        
        try {
            if (urlType === 'text') {
                await loadTextFromUrl(url);
            } else {
                await loadMediaFromUrl(url, urlType, autoPlay);
            }
            uploadModal.hide();
            urlUploadForm.reset();
        } catch (error) {
            console.error('Error loading from URL:', error);
            showUrlError('Failed to load media from URL. Please check the URL and try again.');
        } finally {
            urlLoadingIndicator.classList.remove('active');
        }
    }
    
    async function loadMediaFromUrl(url, type, autoPlay) {
        try { alert("From UL")
            // In a real application, you would call your API endpoint here
            // For demonstration, we'll simulate an API call with a timeout
            urlLoadingIndicator.querySelector('p').textContent = 'Fetching media from API...';
            
            // Simulate API request delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // This is where you would normally make the actual API call:
            // const response = await fetch('/api/load-media', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ url, type })
            // });
            // 
            // if (!response.ok) throw new Error('API request failed');
            // const mediaData = await response.json();
            
            // For demo purposes, we'll just use the URL directly
            if (type === 'video') {
                videoPlayer.classList.remove('d-none');
                videoContainer.querySelector('.empty-state').classList.add('d-none');
                
                videoPlayer.src = url;
                videoPlayer.load();
                
                if (autoPlay) {
                    try {
                        await videoPlayer.play();
                    } catch (e) {
                        console.log('Autoplay prevented:', e);
                    }
                }
                
                addVideoControls();
            } else if (type === 'audio') {
                audioSection.classList.remove('d-none');
                audioPlayer.src = url;
                audioPlayer.load();
                addAudioControls();
            }
        } catch (error) {
            console.error('Error loading media:', error);
            throw error;
        }
    }
    
    async function loadTextFromUrl(url) {
        try {
            urlLoadingIndicator.querySelector('p').textContent = 'Fetching text content...';
            
            // Simulate API request delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // In a real app, you might want to proxy this through your API
            // const response = await fetch('/api/load-text', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ url })
            // });
            // 
            // if (!response.ok) throw new Error('API request failed');
            // const textData = await response.json();
            
            // For demo, we'll fetch directly (note CORS limitations)
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const text = await response.text();
            
            textSection.classList.remove('d-none');
            textContainer.textContent = text;
        } catch (error) {
            console.error('Error loading text:', error);
            throw error;
        }
    }
    
    function showUrlError(message) {
        urlErrorMessage.textContent = message;
    }
    
    function handleVideoUpload(file, autoPlay) {
        const videoURL = URL.createObjectURL(file);
        alert("From Upload file")
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
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992) {
            sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    });
    
    // Custom right-click menu prevention for video (except for our speed control)
    document.addEventListener('contextmenu', function(e) {
        if (e.target === videoPlayer) {
            return; // Let our speed control work
        }
        e.preventDefault();
    }, false);
});